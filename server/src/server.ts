import Fastify from 'fastify';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { authRoutes } from './routes/authRoutes.js'; // ודאי סיומת מתאימה אם צריך

dotenv.config();

const fastify = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/clinixhub";

// חיבור ל-Database מהענף שלך
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

// רישום נתיבי ה-Auth וה-Health מתוך ענף התשתית
fastify.register(authRoutes);

fastify.get('/health', async () => {
  return { status: 'Server is running' };
});

// הפעלת השרת המשולב
const start = async () => {
  try {
    await connectDB(); // מריץ את החיבור ל-DB לפני הפעלת השרת
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();