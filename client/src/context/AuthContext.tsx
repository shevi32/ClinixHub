import { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api.js';

// 1. הגדרת מבנה הנתונים של המשתמש
export interface User {
  id: string;
  email: string;
  role: 'Admin' | 'User'; // Admin = מטפל, User = מטופל/הורה
}

// 2. הגדרת המבנה של הסטייט שהרכיבים באפליקציה יוכלו לצרוך
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// 3. יצירת ה-Context עצמו עם ערך ברירת מחדל ריק
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. רכיב העטיפה המרכזי (Provider)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // מונע הבזק של עמוד ה-Login בזמן טעינה

  // טעינת הנתונים מה-LocalStorage עם העלייה הראשונה של האפליקציה
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false); // סיום בדיקת הנתונים המקומיים
  }, []);

  // פונקציית התחברות - נקראת לאחר לוגין מוצלח בשרת
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // פונקציית התנתקות - מנקה את הסטייט ואת האחסון המקומי
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user; // משתנה בוליאני הנגזר מקיום אובייקט משתמש

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};