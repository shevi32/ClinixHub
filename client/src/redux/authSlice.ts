q  import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// הגדרת המבנה של המשתמש בתוך ה-State
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User'; // תואם בדיוק ל-ProtectedRoute שלכן
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// קריאת הנתונים הקיימים מה-LocalStorage כדי שהמשתמש יישאר מחובר גם אחרי רענון
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 1. שמירת פרטי המשתמש והטוקן בעת התחברות מושלמת
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.error = null;
      
      // שמירה פיזית בדפדפן
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    
    // 2. התנתקות ומחיקת המידע מה-State ומהדפדפן
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      
      // מחיקה מהדפדפן
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // 3. עדכון שגיאות זמניות במידה ויש
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 4. שינוי מצב טעינה במידת הצורך
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
});

// ייצוא מפורש של כל הפעולות ש-AuthContext.tsx ושאר האפליקציה מחפשים
export const { setCredentials, clearCredentials, setAuthError, setLoading } = authSlice.actions;

export default authSlice.reducer;