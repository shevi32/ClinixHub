import { z } from "zod";

export const createTreatmentSchema = z.object({
  patientId: z.string().min(1, "patientId is required"),
  appointmentId: z.string().optional(),
  notes: z.string().min(1, "notes is required"),
});

export const updateTreatmentSchema = createTreatmentSchema.partial();
