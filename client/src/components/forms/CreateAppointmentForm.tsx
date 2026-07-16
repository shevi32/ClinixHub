import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import api from "../../utils/api";
import { appointmentSchema } from "./appointmentSchema";
import {
  FaCalendarPlus,
  FaUser,
  FaUserMd,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

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

      const response = await api.post('/appointments', payload);
      const result = response.data;

      if (!response.status || response.status >= 400) {
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-16 -right-16 h-64 w-64 bg-joy-coral" />
      <div className="joy-blob bottom-0 -left-16 h-64 w-64 bg-joy-teal" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 mx-auto max-w-lg p-6">
        <header className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-joy-warm text-2xl text-white shadow-joy">
            <FaCalendarPlus />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-800">קביעת תור חדש 🎉</h2>
          <p className="mt-1 text-sm text-slate-500">מלאו את הפרטים ונקבע לך תור בקליק</p>
        </header>

        {successMessage && (
          <p className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <FaCheckCircle /> {successMessage}
          </p>
        )}

        {serverError && (
          <pre className="mb-4 flex items-start gap-2 whitespace-pre-wrap rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            <FaExclamationCircle className="mt-0.5 shrink-0" /> {serverError}
          </pre>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="joy-card space-y-4 p-6">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaUser className="text-joy-sky" /> מזהה מטופל/ת
            </label>
            <input
              placeholder="Patient ID"
              {...register("patientId")}
              className="joy-input"
            />
            {errors.patientId?.message && (
              <p className="mt-1 text-xs font-medium text-rose-500">{errors.patientId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaUserMd className="text-joy-grape" /> מזהה מטפל/ת
            </label>
            <input
              placeholder="Therapist ID"
              {...register("therapistId")}
              className="joy-input"
            />
            {errors.therapistId?.message && (
              <p className="mt-1 text-xs font-medium text-rose-500">{errors.therapistId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaClock className="text-joy-sun" /> שעת התחלה
            </label>
            <input
              type="datetime-local"
              {...register("startTime")}
              className="joy-input"
            />
            {errors.startTime?.message && (
              <p className="mt-1 text-xs font-medium text-rose-500">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaClock className="text-joy-coral" /> שעת סיום
            </label>
            <input
              type="datetime-local"
              {...register("endTime")}
              className="joy-input"
            />
            {errors.endTime?.message && (
              <p className="mt-1 text-xs font-medium text-rose-500">{errors.endTime.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="joy-btn-primary w-full text-base">
            {isSubmitting ? "יוצר תור..." : (<><FaCalendarPlus /> יצירת תור</>)}
          </button>
        </form>
      </div>
    </div>
  );
}