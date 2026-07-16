import { Worker } from "bullmq";
import { redisConnection, isRedisReady } from "../config/redis.js";
import {
  NOTIFICATION_QUEUE_NAME,
  AppointmentConfirmationJob,
} from "./notification.queue.js";

/**
 * "שולח" (בפועל: מדמה שליחה ע"י לוג למסך) מייל/התראה למטופל כשתור נקבע או מבוטל.
 * זהו Worker שמריץ ברקע ומעבד משימות מהתור של BullMQ - כאן המקום האמיתי לחבר
 * שירות מייל/SMS אמיתי (למשל SendGrid / Twilio) בעתיד.
 */
const processNotificationJob = async (job: { name: string; data: AppointmentConfirmationJob }) => {
  const { type, patientId, startTime, appointmentId } = job.data;

  if (type === "appointment-confirmation") {
    console.log(
      `📧 [Notification Queue] Appointment ${appointmentId} confirmed for patient ${patientId} at ${startTime}. Sending confirmation email... ✅`
    );
  } else if (type === "appointment-cancelled") {
    console.log(
      `📧 [Notification Queue] Appointment ${appointmentId} for patient ${patientId} was cancelled. Sending cancellation notice... ✅`
    );
  }
};

let worker: Worker | null = null;

/** מפעיל את ה-Worker רק אם יש חיבור Redis תקין - בונוס, לא דרישת חובה */
export const startNotificationWorker = (): void => {
  if (!isRedisReady() || worker) return;

  worker = new Worker(NOTIFICATION_QUEUE_NAME, processNotificationJob, {
    connection: redisConnection,
  });

  worker.on("failed", (job, err) => {
    console.error(`Notification job ${job?.id} failed:`, err.message);
  });

  console.log("Notification worker started 👷 (listening on Redis queue)");
};
