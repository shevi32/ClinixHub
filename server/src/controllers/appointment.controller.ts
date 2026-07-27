import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Appointment } from "../models/appointment.model.js";
import User from "../models/User.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validations/appointment.validation.js";
import { ZodError } from "zod";
import { ROLES } from "../constants/roles.js";
import {
  getAvailableSlotsCached,
  invalidateAvailableSlotsCache,
} from "../services/availability.service.js";
import { enqueueAppointmentNotification } from "../queues/notification.queue.js";

/** מחזיר true אם המשתמש המחובר הוא מטפל (רואה הכול), false אם הוא מטופל רגיל */
const isTherapist = (req: Request) =>
  (req as any).user?.role === ROLES.THERAPIST;

/** מזהה המשתמש המחובר, כפי שנשמר בטוקן ה-JWT */
const currentUserId = (req: Request) => (req as any).user?.id;

/** שדות שמטופל רשאי לעדכן בתור קיים - Whitelist מפורש (deny-by-default) */
const PATIENT_ALLOWED_UPDATE_FIELDS = ["startTime", "endTime", "notes"] as const;

/** שדות שמטפל (Admin) רשאי לעדכן בתור קיים */
const THERAPIST_ALLOWED_UPDATE_FIELDS = [
  "patientId",
  "therapistId",
  "startTime",
  "endTime",
  "notes",
  "status",
] as const;

/**
 * מחזיר object חדש שמכיל רק את השדות המותרים מתוך data (Whitelist).
 * לא נוגע ב-data המקורי ולא משתמש ב-delete - deny-by-default לכל שדה שלא ברשימה.
 */
const pickAllowedFields = <T extends Record<string, any>>(
  data: T,
  allowedFields: readonly string[]
): Partial<T> => {
  const result: Partial<T> = {};
  for (const key of allowedFields) {
    if (key in data) {
      (result as any)[key] = (data as any)[key];
    }
  }
  return result;
};

/* =========================
   CREATE APPOINTMENT
========================= */
export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // validation
    const validatedData =
      createAppointmentSchema.parse(req.body);

    // Determine patientId: patient requests derive from JWT, therapists must provide it.
    let effectivePatientId = currentUserId(req);
    if (isTherapist(req)) {
      if (!validatedData.patientId) {
        return res.status(400).json({
          success: false,
          message: "patientId is required when creating appointment as therapist",
        });
      }
      if (!mongoose.isValidObjectId(validatedData.patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patientId format",
        });
      }
      const patientUser = await User.findById(validatedData.patientId);
      if (!patientUser) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }
      effectivePatientId = validatedData.patientId;
    }

    if (!mongoose.isValidObjectId(validatedData.therapistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid therapistId format",
      });
    }
    const therapistUser = await User.findById(validatedData.therapistId);
    if (!therapistUser) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    // conflict check - חסימת חפיפה גם לפי מטפל וגם לפי מטופל; תורים שבוטלו לא נחשבים תפוסים
    const conflict = await Appointment.findOne({
      status: { $ne: "cancelled" },
      startTime: {
        $lt: validatedData.endTime,
      },
      endTime: {
        $gt: validatedData.startTime,
      },
      $or: [
        { therapistId: validatedData.therapistId },
        { patientId: effectivePatientId },
      ],
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
  patientId: effectivePatientId,
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

    // ה-Cache של השעות הפנויות ליום/מטפל הזה כבר לא מעודכן - מבטלים אותו
    await invalidateAvailableSlotsCache(
      appointment.therapistId,
      appointment.startTime
    );

    // מכניסים משימה לתור ה-BullMQ לשליחת אישור למטופל (מתבצע אסינכרונית ברקע)
    await enqueueAppointmentNotification({
      type: "appointment-confirmation",
      appointmentId: String(appointment._id),
      patientId: appointment.patientId,
      therapistId: appointment.therapistId,
      startTime: appointment.startTime.toISOString(),
    });

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

    next(error);
  }
};

/* =========================
   GET ALL APPOINTMENTS
========================= */
export const getAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, patientId, therapistId } = req.query;

    // Pagination מוגן: page >= 1, limit בין 1 ל-100, ערכים לא-מספריים מקבלים ברירת מחדל
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10)
    );
    const skip = (page - 1) * limit;

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
        .limit(limit);

    const total =
      await Appointment.countDocuments(
        filter
      );

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET AVAILABLE SLOTS (Redis Cache)
   שעות פנויות למטפל ביום נתון - נטענות מ-Cache (Redis) כשאפשר, כדי שלוח השנה
   יטען מהר במיוחד בלי לפגוע ב-DB בכל בקשה.
