import dotenv from 'dotenv';
dotenv.config(); 

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js'; // הוספת הייבוא

const app: Application = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running perfectly' });
});

// שכבת תפיסת השגיאות המרכזית - חובה למקם אותה בסוף כל הראוטים!
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is operating on port ${PORT} 🚀`);
});