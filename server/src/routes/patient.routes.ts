import express from "express";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// כל המשאב "מטופלים" הוא ניהול פנימי של המרפאה - שמור למטפל/מנהל בלבד.
// מטופל (User) שינסה לגשת לכל אחד מהראוטים הבאים יקבל 403 Forbidden.
router.use(verifyToken, checkRole(ROLES.THERAPIST));

// CREATE
router.post("/", createPatient);

// GET ALL
router.get("/", getPatients);

// GET BY ID
router.get("/:id", getPatientById);

// UPDATE
router.put("/:id", updatePatient);

// DELETE
router.delete("/:id", deletePatient);

export default router;