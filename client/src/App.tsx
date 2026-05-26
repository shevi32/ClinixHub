import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import BookAppointment from './pages/BookAppointment';
import AppointmentHistory from './pages/AppointmentHistory';
import PatientDashboard from './pages/PatientDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// דפים זמניים
const Home = () => <div style={{ padding: '20px' }} dir="rtl" className="text-right"><h1>עמוד הבית (פתוח לכולם)</h1></div>;
const TherapistDashboard = () => <div style={{ padding: '20px' }} dir="rtl" className="text-right"><h1>דאשבורד מטפל (Admin בלבד)</h1></div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= נתיבים ציבוריים ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />

          {/* ================= נתיבים מוגנים למטופלים (User) ================= */}
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['User']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute allowedRoles={['User']}>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/appointment-history" 
            element={
              <ProtectedRoute allowedRoles={['User']}>
                <AppointmentHistory />
              </ProtectedRoute>
            } 
          />

          {/* ================= נתיבים מוגנים למטפלים (Admin) ================= */}
          <Route 
            path="/therapist-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <TherapistDashboard />
              </ProtectedRoute>
            } 
          />

          {/* אם הכתובת לא מוכרת, ניתוב אוטומטי לעמוד הבית */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}