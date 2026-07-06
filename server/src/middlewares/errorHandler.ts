import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/customError.js'; // חובה סיומת .js בגלל סוג המודול

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack); // הדפסת ה-Stack Trace בטרמינל לצורכי דיבאג

  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message
  });
};