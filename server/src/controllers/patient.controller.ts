import { Request, Response } from "express";
import { Schema, model, type Document } from "mongoose";

// 1. הגדרת ה-Interface עבור TypeScript
export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  identityNumber: string; // תעודת זהות / דרכון
  phone: string;
  email?: string;
  dateOfBirth: Date;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. הגדרת ה-Schema של Mongoose
const PatientSchema = new Schema<IPatient>(
  {
    firstName: {
      type: String,
      required: [true, "שם פרטי הוא שדה חובה"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "שם משפחה הוא שדה חובה"],
      trim: true,
    },
    identityNumber: {
      type: String,
      required: [true, "תעודת זהות היא שדה חובה"],
      unique: true, // מונע כפילויות של אותו מטופל
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "מספר טלפון הוא שדה חובה"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "תאריך לידה הוא שדה חובה"],
    },
    address: {
      type: String,
    },
    notes: {
      type: String, // הערות קליניות או כלליות
    },
  },
  {
    // יוצר אוטומטית שדות עבור createdAt ו-updatedAt ומנהל אותם
    timestamps: true,
  }
);

// 3. יצירת המודל וייצוא שלו עבור הקונטרולר
export const Patient = model<IPatient>("Patient", PatientSchema);

export const createPatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.create(req.body);
    return res.status(201).json({ success: true, data: patient });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: patients });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({ success: true, data: patient });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({ success: true, data: patient });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

