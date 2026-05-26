import { useForm } from "react-hook-form";
import { useState } from "react";

type FormData = {
  name: string;
  phone: string;
  email: string;
};

export default function CreatePatientForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setServerError("");

      const res = await fetch(
        "http://localhost:3000/api/patients",
        {
          method: "POST",
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
          result.message || "Create failed"
        );
      }

      reset();
      onCreated();
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        border: "1px solid #ddd",
        padding: 10,
        marginBottom: 20,
      }}
    >
      <h3>Create Patient</h3>

      {serverError && (
        <p style={{ color: "red" }}>
          {serverError}
        </p>
      )}

      <input
        placeholder="Name"
        {...register("name", {
          required: "Name is required",
        })}
      />

      <p style={{ color: "red" }}>
        {errors.name?.message}
      </p>

      <input
        placeholder="Phone"
        {...register("phone", {
          required: "Phone is required",
        })}
      />

      <p style={{ color: "red" }}>
        {errors.phone?.message}
      </p>

      <input
        placeholder="Email"
        {...register("email")}
      />

      <button disabled={isSubmitting}>
        {isSubmitting
          ? "Creating..."
          : "Create"}
      </button>
    </form>
  );
}