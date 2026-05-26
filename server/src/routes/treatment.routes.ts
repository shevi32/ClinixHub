import express from "express";
import {
  createTreatment,
  getTreatments,
} from "../controllers/treatment.controller";

const router = express.Router();

router.post("/", createTreatment);
router.get("/", getTreatments);

export default router;