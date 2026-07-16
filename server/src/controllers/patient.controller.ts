import { Request, Response, NextFunction } from "express";
import { Patient } from "../models/patient.model.js";
import { CustomError } from "../utils/customError.js";
import {
  createPatientSchema,
  updatePatientSchema,
} from "../validations/patient.validation.js";

// CREATE patient
export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createPatientSchema.parse(req.body);

    const patient = await Patient.create({
      name: validatedData.name,
      email: validatedData.email,
      ...(validatedData.phone !== undefined ? { phone: validatedData.phone } : {}),
      ...(validatedData.address !== undefined ? { address: validatedData.address } : {}),
      ...(validatedData.birthDate !== undefined ? { birthDate: validatedData.birthDate } : {}),
      ...(validatedData.notes !== undefined ? { notes: validatedData.notes } : {}),
    });

    res.status(201).json(patient);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid patient data",
        errors: err.errors,
      });
    }

    // ╫¢╫¬╫ץ╫ס╫¬ ╫₧╫ש╫ש╫£ ╫¢╫ñ╫ץ╫£╫פ (unique index) - ╫⌐╫ע╫ש╫נ╫¬ Mongo, ╫£╫נ Zod
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A patient with this email already exists",
      });
    }

    next(err);
  }
};

// GET all patients - ╫ó╫¥ ╫ק╫ש╫ñ╫ץ╫⌐ (╫⌐╫¥/╫₧╫ש╫ש╫£) ╫ץ-Pagination
export const getPatients = async (
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

    const { search } = req.query;
    if (search && String(search).trim().length > 0) {
      const regex = new RegExp(String(search).trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: patients,
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

// GET patient by ID
export const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return next(new CustomError("Patient not found", 404));
    }

    res.json(patient);
  } catch (err) {
    next(err);
  }
};

// UPDATE patient
export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = updatePatientSchema.parse(req.body);

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      validatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return next(new CustomError("Patient not found", 404));
    }

    res.json(patient);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Invalid patient data",
        errors: err.errors,
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A patient with this email already exists",
      });
    }

    next(err);
  }
};

// DELETE patient
export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return next(new CustomError("Patient not found", 404));
    }

    res.json({
      message: "Patient deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
