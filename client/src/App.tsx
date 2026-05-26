import { Routes, Route } from "react-router-dom";
import CreateAppointmentForm from "./components/forms/CreateAppointmentForm";
import AppointmentsDashboard from "./components/appointments/AppointmentsDashboard";
import PatientsPage from "./components/patients/PatientsPage";
import TreatmentPage from "./components/treatments/TreatmentPage";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />

      <Route path="/create-appointment" element={<CreateAppointmentForm />} />

      <Route path="/appointments" element={<AppointmentsDashboard />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/treatments" element={<TreatmentPage />} />
    </Routes>
  );

}