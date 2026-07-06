import { createContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, clearCredentials } from '../redux/authSlice.js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. הגדרת ה-dispatch של Redux בתוך הקומפוננטה
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // סנכרון ראשוני: אם נמצא משתמש ב-LocalStorage, נעדכן גם את Redux
          dispatch(setCredentials({ user: parsedUser, token }));
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // 2. פונקציית התחברות - מעדכנת LocalStorage, Context ו-Redux
  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    
    // שליחת הנתונים ל-Redux
    dispatch(setCredentials({ user, token }));
  };

  // 3. פונקציית התנתקות - מנקה LocalStorage, Context ו-Redux
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // ניקוי הנתונים מ-Redux
    dispatch(clearCredentials());
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};