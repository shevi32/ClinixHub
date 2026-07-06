import { useEffect, useState } from "react";

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
    const res = await fetch("http://localhost:5000/api/treatments");
    const data = await res.json();
    setTreatments(data);
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  const createTreatment = async () => {
    try {
      setError("");

      const res = await fetch("http://localhost:5000/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, notes }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setNotes("");
      setPatientId("");
      fetchTreatments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Treatment Summary</h2>

      {/* FORM */}
      <input
        placeholder="Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />

      <textarea
        placeholder="Treatment notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button onClick={createTreatment}>Save</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LIST */}
      {treatments.map((t) => (
        <div key={t._id} style={{ border: "1px solid #ddd", margin: 5, padding: 10 }}>
          <div>Patient: {t.patientId}</div>
          <div>{t.notes}</div>
        </div>
      ))}
    </div>
  );
}