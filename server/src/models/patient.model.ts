import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);