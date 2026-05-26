//צריך להסתכרן עם שבי
import { Request, Response } from "express";
import { Patient } from "../models/patient.model";

// CREATE patient
export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json(patient);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// GET all patients
export const getPatients = async (
  _req: Request,
  res: Response
) => {
  try {
    const patients = await Patient.find().sort({
      createdAt: -1,
    });

    res.json(patients);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// GET patient by ID
export const getPatientById = async (
  req: Request,
  res: Response
) => {
  try {
    const patient = await Patient.findById(
      req.params.id
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json(patient);
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// UPDATE patient
export const updatePatient = async (
  req: Request,
  res: Response
) => {
  try {
    const patient =
      await Patient.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json(patient);
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
};

// DELETE patient
export const deletePatient = async (
  req: Request,
  res: Response
) => {
  try {
    const patient =
      await Patient.findByIdAndDelete(
        req.params.id
      );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.json({
      message: "Patient deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      message: err.message,
    });
  }
};