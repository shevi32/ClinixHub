import { useEffect, useState } from "react";
import EditAppointmentForm from "../forms/EditAppointmentForm";

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

      const res = await fetch(
        `http://localhost:3000/api/appointments?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

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

      await fetch(`http://localhost:3000/api/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      fetchAppointments(page);
    } finally {
      setActionLoadingId(null);
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      setActionLoadingId(id);

      await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: "DELETE",
      });

      fetchAppointments(page);
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setActionLoadingId(id);

      await fetch(`http://localhost:3000/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      fetchAppointments(page);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Appointments Dashboard</h2>

      {/* FILTERS */}
      <div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          placeholder="Therapist"
          value={therapistId}
          onChange={(e) => setTherapistId(e.target.value)}
        />

        <input
          placeholder="Patient"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />

        <button onClick={() => fetchAppointments(1)}>Filter</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TABLE */}
      {appointments.map((a) => (
        <div key={a._id} style={{ border: "1px solid #ddd", margin: 5, padding: 10 }}>
         <div>{a.patientId}</div>

<div>{a.therapistId}</div>

<div>
  Start:
  {new Date(a.startTime).toLocaleString()}
</div>

<div>
  End:
  {new Date(a.endTime).toLocaleString()}
</div>

<div>{a.status}</div>

          <button onClick={() => setEditingAppointment(a)}>Edit</button>

          <button onClick={() => cancelAppointment(a._id)}>Cancel</button>

          <button onClick={() => deleteAppointment(a._id)}>Delete</button>

          <select
            value={a.status}
            onChange={(e) => updateStatus(a._id, e.target.value)}
          >
            <option value="scheduled">scheduled</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
      ))}

      {/* PAGINATION FIX */}
      <div style={{ marginTop: 20 }}>
        <button
          disabled={page <= 1}
          onClick={() => fetchAppointments(page - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => fetchAppointments(page + 1)}
        >
          Next
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
  );
}