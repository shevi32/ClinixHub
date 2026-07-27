import { z } from "zod";
import mongoose from "mongoose";

// base schema
const baseAppointmentSchema = z.object({
  patientId: z
    .string()
    .optional()
    .refine((v) => v === undefined || mongoose.isValidObjectId(v), {
      message: "Invalid patientId format",
    }),

  therapistId: z
    .string()
    .min(1, "therapistId is required")
    .refine((v) => mongoose.isValidObjectId(v), {
      message: "Invalid therapistId format",
    }),

  startTime: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    {
      message: "Invalid startTime format",
    }
  ),

  endTime: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    {
      message: "Invalid endTime format",
    }
  ),

  status: z
    .enum(["scheduled", "completed", "cancelled"])
    .default("scheduled"),

  notes: z.string().optional(),
});

// create schema
export const createAppointmentSchema = baseAppointmentSchema
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      return end > start;
    },
    {
      message: "endTime must be after startTime",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);

      return start > new Date();
    },
    {
      message: "startTime must be in the future",
      path: ["startTime"],
    }
  );

// update schema
export const updateAppointmentSchema = baseAppointmentSchema
  .partial()
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;

      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      return end > start;
    },
    {
      message: "endTime must be after startTime",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (!data.startTime) return true;

      const start = new Date(data.startTime);

      return start > new Date();
    },
    {
      message: "startTime must be in the future",
      path: ["startTime"],
    }
  );