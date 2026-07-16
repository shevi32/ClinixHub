import mongoose from "mongoose";
import app from "./app.js";
import { initRedis } from "./config/redis.js";
import { startNotificationWorker } from "./queues/notification.worker.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/clinixhub";

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}
// הגדרת פונקציית אתחול לניהול הפעולות האסינכרוניות
const startServer = async () => {
  try {
    await connectDB();

    // Redis (Cache + Queue) הוא בונוס - אם הוא לא זמין, השרת ממשיך לרוץ כרגיל בלעדיו
    await initRedis();
    startNotificationWorker();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

// הרצת הפונקציה
startServer();