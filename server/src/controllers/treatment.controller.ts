import { Request, Response } from "express";
import { Treatment } from "../models/treatment.model";

export const createTreatment = async (req: Request, res: Response) => {
  try {
    const treatment = await Treatment.create(req.body);
    res.status(201).json(treatment);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getTreatments = async (_req: Request, res: Response) => {
  try {
    const treatments = await Treatment.find().sort({ createdAt: -1 });
    res.json(treatments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};