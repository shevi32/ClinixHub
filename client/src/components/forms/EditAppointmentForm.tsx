import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "./appointmentSchema";

type FormData = z.infer<typeof appointmentSchema>;

export default function EditAppointmentForm({
  appointment,
  onClose,
  onUpdated,
}: {
  appointment: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    if (appointment) {
      reset({
        patientId: appointment.patientId,
        therapistId: appointment.therapistId,
        startTime: appointment.startTime?.slice(0, 16),
        endTime: appointment.endTime?.slice(0, 16),
      });
    }
  }, [appointment, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError("");

      const res = await fetch(
        `http://localhost:3000/api/appointments/${appointment._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            startTime: new Date(data.startTime).toISOString(),
            endTime: new Date(data.endTime).toISOString(),
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Update failed");
      }

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ border: "1px solid gray", padding: 10 }}>
      <h3>Edit Appointment</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("patientId")} placeholder="Patient ID" />
        <p style={{ color: "red" }}>{errors.patientId?.message}</p>

        <input {...register("therapistId")} placeholder="Therapist ID" />
        <p style={{ color: "red" }}>{errors.therapistId?.message}</p>

        <input type="datetime-local" {...register("startTime")} />
        <p style={{ color: "red" }}>{errors.startTime?.message}</p>

        <input type="datetime-local" {...register("endTime")} />
        <p style={{ color: "red" }}>{errors.endTime?.message}</p>

        <button disabled={isSubmitting}>Save</button>

        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}