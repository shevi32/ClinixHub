import { useEffect, useState } from "react";
import api from "../../utils/api";
import { FaUserFriends, FaUserPlus, FaPhone, FaEnvelope, FaUser } from "react-icons/fa";

type Patient = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get('/patients');

      // ה-API מחזיר { success, data, pagination } (Pagination) ולא מערך גולמי
      setPatients(response.data.data ?? response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const createPatient = async () => {
    try {
      setError("");

      await api.post('/patients', form);

      setForm({ name: "", phone: "", email: "" });
      fetchPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-16 -left-16 h-64 w-64 bg-joy-grape" />
      <div className="joy-blob bottom-0 -right-16 h-64 w-64 bg-joy-sun" style={{ animationDelay: "3s" }} />

      <div className="relative z-10 mx-auto max-w-5xl p-6">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-400 text-xl text-white shadow-pop">
            <FaUserFriends />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">ניהול מטופלים</h2>
            <p className="text-sm text-slate-500">כל המטופלים שלך, במקום חם ונעים 🌸</p>
          </div>
        </header>

        {/* FORM */}
        <div className="joy-card mb-6 flex flex-wrap items-end gap-3 p-5">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <FaUser /> שם
            </label>
            <input
              placeholder="שם המטופל/ת"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="joy-input"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <FaPhone /> טלפון
            </label>
            <input
              placeholder="050-0000000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="joy-input"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <FaEnvelope /> אימייל
            </label>
            <input
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="joy-input"
            />
          </div>

          <button onClick={createPatient} className="joy-btn-warm">
            <FaUserPlus /> הוספת מטופל/ת
          </button>
        </div>

        {/* STATES */}
        {loading && <p className="py-6 text-center text-slate-500">טוען מטופלים... 🔄</p>}
        {error && <p className="py-4 text-center font-medium text-rose-600">{error}</p>}

        {/* LIST */}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((p) => (
              <div key={p._id} className="joy-card flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-sky-400 text-lg font-bold text-white">
                  {p.name?.charAt(0) || "?"}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-bold text-slate-800">{p.name}</p>
                  <p className="truncate text-sm text-slate-500">{p.phone}</p>
                  <p className="truncate text-sm text-slate-400">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}