import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patient.routes";
import appointmentRoutes from "./routes/appointment.routes.js";
import treatmentRoutes from "./routes/treatment.routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/treatments", treatmentRoutes);
export default app;

