import express from "express";

import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
} from "../controllers/appointment.controller.js";
const router = express.Router();

// יצירת תור חדש
router.post("/", createAppointment);

// קבלת כל התורים
router.get("/", getAppointments);

// קבלת תור אחד
router.get("/:id", getAppointmentById);

// עדכון תור
router.put("/:id", updateAppointment);

// מחיקת תור
router.delete("/:id", deleteAppointment);
// ביטול תור 
router.patch("/:id/cancel", cancelAppointment);
export default router;