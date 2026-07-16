import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../utils/api";
import { appointmentSchema } from "./appointmentSchema";
import { FaEdit, FaUser, FaUserMd, FaClock, FaExclamationCircle, FaSave, FaTimes } from "react-icons/fa";

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

      const response = await api.put(
        `/appointments/${appointment._id}`,
        {
          ...data,
          startTime: new Date(data.startTime).toISOString(),
          endTime: new Date(data.endTime).toISOString(),
        }
      );

      const result = response.data;

      if (response.status >= 400) {
        throw new Error(result.message || "Update failed");
      }

      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message);
    }
  };

return (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 p-4" dir="rtl">
    <div className="joy-card w-full max-w-md animate-pop-in p-6 text-right">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 text-lg text-white shadow-pop">
          <FaEdit />
        </div>
        <h3 className="text-xl font-bold text-slate-800">עריכת תור</h3>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          <FaExclamationCircle /> {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FaUser /> מזהה מטופל/ת
          </label>
          <input {...register("patientId")} placeholder="Patient ID" className="joy-input" />
          {errors.patientId?.message && (
            <p className="mt-1 text-xs font-medium text-rose-500">{errors.patientId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FaUserMd /> מזהה מטפל/ת
          </label>
          <input {...register("therapistId")} placeholder="Therapist ID" className="joy-input" />
          {errors.therapistId?.message && (
            <p className="mt-1 text-xs font-medium text-rose-500">{errors.therapistId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FaClock /> שעת התחלה
          </label>
          <input type="datetime-local" {...register("startTime")} className="joy-input" />
          {errors.startTime?.message && (
            <p className="mt-1 text-xs font-medium text-rose-500">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <FaClock /> שעת סיום
          </label>
          <input type="datetime-local" {...register("endTime")} className="joy-input" />
          {errors.endTime?.message && (
            <p className="mt-1 text-xs font-medium text-rose-500">{errors.endTime.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button disabled={isSubmitting} className="joy-btn-primary w-full text-sm">
            <FaSave /> שמירה
          </button>

          <button type="button" onClick={onClose} className="joy-btn-ghost w-1/3 text-sm">
            <FaTimes /> ביטול
          </button>
        </div>
      </form>
    </div>
  </div>
);}