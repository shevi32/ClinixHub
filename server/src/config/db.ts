import mongoose from 'mongoose';
export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGO_URI;
    if (!connStr) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(connStr);
    console.log('MongoDB Connected Successfully... 🗄️');
  } catch (error: any) {
    console.error(`Database connection error: ${error.message} ❌`);
    process.exit(1);
  }
};