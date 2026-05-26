import { Routes, Route } from "react-router-dom";
import CreateAppointmentForm from "./components/forms/CreateAppointmentForm";
import AppointmentsDashboard from "./components/appointments/AppointmentsDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div>Home</div>} />

      <Route path="/create-appointment" element={<CreateAppointmentForm />} />

      <Route path="/appointments" element={<AppointmentsDashboard />} />
    </Routes>
  );

}