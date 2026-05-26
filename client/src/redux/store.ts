import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import appointmentReducer from './appointmentSlice';

// יצירת ה-Store וחיבור ה-Reducers שלכן
export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentReducer,
  },
});

// ייצוא הטיפוסים הרשמיים של Redux עבור TypeScript (מונע שגיאות בקומפוננטות אחרות)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ייצוא כפול כדי למנוע שגיאות ייבוא ב-main.tsx (תומך גם בייבוא עם סוגריים מסולסלים וגם בלי)
export default store;