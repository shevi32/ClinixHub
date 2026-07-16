import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import BookAppointment from "./pages/BookAppointment";
import AppointmentHistory from "./pages/AppointmentHistory";
import PatientDashboard from "./pages/PatientDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateAppointmentForm from "./components/forms/CreateAppointmentForm";
import AppointmentsDashboard from "./components/appointments/AppointmentsDashboard";
import PatientsPage from "./components/patients/PatientsPage";
import TreatmentPage from "./components/treatments/TreatmentPage";

// דפים זמניים
const Home = () => (
  <div style={{ padding: "20px" }} dir="rtl">
    <h1>עמוד הבית</h1>
  </div>
);

const TherapistDashboard = () => (
  <div style={{ padding: "20px" }} dir="rtl">
    <h1>דאשבורד מטפל</h1>
  </div>
);

export default function App() {
  return (
      <AuthProvider>
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
    </AuthProvider>
  );
}