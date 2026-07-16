import Redis from "ioredis";

/**
 * חיבור Redis משותף - משמש גם ל-Cache (שעות פנויות) וגם ל-BullMQ (תור התראות).
 *
 * חשוב: Redis הוא דרישת "בונוס" בפרויקט הזה, לא דרישת חובה. אם אין שרת Redis
 * זמין (למשל בסביבת פיתוח מקומית בלי Redis מותקן), האפליקציה לא קורסת -
 * ה-Cache וה-Queue פשוט מדלגים על עצמם ופונים ישירות ל-MongoDB במקום.
 */

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let isRedisAvailable = false;

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: () => null,
});

redisConnection.on("connect", () => {
  isRedisAvailable = true;
  console.log("Redis connected successfully 🚀 (cache + queue enabled)");
});

redisConnection.on("error", (err) => {
  if (isRedisAvailable) {
    console.error("Redis connection error:", err.message);
  }
  isRedisAvailable = false;
});

// מנסים להתחבר פעם אחת באתחול השרת; כישלון לא מפיל את השרת (התכונה היא בונוס)
export const initRedis = async (): Promise<void> => {
  try {
    await redisConnection.connect();
  } catch {
    console.warn(
      "Redis is not available - skipping cache/queue features (this is an optional bonus feature, the app works fine without it)."
    );
  }
};

export const isRedisReady = () => isRedisAvailable;
