import express from "express";
import cors from "cors";

import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

    app.use(express.json());
    app.use(cors());

app.use("/api/appointments", appointmentRoutes);
export default app;

