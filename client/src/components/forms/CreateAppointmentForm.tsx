import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  therapistId: z.string().min(1, "Therapist is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(["scheduled", "completed", "cancelled"]),
});

export default function CreateAppointmentForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      status: "scheduled",
    },
  });
  console.log("ERRORS:", errors); // 👈 כאן בדיוק

  const onSubmit = async (data: any) => {
      console.log("SUBMIT FIRED", data);
    try {
      setServerError("");
      setSuccessMessage("");

      const payload = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      };

      const response = await fetch(
        "http://localhost:3000/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      // ❗ טיפול בשגיאות מפורט
      if (!response.ok) {
        const errorsText =
          result.errors
            ?.map((e: any) => `${e.path?.join(".")}: ${e.message}`)
            .join("\n");

        setServerError(errorsText || result.message || "Unknown error");
        return;
      }

      setSuccessMessage("Appointment created successfully ✔");
    } catch (err: any) {
      setServerError(err.message || "Network error");
    }
  };

  return (
    <div>
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {serverError && (
        <pre style={{ color: "red" }}>{serverError}</pre>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Create Appointment</h2>

        <input placeholder="Patient ID" {...register("patientId")} />
        <p>{errors.patientId?.message}</p>

        <input placeholder="Therapist ID" {...register("therapistId")} />
        <p>{errors.therapistId?.message}</p>

        <input type="datetime-local" {...register("startTime")} />
        <p>{errors.startTime?.message}</p>

        <input type="datetime-local" {...register("endTime")} />
        <p>{errors.endTime?.message}</p>

        <select {...register("status")}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button type="submit" disabled={isSubmitting}>
          Create Appointment
        </button>
      </form>
    </div>
  );
}