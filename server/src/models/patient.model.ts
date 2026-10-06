import mongoose, { Schema, Document } from "mongoose";

export interface IPatient extends Document {
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema(
  {
    userId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    birthDate: { type: Date },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const Patient = mongoose.model<IPatient>("Patient", patientSchema);
