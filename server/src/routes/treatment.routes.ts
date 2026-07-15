import express from "express";
import {
  createTreatment,
  deleteTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
} from "../controllers/treatment.controller.js";

const router = express.Router();
// CREATE
router.post("/", createTreatment);
// GET ALL
router.get("/", getTreatments);
// GET BY ID
router.get("/:id", getTreatmentById);
// UPDATE
router.put("/:id", updateTreatment);
// DELETE
router.delete("/:id", deleteTreatment);

export default router;