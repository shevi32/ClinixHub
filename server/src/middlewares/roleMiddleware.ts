import { Request, Response, NextFunction } from 'express';

/**
 * Middleware לבדיקת הרשאות לפי תפקיד
 * מוודא שלמשתמש המחובר יש את התפקיד הנדרש
 */
export const checkRole = (requiredRoles: string | string[]) => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};