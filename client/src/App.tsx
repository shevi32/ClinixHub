import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { ProtectedRoute } from "./components/ProtectedRoute.js";

import CreateAppointmentForm from "./components/forms/CreateAppointmentForm";
import AppointmentsDashboard from "./components/appointments/AppointmentsDashboard";
import PatientsPage from "./components/patients/PatientsPage";
import TreatmentPage from "./components/treatments/TreatmentPage";

// Temporary pages (you can move these to /pages later)
const Home = () => <h1>Home (Public)</h1>;
const Login = () => <h1>Login Page</h1>;
const TherapistDashboard = () => <h1>Therapist Dashboard</h1>;
const PatientDashboard = () => <h1>Patient Dashboard</h1>;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Appointment-related routes */}
          <Route path="/create-appointment" element={<CreateAppointmentForm />} />
          <Route path="/appointments" element={<AppointmentsDashboard />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/treatments" element={<TreatmentPage />} />

          {/* Protected patient route */}
          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute allowedRoles={["User"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected therapist route */}
          <Route
            path="/therapist-dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <TherapistDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}