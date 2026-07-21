import { useEffect, useState } from "react";
import api from "../../utils/api";
import EditAppointmentForm from "../forms/EditAppointmentForm";
import {
  FaCalendarAlt,
  FaFilter,
  FaEdit,
  FaBan,
  FaTrash,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";

const statusBadgeClass: Record<string, string> = {
  scheduled: "joy-badge-scheduled",
  completed: "joy-badge-completed",
  cancelled: "joy-badge-cancelled",
};

const statusLabel: Record<string, string> = {
  scheduled: "╫₧╫¬╫ץ╫¢╫á╫ƒ",
  completed: "╫פ╫ץ╫⌐╫£╫¥",
  cancelled: "╫ס╫ץ╫ר╫£",
};

type Appointment = {
  _id: string;
  patientId: string;
  therapistId: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
};

export default function AppointmentsDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [status, setStatus] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [patientId, setPatientId] = useState("");

  const [page, setPage] = useState(1);
  const limit = 5;
  const [totalPages, setTotalPages] = useState(1);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const fetchAppointments = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.append("page", String(pageNumber));
      params.append("limit", String(limit));

      if (status) params.append("status", status);
      if (therapistId) params.append("therapistId", therapistId);
      if (patientId) params.append("patientId", patientId);

      const response = await api.get('/appointments', { params });
      const data = response.data;

      setAppointments(data.data);
      setTotalPages(data.pagination.pages);
      setPage(data.pagination.page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, []);

  const cancelAppointment = async (id: string) => {
    try {
      setActionLoadingId(id);

      await api.patch(`/appointments/${id}/cancel`);

      fetchAppointments(page);
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      setActionLoadingId(id);

      await api.delete(`/appointments/${id}`);

      fetchAppointments(page);
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setActionLoadingId(id);

      await api.put(`/appointments/${id}`, { status });

      fetchAppointments(page);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-16 -right-16 h-64 w-64 bg-joy-sky" />
      <div className="joy-blob bottom-0 -left-16 h-64 w-64 bg-joy-grape" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 text-xl text-white shadow-pop">
            <FaCalendarAlt />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">╫á╫ש╫פ╫ץ╫£ ╫¬╫ץ╫¿╫ש╫¥</h2>
            <p className="text-sm text-slate-500">╫¢╫£ ╫פ╫¬╫ץ╫¿╫ש╫¥ ╫⌐╫£ ╫פ╫º╫£╫ש╫á╫ש╫º╫פ, ╫ס╫₧╫º╫ץ╫¥ ╫נ╫ק╫ף ╫ª╫ס╫ó╫ץ╫á╫ש ≡ƒקף∩╕ן</p>
          </div>
        </header>

        {/* FILTERS */}
        <div className="joy-card mb-6 flex flex-wrap items-end gap-3 p-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">╫í╫ר╫ר╫ץ╫í</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="joy-input">
              <option value="">╫פ╫¢╫ץ╫£</option>
              <option value="scheduled">╫₧╫¬╫ץ╫¢╫á╫ƒ</option>
              <option value="completed">╫פ╫ץ╫⌐╫£╫¥</option>
              <option value="cancelled">╫ס╫ץ╫ר╫£</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">╫₧╫ר╫ñ╫£/╫¬</label>
            <input
              placeholder="╫₧╫צ╫פ╫פ ╫₧╫ר╫ñ╫£"
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="joy-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">╫₧╫ר╫ץ╫ñ╫£/╫¬</label>
            <input
              placeholder="╫₧╫צ╫פ╫פ ╫₧╫ר╫ץ╫ñ╫£"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="joy-input"
            />
          </div>

          <button onClick={() => fetchAppointments(1)} className="joy-btn-primary">
            <FaFilter /> ╫í╫ש╫á╫ץ╫ƒ
          </button>
        </div>

        {loading && <p className="py-6 text-center text-slate-500">╫ר╫ץ╫ó╫ƒ ╫¬╫ץ╫¿╫ש╫¥... ≡ƒפה</p>}
        {error && <p className="py-4 text-center font-medium text-rose-600">{error}</p>}

        {/* TABLE */}
        {!loading && !error && (
          <div className="joy-card overflow-hidden">
            <table className="w-full text-right text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">╫₧╫ר╫ץ╫ñ╫£</th>
                  <th className="px-5 py-3">╫₧╫ר╫ñ╫£</th>
                  <th className="px-5 py-3">╫פ╫¬╫ק╫£╫פ</th>
                  <th className="px-5 py-3">╫í╫ש╫ץ╫¥</th>
                  <th className="px-5 py-3">╫í╫ר╫ר╫ץ╫í</th>
                  <th className="px-5 py-3">╫ñ╫ó╫ץ╫£╫ץ╫¬</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a._id} className="transition-colors hover:bg-teal-50/40">
                    <td className="px-5 py-4 font-semibold text-slate-800">{a.patientId}</td>
                    <td className="px-5 py-4">{a.therapistId}</td>
                    <td className="px-5 py-4">{new Date(a.startTime).toLocaleString("he-IL")}</td>
                    <td className="px-5 py-4">{new Date(a.endTime).toLocaleString("he-IL")}</td>
                    <td className="px-5 py-4">
                      <span className={statusBadgeClass[a.status] || "joy-badge bg-slate-100 text-slate-600"}>
                        {statusLabel[a.status] || a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setEditingAppointment(a)}
                          className="joy-btn-soft px-3 py-1.5 text-xs"
                        >
                          <FaEdit /> ╫ó╫¿╫ש╫¢╫פ
                        </button>

                        <button
                          disabled={actionLoadingId === a._id}
                          onClick={() => cancelAppointment(a._id)}
                          className="joy-btn-danger px-3 py-1.5 text-xs"
                        >
                          <FaBan /> ╫ס╫ש╫ר╫ץ╫£
                        </button>

                        <button
                          disabled={actionLoadingId === a._id}
                          onClick={() => deleteAppointment(a._id)}
                          className="joy-btn-ghost px-3 py-1.5 text-xs"
                        >
                          <FaTrash /> ╫₧╫ק╫ש╫º╫פ
                        </button>

                        <select
                          value={a.status}
                          disabled={actionLoadingId === a._id}
                          onChange={(e) => updateStatus(a._id, e.target.value)}
                          className="joy-input px-2 py-1.5 text-xs"
                        >
                          <option value="scheduled">╫₧╫¬╫ץ╫¢╫á╫ƒ</option>
                          <option value="completed">╫פ╫ץ╫⌐╫£╫¥</option>
                          <option value="cancelled">╫ס╫ץ╫ר╫£</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => fetchAppointments(page - 1)}
            className="joy-btn-soft px-4 py-2 text-sm"
          >
            <FaChevronRight /> ╫פ╫º╫ץ╫ף╫¥
          </button>

          <span className="joy-badge bg-slate-100 text-slate-600">
            ╫ó╫₧╫ץ╫ף {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => fetchAppointments(page + 1)}
            className="joy-btn-soft px-4 py-2 text-sm"
          >
            ╫פ╫ס╫נ <FaChevronLeft />
          </button>
        </div>

        {/* EDIT MODAL */}
        {editingAppointment && (
          <EditAppointmentForm
            appointment={editingAppointment}
            onClose={() => setEditingAppointment(null)}
            onUpdated={() => fetchAppointments(page)}
          />
        )}
      </div>
    </div>
  );
}
