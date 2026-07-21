import express from "express";

import {
  createAppointment,
  getAppointments,
  getAvailableSlots,
  getAppointmentsByPatient,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
} from "../controllers/appointment.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// כל ראוטי התורים דורשים משתמש מחובר (מטפל או מטופל).
// בדיקת "בעלות" (שמטופל רואה/מבטל רק את התור שלו) מתבצעת בתוך ה-controller.
router.use(verifyToken, checkRole([ROLES.THERAPIST, ROLES.PATIENT]));

// יצירת תור חדש (מטופל קובע לעצמו / מטפל קובע למטופל)
router.post("/", createAppointment);

// קבלת כל התורים - לוח הזמנים המלא חשוף למטפל בלבד
router.get("/", checkRole(ROLES.THERAPIST), getAppointments);

// קבלת שעות פנויות למטפל ביום נתון (Redis Cache) - שני התפקידים יכולים לצפות בלוח הפנוי
router.get("/available-slots", getAvailableSlots);

// קבלת התורים של מטופל מסוים (מטפל, או המטופל עצמו)
router.get("/patient/:patientId", getAppointmentsByPatient);

// קבלת תור אחד (מטפל, או המטופל שהתור שייך לו)
router.get("/:id", getAppointmentById);

// עדכון תור (מטפל, או המטופל שהתור שייך לו)
router.put("/:id", updateAppointment);

// מחיקת תור - פעולה מנהלתית, למטפל בלבד
router.delete("/:id", checkRole(ROLES.THERAPIST), deleteAppointment);

// ביטול תור (מטפל, או המטופל שהתור שייך לו)
router.patch("/:id/cancel", cancelAppointment);

export default router;
