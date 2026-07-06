import dotenv from "dotenv";
dotenv.config();

import express, { Application, Request, Response } from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// import patientRoutes from "./routes/patient.routes";
// import appointmentRoutes from "./routes/appointment.routes.js";
// import treatmentRoutes from "./routes/treatment.routes";
import patientRoutes from "./routes/patient.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import treatmentRoutes from "./routes/treatment.routes.js";
const app: Application = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running perfectly",
  });
});

app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/treatments", treatmentRoutes);

// Error handler חייב להיות בסוף
app.use(errorHandler);

export default app;
