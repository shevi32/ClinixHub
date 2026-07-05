import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Appointment components
import CreateAppointmentForm from "./components/forms/CreateAppointmentForm";
import AppointmentsDashboard from "./components/appointments/AppointmentsDashboard";
import PatientsPage from "./components/patients/PatientsPage";
import TreatmentPage from "./components/treatments/TreatmentPage";

// Patient pages
import BookAppointment from "./pages/BookAppointment";
import AppointmentHistory from "./pages/AppointmentHistory";
import PatientDashboard from "./pages/PatientDashboard";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Temporary pages
const Home = () => <h1>Home</h1>;
const TherapistDashboard = () => <h1>Therapist Dashboard</h1>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Appointment management */}
          <Route
            path="/create-appointment"
            element={<CreateAppointmentForm />}
          />
          <Route
            path="/appointments"
            element={<AppointmentsDashboard />}
          />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/treatments" element={<TreatmentPage />} />

          {/* Patient routes */}
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

          {/* Therapist routes */}
          <Route
            path="/therapist-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <TherapistDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}