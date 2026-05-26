import { useEffect, useState } from "react";

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

      const res = await fetch("http://localhost:3000/api/patients");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setPatients(data);
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

      const res = await fetch("http://localhost:3000/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setForm({ name: "", phone: "", email: "" });
      fetchPatients();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Patients</h2>

      {/* FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button onClick={createPatient}>Add Patient</button>
      </div>

      {/* STATES */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LIST */}
      {patients.map((p) => (
        <div key={p._id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 5 }}>
          <div>{p.name}</div>
          <div>{p.phone}</div>
          <div>{p.email}</div>
        </div>
      ))}
    </div>
  );
}