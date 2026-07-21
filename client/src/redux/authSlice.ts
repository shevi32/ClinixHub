import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// הגדרת המבנה של המשתמש בתוך ה-State
interface User {
  id: string;
  email: string;
  role: 'Admin' | 'User'; // תואם בדיוק ל-ProtectedRoute שלכן
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// קריאה מ-localStorage
const storedToken = localStorage.getItem('token');
const rawStoredUser = localStorage.getItem('user');

// Safely parse stored user: handle cases where the value is the string "undefined" or invalid JSON
let parsedStoredUser: User | null = null;
if (rawStoredUser && rawStoredUser !== 'undefined' && rawStoredUser !== 'null') {
  try {
    parsedStoredUser = JSON.parse(rawStoredUser) as User;
  } catch (err) {
    console.warn('Invalid user in localStorage, clearing value:', err);
    localStorage.removeItem('user');
    parsedStoredUser = null;
  }
}

// מצב התחלתי
const initialState: AuthState = {
  user: parsedStoredUser,
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