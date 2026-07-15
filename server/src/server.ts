import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import { authRoutes } from './routes/authRoutes.js';

dotenv.config();

const fastify = Fastify({ logger: true });

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/clinixhub";

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
  try {
    done(null, body ? JSON.parse(body as string) : {});
  } catch (err) {
    done(err as Error, undefined);
  }
});

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

fastify.get('/health', async () => {
  return { status: 'Server is running' };
});

// הפעלת השרת המשולב
const start = async () => {
  try {
    await connectDB();
    await fastify.register(cors, {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
    await fastify.register(authRoutes, { prefix: '/auth' });
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();