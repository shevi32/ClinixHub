import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

// 1. ייבוא הדפים האמיתיים שיצרת בתיקיית pages
import Login from './pages/Login.js';
import Register from './pages/Register.js';

// דפים זמניים לבדיקה (בת ג' ואת תחליפו אותם בהמשך)
const Home = () => <div style={{ padding: '20px' }}><h1>עמוד הבית (פתוח לכולם)</h1></div>;
const TherapistDashboard = () => <div style={{ padding: '20px' }}><h1>דאשבורד מטפל (Admin בלבד)</h1></div>;
const PatientDashboard = () => <div style={{ padding: '20px' }}><h1>דאשבורד מטופל (User בלבד)</h1></div>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ================= נתיבים ציבוריים ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* <--- הנה השורה כאן! */}
          <Route path="/" element={<Home />} />

          {/* ================= נתיבים מוגנים ================= */}
          {/* נתיב מוגן למטופלים/הורים בלבד (User) */}
          <Route 
            path="/patient-dashboard" 
            element = {
              <ProtectedRoute allowedRoles={['User']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* נתיב מוגן למטפלים בלבד (Admin) */}
          <Route 
            path="/therapist-dashboard" 
            element = {
              <ProtectedRoute allowedRoles={['Admin']}>
                <TherapistDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}