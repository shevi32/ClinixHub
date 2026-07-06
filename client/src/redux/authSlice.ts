import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// הגדרת המבנה של המשתמש בתוך ה-State
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// פונקציה בטוחה לפענוח JSON
const safeParse = <T>(value: string | null): T | null => {
  try {
    if (!value || value === "undefined" || value === "null") {
      return null;
    }
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

// קריאה מ-localStorage
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

// מצב התחלתי
const initialState: AuthState = {
  user: safeParse<User>(storedUser),
  token: storedToken || null,
  loading: false,
  error: null,
};

// slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // התחברות
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;

      state.user = user;
      state.token = token;
      state.error = null;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    // התנתקות
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    // שגיאות
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
});

export const {
  setCredentials,
  clearCredentials,
  setAuthError,
  setLoading
} = authSlice.actions;

export default authSlice.reducer;