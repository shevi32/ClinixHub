import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer, // חיבור ה-Reducer של האבטחה
  },
});

// גזירת הטיפוסים הסטטיים של ה-Store עבור TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;