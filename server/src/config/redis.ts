import "dotenv/config";
import { Redis } from "ioredis";

/**
 * חיבור Redis משותף - משמש גם ל-Cache (שעות פנויות) וגם ל-BullMQ (תור התראות).
 *
 * חשוב: Redis הוא דרישת "בונוס" בפרויקט הזה, לא דרישת חובה. אם אין שרת Redis
 * זמין (למשל בסביבת פיתוח מקומית בלי Redis מותקן), האפליקציה לא קורסת -
 * ה-Cache וה-Queue פשוט מדלגים על עצמם ופונים ישירות ל-MongoDB במקום.
 */

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let isRedisAvailable = false;
let redisStartupFailed = false;

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: () => null,
});

redisConnection.on("ready", () => {
  if (redisStartupFailed) return;
  isRedisAvailable = true;
  console.log("Redis connected successfully 🚀 (cache + queue enabled)");
});

redisConnection.on("error", (err: Error) => {
  if (isRedisAvailable) {
    console.error("Redis connection error:", err.message);
  }
  isRedisAvailable = false;
});

// מנסים להתחבר פעם אחת באתחול השרת; כישלון לא מפיל את השרת (התכונה היא בונוס)
export const initRedis = async (): Promise<void> => {
  const redisConnectTimeoutMs = 3000;

  try {
    await new Promise<void>((resolve, reject) => {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const cleanup = () => {
        if (timeout) clearTimeout(timeout);
        redisConnection.removeListener("ready", onReady);
        redisConnection.removeListener("end", onEnd);
        redisConnection.removeListener("error", onError);
      };
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onEnd = () => {
        cleanup();
        reject(new Error("Redis connection ended before becoming ready"));
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      redisConnection.once("ready", onReady);
      redisConnection.once("end", onEnd);
      redisConnection.once("error", onError);
      timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Redis connection timed out after ${redisConnectTimeoutMs}ms`));
      }, redisConnectTimeoutMs);

      if (redisConnection.status === "ready") onReady();
      else if (redisConnection.status === "end") onEnd();
      else if (redisConnection.status === "wait") {
        redisConnection.connect().catch(onError);
      }
    });
  } catch {
    isRedisAvailable = false;
    redisStartupFailed = true;
    console.warn(
      "Redis is not available - skipping cache/queue features (this is an optional bonus feature, the app works fine without it)."
    );
  }
};

export const isRedisReady = () =>
  isRedisAvailable && !redisStartupFailed && redisConnection.status === "ready";
