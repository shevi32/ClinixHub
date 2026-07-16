import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";

import patientRoutes from "./routes/patient.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import treatmentRoutes from "./routes/treatment.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/treatments", treatmentRoutes);

// Authentication (temporary Express routes for frontend during local development)
app.use("/auth", authRoutes);

app.use(errorHandler);

export default app;