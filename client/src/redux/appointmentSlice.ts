import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api'; 

// הגדרת ממשק (Interface) לתור בודד כדי לפתור את שגיאות ה-TypeScript במערך
export interface Appointment {
  _id?: string;
  id?: string;
  therapistId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  type: string;
  notes?: string;
  status: string;
}

// הגדרת טיפוס ה-State
interface AppointmentState {
  list: Appointment[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

// 1. Thunk: משיכת כל התורים של המטופל המחובר מהשרת
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (patientId: string, thunkAPI) => {
    try {
      // תיקון: שימוש פיזי ב-patientId שנשלח כפרמטר כדי שהשרת ידע את מי למשוך
      // אם השרת מצפה לכתובת עם סימן שאלה: `/appointments?patientId=${patientId}`
      // אם הוא מצפה לכתובת ישירה: `/appointments/patient/${patientId}`
      const response = await api.get(`/appointments/patient/${patientId}`); 
      
      // הבטחה שאנחנו מחזירים את המערך עצמו (בין אם הוא עטוף ב-data או מגיע ישיר)
      return response.data.data || response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'שגיאה במשיכת תורים');
    }
  }
);

// 2. Thunk: קביעת תור חדש בשרת
export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (appointmentData: { therapistId: string; patientId: string; startTime: string; endTime: string; type: string; notes?: string }, thunkAPI) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data.data || response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'שגיאה בקביעת התור');
    }
  }
);

// הגדרת המצב המקורי (Initial State) עם טיפוס מפורש
const initialState: AppointmentState = {
  list: [],      
  loading: false,    
  error: null,
  success: false,    
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // טיפול במשיכת תורים
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        // הגנה: ודואגים שנקבל מערך תקין תמיד
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // טיפול בקביעת תור חדש
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // תיקון: הדרך הבטוחה ביותר בתוך Redux Toolkit לעדכן מערך עם בדיקת טיפוסים של TypeScript
        if (action.payload) {
          state.list.push(action.payload as Appointment);
        }
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetStatus } = appointmentSlice.actions;
export default appointmentSlice.reducer;