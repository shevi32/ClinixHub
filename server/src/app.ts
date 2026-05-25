import express from "express";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

app.use(express.json());

app.use("/api/appointments", appointmentRoutes);
export default app;