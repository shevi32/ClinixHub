import express from "express";
console.log("=== מה הראוטר קיבל מהקונטרולר? ===", { createPatient, getPatients });
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";
console.log("=== מה הראוטר קיבל מהקונטרולר? ===", { createPatient, getPatients });
const router = express.Router();

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