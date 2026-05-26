import { Request, Response } from "express";
import { Patient } from "../models/patient.model";

// CREATE patient
export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// GET all patients
export const getPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};