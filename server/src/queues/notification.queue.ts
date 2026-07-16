import { Queue } from "bullmq";
import { redisConnection, isRedisReady } from "../config/redis.js";

export const NOTIFICATION_QUEUE_NAME = "appointment-notifications";

export interface AppointmentConfirmationJob {
  type: "appointment-confirmation" | "appointment-cancelled";
  appointmentId: string;
  patientId: string;
  therapistId: string;
  startTime: string;
}

export const notificationQueue = new Queue<AppointmentConfirmationJob>(
  NOTIFICATION_QUEUE_NAME,
  { connection: redisConnection }
);

/**
 * מכניס משימת התראה לתור (BullMQ). כשמטופל קובע/מבטל תור, השרת לא שולח מייל/SMS
 * ישירות ובאופן חוסם - הוא רק מכניס "משימה" לתור, וה-Worker (notification.worker.ts)
 * מעבד אותה באופן אסינכרוני ברקע. אם Redis לא זמין, פשוט מדלגים (בונוס, לא דרישת חובה).
 */
export const enqueueAppointmentNotification = async (
  job: AppointmentConfirmationJob
): Promise<void> => {
  if (!isRedisReady()) return;

  try {
    await notificationQueue.add(job.type, job, {
      removeOnComplete: true,
      removeOnFail: 50,
    });
  } catch (err) {
    console.error("Failed to enqueue notification job (non-fatal):", err);
  }
};
