import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// הגדרת המבנה של המשתמש בסטייט
interface User {
  id: string;
  email: string;
  role: 'Admin' | 'User';
}

// הגדרת המצב ההתחלתי של ה-Redux
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // פונקציה לעדכון המשתמש בסטייט בעת התחברות
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    // פונקציה לניקוי הסטייט בעת התנתקות
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;