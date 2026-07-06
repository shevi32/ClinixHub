import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { appointmentSchema } from "./appointmentSchema";

/* =========================
   ZOD VALIDATION
========================= */

type FormData = z.infer<typeof appointmentSchema>;

export default function CreateAppointmentForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");
      setSuccessMessage("");

      const payload = {
        patientId: data.patientId,
        therapistId: data.therapistId,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      };

      const response = await fetch(
        "http://localhost:5000/api/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorsText = result.errors
          ?.map(
            (e: any) =>
              `${e.path?.join(".")}: ${e.message}`
          )
          .join("\n");

        setServerError(
          errorsText ||
            result.message ||
            "Unknown error"
        );

        return;
      }

      setSuccessMessage(
        "Appointment created successfully ✔"
      );

      reset();
    } catch (err: any) {
      setServerError(
        err.message || "Network error"
      );
    }
  };

  return (
    <div>
      {successMessage && (
        <p style={{ color: "green" }}>
          {successMessage}
        </p>
      )}

      {serverError && (
        <pre style={{ color: "red" }}>
          {serverError}
        </pre>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Create Appointment</h2>

        <input
          placeholder="Patient ID"
          {...register("patientId")}
        />
        <p style={{ color: "red" }}>
          {errors.patientId?.message}
        </p>

        <input
          placeholder="Therapist ID"
          {...register("therapistId")}
        />
        <p style={{ color: "red" }}>
          {errors.therapistId?.message}
        </p>

        <input
          type="datetime-local"
          {...register("startTime")}
        />
        <p style={{ color: "red" }}>
          {errors.startTime?.message}
        </p>

        <input
          type="datetime-local"
          {...register("endTime")}
        />
        <p style={{ color: "red" }}>
          {errors.endTime?.message}
        </p>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Creating..."
            : "Create Appointment"}
        </button>
      </form>
    </div>
  );
}