========================= */
export const getAvailableSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { therapistId, date } = req.query;

    if (!therapistId || !date) {
      return res.status(400).json({
        success: false,
        message: "therapistId and date query params are required",
      });
    }

    const { slots, fromCache } = await getAvailableSlotsCached(
      String(therapistId),
      String(date)
    );

    return res.status(200).json({
      success: true,
      data: slots,
      cached: fromCache,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsByPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // מטפל רואה את התורים של כל מטופל לפי ה-URL; מטופל רואה תמיד רק את התורים שלו עצמו -
    // גוזרים את הזהות מהטוקן ולא מה-URL, כדי לא להיתקע על state ישן/לא מסונכרן בקליינט.
    const patientId = isTherapist(req)
      ? String(req.params.patientId)
      : currentUserId(req);

    const appointments = await Appointment.find({ patientId });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET APPOINTMENT BY ID
========================= */
export const getAppointmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    // מטופל יכול לצפות רק בתור שלו עצמו
    if (!isTherapist(req) && appointment.patientId !== currentUserId(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own appointment",
      });
    }

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   UPDATE APPOINTMENT
========================= */
export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    // מטופל יכול לעדכן/לשנות רק את התור שלו עצמו - נבדק לפי הרשומה ב-DB (לא לפי קלט מהלקוח)
    if (!isTherapist(req) && existingAppointment.patientId !== currentUserId(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own appointment",
      });
    }

    // Whitelist לפי תפקיד: מטופל רשאי לעדכן רק startTime/endTime/notes (לא patientId/therapistId/status).
    // safeUpdateData הוא object חדש עם רק השדות המותרים - אין שימוש ב-delete על validatedData.
    const allowedFields = isTherapist(req)
      ? THERAPIST_ALLOWED_UPDATE_FIELDS
      : PATIENT_ALLOWED_UPDATE_FIELDS;
    const safeUpdateData = pickAllowedFields(validatedData, allowedFields);

    // =========================
    // חשוב: חישוב ערכים סופיים (עם Date תקין)
    // =========================
    const updatedStartTime = safeUpdateData.startTime
      ? new Date(safeUpdateData.startTime)
      : existingAppointment.startTime;

    const updatedEndTime = safeUpdateData.endTime
      ? new Date(safeUpdateData.endTime)
      : existingAppointment.endTime;

    const updatedTherapistId =
      safeUpdateData.therapistId ?? existingAppointment.therapistId;

    const updatedPatientId =
      safeUpdateData.patientId ?? existingAppointment.patientId;

    if (updatedEndTime <= updatedStartTime) {
      return res.status(400).json({
        success: false,
        message: "Appointment validation failed",
        errors: [
          {
            path: ["endTime"],
            message: "endTime must be after startTime",
          },
        ],
      });
    }

    if (!mongoose.isValidObjectId(updatedTherapistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid therapistId format",
      });
    }

    if (!mongoose.isValidObjectId(updatedPatientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patientId format",
      });
    }

    const therapistUser = await User.findById(updatedTherapistId);
    if (!therapistUser) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    const patientUser = await User.findById(updatedPatientId);
    if (!patientUser) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // =========================
    // CONFLICT CHECK (חובה) - גם לפי מטפל וגם לפי מטופל; תורים שבוטלו לא נחשבים תפוסים
    // =========================
    const conflict = await Appointment.findOne({
      _id: { $ne: id },
      status: { $ne: "cancelled" },
      startTime: { $lt: updatedEndTime },
      endTime: { $gt: updatedStartTime },
      $or: [
        { therapistId: updatedTherapistId },
        { patientId: updatedPatientId },
      ],
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Appointment time conflicts with another appointment",
      });
    }

    // =========================
    // UPDATE - רק safeUpdateData מגיע ל-DB, לעולם לא validatedData הגולמי
    // =========================
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        ...safeUpdateData,
        ...(safeUpdateData.startTime && {
          startTime: new Date(safeUpdateData.startTime),
        }),
        ...(safeUpdateData.endTime && {
          endTime: new Date(safeUpdateData.endTime),
        }),
      },
      { new: true }
    );

    if (appointment) {
      // מבטלים את ה-Cache גם ליום הישן וגם ליום החדש (במקרה שהתור הועבר ליום אחר)
      await invalidateAvailableSlotsCache(existingAppointment.therapistId, existingAppointment.startTime);
      await invalidateAvailableSlotsCache(appointment.therapistId, appointment.startTime);
    }

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

    next(error);
  }
};
/* =========================
   DELETE APPOINTMENT
========================= */
export const deleteAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // בדיקת הרשאה בתוך ה-controller עצמו (הגנת-עומק, לא רק ברמת ה-route)
    if (!isTherapist(req)) {
      return res.status(403).json({
        success: false,
        message: "Only a therapist can delete an appointment",
      });
    }

    await appointment.deleteOne();

    await invalidateAvailableSlotsCache(appointment.therapistId, appointment.startTime);

    return res.status(200).json({
      success: true,
      message:
        "Appointment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   CANCEL APPOINTMENT
========================= */
export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    // מטופל יכול לבטל רק את התור שלו עצמו
    if (!isTherapist(req) && appointment.patientId !== currentUserId(req)) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own appointment",
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

    // השעה שהתפנתה חוזרת להיות פנויה - מבטלים את ה-Cache
    await invalidateAvailableSlotsCache(appointment.therapistId, appointment.startTime);

    // מכניסים משימה לתור לשליחת הודעת ביטול למטופל
    await enqueueAppointmentNotification({
      type: "appointment-cancelled",
      appointmentId: String(appointment._id),
      patientId: appointment.patientId,
      therapistId: appointment.therapistId,
      startTime: appointment.startTime.toISOString(),
    });

    return res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};
