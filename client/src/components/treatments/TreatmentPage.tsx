import { useEffect, useState } from "react";
import api from "../../utils/api";
import { FaClipboardList, FaSave, FaIdCard, FaExclamationCircle } from "react-icons/fa";

type Treatment = {
  _id: string;
  patientId: string;
  notes: string;
};

export default function TreatmentPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [notes, setNotes] = useState("");
  const [patientId, setPatientId] = useState("");
  const [error, setError] = useState("");

  const fetchTreatments = async () => {
    const response = await api.get('/treatments');
    const data = response.data;
    setTreatments(data.data || data);
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const createTreatment = async () => {
    try {
      setError("");

      const response = await api.post('/treatments', { patientId, notes });
      const data = response.data;

      if (response.status >= 400) throw new Error(data.message);

      setNotes("");
      setPatientId("");
      fetchTreatments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-16 -right-16 h-64 w-64 bg-joy-sun" />
      <div className="joy-blob bottom-0 -left-16 h-64 w-64 bg-joy-coral" style={{ animationDelay: "2.5s" }} />

      <div className="relative z-10 mx-auto max-w-3xl p-6">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-xl text-white shadow-pop">
            <FaClipboardList />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">סיכומי טיפול</h2>
            <p className="text-sm text-slate-500">תיעוד קצר, ברור ונגיש לכל מטופל 📝</p>
          </div>
        </header>

        {/* FORM */}
        <div className="joy-card mb-8 space-y-4 p-6">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaIdCard className="text-joy-grape" /> מזהה מטופל/ת
            </label>
            <input
              placeholder="Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="joy-input"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-600">סיכום הטיפול</label>
            <textarea
              placeholder="מה עלה בטיפול היום..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="joy-input h-28 resize-none"
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              <FaExclamationCircle /> {error}
            </p>
          )}

          <button onClick={createTreatment} className="joy-btn-primary">
            <FaSave /> שמירת סיכום
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {treatments.map((t) => (
            <div key={t._id} className="joy-card flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
                📋
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">מטופל/ת: {t.patientId}</p>
                <p className="mt-1 text-sm text-slate-700">{t.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}