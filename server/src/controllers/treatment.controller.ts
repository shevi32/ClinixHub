import { Request, Response, NextFunction } from "express";
import { Treatment } from "../models/treatment.model.js";
import { ROLES } from "../constants/roles.js";
import { CustomError } from "../utils/customError.js";
import {
  createTreatmentSchema,
  updateTreatmentSchema,
} from "../validations/treatment.validation.js";

export const createTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createTreatmentSchema.parse(req.body);

    const treatment = await Treatment.create({
      patientId: validatedData.patientId,
      notes: validatedData.notes,
      ...(validatedData.appointmentId !== undefined
        ? { appointmentId: validatedData.appointmentId }
        : {}),
    });
    res.status(201).json(treatment);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid treatment data",
        errors: err.errors,
      });
    }

    next(err);
  }
};

// GET all treatments - עם סינון לפי מטופל/טווח תאריכים ו-Pagination
export const getTreatments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10)
    );

    const filter: Record<string, any> = {};

    const { patientId, from, to, search } = req.query;

    if (patientId) {
      filter.patientId = String(patientId);
    }

    if (search && String(search).trim().length > 0) {
      filter.notes = new RegExp(String(search).trim(), "i");
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(String(from));
      if (to) filter.createdAt.$lte = new Date(String(to));
    }

    const [treatments, total] = await Promise.all([
      Treatment.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Treatment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: treatments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getTreatmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const treatment = await Treatment.findById(req.params.id);

    if (!treatment) {
      return next(new CustomError("Treatment not found", 404));
    }

    // מטופל יכול לצפות רק בסיכום הטיפול שלו עצמו
    const user = (req as any).user;
    if (user?.role !== ROLES.THERAPIST && treatment.patientId !== user?.id) {
      return res.status(403).json({
        message: "You can only view your own treatment summary",
      });
    }

    res.json(treatment);
  } catch (err) {
    next(err);
  }
};

export const updateTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updateTreatmentSchema.parse(req.body);

    const treatment = await Treatment.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!treatment) {
      return next(new CustomError("Treatment not found", 404));
    }

    res.json(treatment);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid treatment data",
        errors: err.errors,
      });
    }

    next(err);
  }
};

export const deleteTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const treatment = await Treatment.findByIdAndDelete(req.params.id);

    if (!treatment) {
      return next(new CustomError("Treatment not found", 404));
    }

    res.json({
      message: "Treatment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
