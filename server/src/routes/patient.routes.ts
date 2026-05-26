import express from "express";
import { createPatient, getPatients } from "../controllers/patient.controller";

const router = express.Router();

router.post("/", createPatient);
router.get("/", getPatients);

export default router;