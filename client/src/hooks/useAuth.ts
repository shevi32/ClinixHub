import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';

// Custom Hook לגישה מהירה ונוחה לנתוני האבטחה והמשתמש
export const useAuth = () => {
  const context = useContext(AuthContext);

  // הגנה: אם מנסים להשתמש בהוק מחוץ ל-AuthProvider, תיזרק שגיאה ברורה בפיתוח
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};