import { useEffect, useState } from "react";
import api from "../../utils/api";

import CreatePatientForm from "../forms/CreatePatientForm";
import EditPatientForm from "../forms/EditPatientForm";

type Patient = {
  _id: string;
  name: string;
  phone: string;
  email: string;
};

export default function PatientsDashboard() {
  const [patients, setPatients] = useState<
    Patient[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const limit = 5;

  const [editingPatient, setEditingPatient] =
    useState<any>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);

      setError("");

      const params = new URLSearchParams();

      params.append("page", String(page));

      params.append("limit", String(limit));

      if (search) {
        params.append("search", search);
      }

      const response = await api.get('/patients', { params });
      const data = response.data;

      setPatients(data.data || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const deletePatient = async (
    id: string
  ) => {
    try {
      await api.delete(`/patients/${id}`);

      fetchPatients();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Patients Dashboard</h2>

      <CreatePatientForm
        onCreated={fetchPatients}
      />

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search patient..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <button onClick={fetchPatients}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {patients.map((patient) => (
        <div
          key={patient._id}
          style={{
            border: "1px solid #ddd",
            marginBottom: 10,
            padding: 10,
          }}
        >
          <div>
            <strong>Name:</strong>{" "}
            {patient.name}
          </div>

          <div>
            <strong>Phone:</strong>{" "}
            {patient.phone}
          </div>

          <div>
            <strong>Email:</strong>{" "}
            {patient.email}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              onClick={() =>
                setEditingPatient(patient)
              }
            >
              Edit
            </button>

            <button
              onClick={() =>
                deletePatient(patient._id)
              }
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
        }}
      >
        <button
          disabled={page === 1}
          onClick={() =>
            setPage(page - 1)
          }
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          onClick={() =>
            setPage(page + 1)
          }
        >
          Next
        </button>
      </div>

      {editingPatient && (
        <EditPatientForm
          patient={editingPatient}
          onClose={() =>
            setEditingPatient(null)
          }
          onUpdated={fetchPatients}
        />
      )}
    </div>
  );
}
