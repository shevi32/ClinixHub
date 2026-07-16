import { Appointment } from "../models/appointment.model.js";
import { redisConnection, isRedisReady } from "../config/redis.js";

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
const SLOT_MINUTES = 60;
const CACHE_TTL_SECONDS = 60; // רשימת השעות הפנויות לא משתנה בכל שנייה - שווה לשמור אותה זמנית ב-Cache

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

const cacheKey = (therapistId: string, date: string) =>
  `available-slots:${therapistId}:${date}`;

/**
 * מחשב את השעות הפנויות של מטפל ביום נתון, ע"י הורדת התורים התפוסים (שלא בוטלו)
 * מטווח שעות העבודה (09:00-17:00, סלוטים של שעה).
 */
const computeAvailableSlots = async (
  therapistId: string,
  date: string
): Promise<AvailableSlot[]> => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const bookedAppointments = await Appointment.find({
    therapistId,
    status: { $ne: "cancelled" },
    startTime: { $lt: dayEnd },
    endTime: { $gt: dayStart },
  }).select("startTime endTime");

  const now = new Date();
  const slots: AvailableSlot[] = [];

  for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
    const slotStart = new Date(dayStart);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_MINUTES);

    if (slotStart <= now) continue; // לא מציגים שעות שכבר עברו

    const overlapsExisting = bookedAppointments.some(
      (apt) => slotStart < apt.endTime && slotEnd > apt.startTime
    );

    if (!overlapsExisting) {
      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
      });
    }
  }

  return slots;
};

/**
 * מחזיר שעות פנויות למטפל ביום נתון - מה-Cache אם קיים, אחרת מחשב מה-DB ושומר ב-Cache.
 */
export const getAvailableSlotsCached = async (
  therapistId: string,
  date: string
): Promise<{ slots: AvailableSlot[]; fromCache: boolean }> => {
  const key = cacheKey(therapistId, date);

  if (isRedisReady()) {
    try {
      const cached = await redisConnection.get(key);
      if (cached) {
        return { slots: JSON.parse(cached), fromCache: true };
      }
    } catch (err) {
      console.error("Redis GET failed, falling back to DB:", err);
    }
  }

  const slots = await computeAvailableSlots(therapistId, date);

  if (isRedisReady()) {
    try {
      await redisConnection.set(key, JSON.stringify(slots), "EX", CACHE_TTL_SECONDS);
    } catch (err) {
      console.error("Redis SET failed (non-fatal):", err);
    }
  }

  return { slots, fromCache: false };
};

/**
 * מבטל תוקף ה-Cache עבור מטפל+יום מסוים. יש לקרוא לזה בכל פעם שתור נוצר/מתעדכן/מבוטל,
 * כדי שמשתמשים אחרים לא יראו שעה "פנויה" שכבר נתפסה בין רגע החישוב לרגע הבקשה הבאה.
 */
export const invalidateAvailableSlotsCache = async (
  therapistId: string,
  date: Date | string
): Promise<void> => {
  if (!isRedisReady()) return;

  const dateStr = new Date(date).toISOString().slice(0, 10);

  try {
    await redisConnection.del(cacheKey(therapistId, dateStr));
  } catch (err) {
    console.error("Redis DEL failed (non-fatal):", err);
  }
};
