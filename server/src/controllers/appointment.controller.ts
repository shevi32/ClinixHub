import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validations/appointment.validation.js";
import { ZodError } from "zod";

/* =========================
   CREATE APPOINTMENT
========================= */
export const createAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    // validation
    const validatedData =
      createAppointmentSchema.parse(req.body);

    // conflict check
    const conflict = await Appointment.findOne({
      therapistId: validatedData.therapistId,
      startTime: {
        $lt: validatedData.endTime,
      },
      endTime: {
        $gt: validatedData.startTime,
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "Appointment time conflicts with another appointment",
        errors: [
          {
            path: ["time"],
            message:
              "Therapist already has an appointment in this time range",
          },
        ],
      });
    }

    // clean data
  const cleanData = {
  patientId: validatedData.patientId,
  therapistId: validatedData.therapistId,
  startTime: validatedData.startTime,
  endTime: validatedData.endTime,
  status: "scheduled" as const,

  ...(validatedData.notes !== undefined &&
  validatedData.notes.trim() !== ""
    ? { notes: validatedData.notes }
    : {}),
};

    // create
    const appointment =
      await Appointment.create(cleanData);

    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment validation failed",
        errors: error.issues.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating appointment",
    });
  }
};

/* =========================
   GET ALL APPOINTMENTS
========================= */
export const getAppointments = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      patientId,
      therapistId,
    } = req.query;

    const skip =
      (Number(page) - 1) * Number(limit);

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (patientId) {
      filter.patientId = patientId;
    }

    if (therapistId) {
      filter.therapistId = therapistId;
    }

    const appointments =
      await Appointment.find(filter)
        .skip(skip)
        .limit(Number(limit));

    const total =
      await Appointment.countDocuments(
        filter
      );

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(
          total / Number(limit)
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

/* =========================
   GET APPOINTMENT BY ID
========================= */
export const getAppointmentById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const appointment =
      await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(
      "Get appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error fetching appointment",
    });
  }
};

/* =========================
   UPDATE APPOINTMENT
========================= */
export const updateAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // validation
    const validatedData = updateAppointmentSchema.parse(req.body);

    const existingAppointment = await Appointment.findById(id);

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // =========================
    // חשוב: חישוב ערכים סופיים (עם Date תקין)
    // =========================
    const updatedStartTime = validatedData.startTime
      ? new Date(validatedData.startTime)
      : existingAppointment.startTime;

    const updatedEndTime = validatedData.endTime
      ? new Date(validatedData.endTime)
      : existingAppointment.endTime;

    const updatedTherapistId =
      validatedData.therapistId ?? existingAppointment.therapistId;

    // =========================
    // CONFLICT CHECK (חובה)
    // =========================
    const conflict = await Appointment.findOne({
      _id: { $ne: id },
      therapistId: updatedTherapistId,
      startTime: { $lt: updatedEndTime },
      endTime: { $gt: updatedStartTime },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Appointment time conflicts with another appointment",
      });
    }

    // =========================
    // UPDATE
    // =========================
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        ...(validatedData.startTime && {
          startTime: new Date(validatedData.startTime),
        }),
        ...(validatedData.endTime && {
          endTime: new Date(validatedData.endTime),
        }),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Appointment validation failed",
        errors: error.issues.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating appointment",
    });
  }
};
/* =========================
   DELETE APPOINTMENT
========================= */
export const deleteAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const appointment =
      await Appointment.findByIdAndDelete(
        id
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Appointment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error deleting appointment",
    });
  }
};

/* =========================
   CANCEL APPOINTMENT
========================= */
export const cancelAppointment = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const appointment =
      await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // prevent invalid cancel
    if (
      appointment.status ===
        "completed" ||
      appointment.status ===
        "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment cannot be cancelled",
      });
    }

    appointment.status =
      "cancelled";

    await appointment.save();

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Error cancelling appointment",
    });
  }
};