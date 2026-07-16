import express from "express";
import {
  createTreatment,
  deleteTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
} from "../controllers/treatment.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/roleMiddleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// כל ראוטי הטיפולים דורשים משתמש מחובר
router.use(verifyToken);

// CREATE - כתיבת סיכום טיפול חסוי, שמורה למטפל בלבד
router.post("/", checkRole(ROLES.THERAPIST), createTreatment);

// GET ALL - רשימת כל סיכומי הטיפול, שמורה למטפל בלבד
router.get("/", checkRole(ROLES.THERAPIST), getTreatments);

// GET BY ID - מטפל רואה הכול, מטופל רואה רק את סיכום הטיפול שלו עצמו
router.get("/:id", checkRole([ROLES.THERAPIST, ROLES.PATIENT]), getTreatmentById);

// UPDATE - שמור למטפל בלבד
router.put("/:id", checkRole(ROLES.THERAPIST), updateTreatment);

// DELETE - שמור למטפל בלבד
router.delete("/:id", checkRole(ROLES.THERAPIST), deleteTreatment);

export default router;