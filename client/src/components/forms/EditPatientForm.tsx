import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  phone: string;
  email: string;
};

export default function EditPatientForm({
  patient,
  onClose,
  onUpdated,
}: {
  patient: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setError("");

      const res = await fetch(
        `http://localhost:3000/api/patients/${patient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "Update failed"
        );
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          width: 400,
          borderRadius: 10,
        }}
      >
        <h3>Edit Patient</h3>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            placeholder="Name"
            {...register("name", {
              required: "Required",
            })}
          />

          <p style={{ color: "red" }}>
            {errors.name?.message}
          </p>

          <input
            placeholder="Phone"
            {...register("phone", {
              required: "Required",
            })}
          />

          <p style={{ color: "red" }}>
            {errors.phone?.message}
          </p>

          <input
            placeholder="Email"
            {...register("email")}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button disabled={isSubmitting}>
              Save
            </button>

            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}