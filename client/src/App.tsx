import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

// דפים מדומים (בת ג' ואת תפתחו אותם בהמשך בתיקיית pages)
const Home = () => <h1>עמוד הבית (פתוח לכולם)</h1>;
const Login = () => <h1>עמוד התחברות</h1>;
const TherapistDashboard = () => <h1>דאשבורד מטפל (Admin בלוח זמנים, סיכומים)</h1>;
const PatientDashboard = () => <h1>דאשבורד מטופל (קביעת תורים)</h1>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* נתיבים ציבוריים */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          {/* נתיב מוגן למטופלים/הורים בלבד */}
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['User']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />

          {/* נתיב מוגן למטפלים (Admin) בלבד */}
          <Route 
            path="/therapist-dashboard" 
            element={
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