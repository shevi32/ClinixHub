import { Request, Response } from "express";
import { Treatment } from "../models/treatment.model.js";

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
export const getTreatmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const treatment =
      await Treatment.findById(req.params.id);

    if (!treatment) {
      return res.status(404).json({
        message: "Treatment not found",
      });
    }

    res.json(treatment);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const updateTreatment = async (
  req: Request,
  res: Response
) => {
  try {
    const treatment =
      await Treatment.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!treatment) {
      return res.status(404).json({
        message: "Treatment not found",
      });
    }

    res.json(treatment);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};
export const deleteTreatment = async (
  req: Request,
  res: Response
) => {
  try {
    const treatment =
      await Treatment.findByIdAndDelete(
        req.params.id
      );

    if (!treatment) {
      return res.status(404).json({
        message: "Treatment not found",
      });
    }

    res.json({
      message: "Treatment deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};