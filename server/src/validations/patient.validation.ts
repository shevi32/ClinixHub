import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const createPatientSchema = z.object({
  name: z.string().min(2, "name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  birthDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid birthDate format",
    })
    .optional(),
  notes: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
