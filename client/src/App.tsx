import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// עמודים ציבוריים - נטענים באופן מיידי (Eager) כדי שהכניסה הראשונה לאתר תהיה מהירה
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// כל שאר העמודים/הדשבורדים (כבדים יותר, כוללים טבלאות/טפסים/סטייט) נטענים בטעינה עצילה (Lazy Loading) -
// כך שמטופל רגיל לא מוריד את קוד ניהול המטפל (וההפך), רק כשבאמת ניגשים לנתיב.
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const AppointmentHistory = lazy(() => import("./pages/AppointmentHistory"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const TherapistDashboard = lazy(() => import("./pages/TherapistDashboard"));
const CreateAppointmentForm = lazy(() => import("./components/forms/CreateAppointmentForm"));
const AppointmentsDashboard = lazy(() => import("./components/appointments/AppointmentsDashboard"));
const PatientsPage = lazy(() => import("./components/patients/PatientsPage"));
const TreatmentPage = lazy(() => import("./components/treatments/TreatmentPage"));

// מוצג לזמן הקצר שבו הדפדפן מוריד את ה-chunk של העמוד המבוקש
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
      <p className="text-sm font-medium text-slate-500">טוען...</p>
    </div>
  </div>
);

export default function App() {
  return (
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ציבורי */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* מטופלים */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={["User"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute allowedRoles={["User"]}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointment-history"
            element={
              <ProtectedRoute allowedRoles={["User"]}>
                <AppointmentHistory />
              </ProtectedRoute>
            }
          />

          {/* מטפלים */}
          <Route
            path="/therapist-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <TherapistDashboard />
              </ProtectedRoute>
            }
          />

          {/* הוספות מהגרסה הישנה */}
          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AppointmentsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/treatments"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <TreatmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-appointment"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <CreateAppointmentForm />
              </ProtectedRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
        </Suspense>
    </AuthProvider>
  );
}