import axios from 'axios';

// יצירת מופע מרכזי עם כתובת ה-API של השרת ממשתני הסביבה
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: מזרק אוטומטית את הטוקן לכל בקשה יוצאת
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: מטפל בשגיאות גלובליות (למשל, זריקה מהמערכת בסטטוס 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('הטוקן פג תוקף או אינו תקין. מנתק משתמש...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // הפניה לעמוד התחברות
    }
    return Promise.reject(error);
  }
);

export default api;