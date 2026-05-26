import mongoose from "mongoose";

const treatmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true },
    appointmentId: { type: String },
    notes: { type: String, required: true },
  },
  { timestamps: true }
);

export const Treatment = mongoose.model("Treatment", treatmentSchema);