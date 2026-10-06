import { useCallback, useEffect, useState } from "react";
import api from "../utils/api";
import { FaClipboardList, FaExclamationCircle, FaRedo } from "react-icons/fa";

type Treatment = {
  _id: string;
  patientId: string;
  notes: string;
  released: boolean;
  createdAt?: string;
};

export default function PatientTreatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTreatments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/treatments/my");
      setTreatments(response.data.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || "לא ניתן לטעון את סיכומי הטיפול.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTreatments();
  }, [loadTreatments]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="relative z-10 mx-auto max-w-3xl p-6">
        <header className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-xl text-white shadow-pop">
            <FaClipboardList />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">סיכומי הטיפול שלי</h1>
            <p className="text-sm text-slate-500">סיכומים שהמטפל/ת שחרר/ה לצפייה</p>
          </div>
        </header>

        <div className="mb-6 flex justify-end">
          <button type="button" onClick={() => void loadTreatments()} disabled={loading} className="joy-btn-soft">
            <FaRedo /> {loading ? "טוען..." : "רענון סיכומים"}
          </button>
        </div>

        {loading && <p role="status" className="py-6 text-center text-slate-500">טוען סיכום טיפול...</p>}

        {!loading && error && (
          <p role="alert" className="joy-card flex items-center gap-2 p-4 text-sm font-medium text-rose-600">
            <FaExclamationCircle /> {error}
          </p>
        )}

        {!loading && !error && treatments.length === 0 && (
          <p className="joy-card p-4 text-sm text-slate-500">
            עדיין לא שוחררו סיכומי טיפול לחשבון שלך.
          </p>
        )}

        {!loading && !error && treatments.length > 0 && (
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <article key={treatment._id} className="joy-card p-5">
                <p className="text-xs text-slate-500">
                  {treatment.createdAt
                    ? new Date(treatment.createdAt).toLocaleDateString("he-IL")
                    : "סיכום ששוחרר לצפייה"}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-slate-800">{treatment.notes}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}