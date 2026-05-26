import { z } from "zod";

export const appointmentSchema = z
  .object({
    patientId: z.string().min(1, "Patient is required"),
    therapistId: z.string().min(1, "Therapist is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => new Date(data.startTime) > new Date(),
    {
      message: "Start time must be in the future",
      path: ["startTime"],
    }
  );