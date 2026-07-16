import type{ ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('Admin' | 'User')[]; // רשימת התפקידים המורשים לגשת לעמוד זה
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // 1. בזמן שהמערכת עדיין בודקת אם יש טוקן שמור - מציגים מסך טעינה (מונע הבזק לא רצוי)
  if (isLoading) {
    return <div>טוען...</div>; // כאן בת א' תוכל לשתול את ה-Spinner שלה בהמשך
  }

  // 2. אם המשתמש בכלל לא מחובר - הפניה אוטומטית לעמוד ההתחברות
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. אם הוגדרו תפקידים מורשים, והתפקיד של המשתמש לא נמצא ביניהם - הפניה לעמוד הבית
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. אם המשתמש מחובר ובעל הרשאה מתאימה - מאפשרים גישה לקומפוננטה הפנימית
  return <>{children}</>;
};