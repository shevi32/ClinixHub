import { Request, Response, NextFunction } from "express";
import { Appointment } from "../models/appointment.model.js";
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

    // לעולם לא סומכים על patientId שהלקוח שולח בשביל מטופל - גוזרים אותו מהטוקן המאומת עצמו.
    // כך גם אם ה-state בדפדפן "מבולבל" (למשל כמה טאבים עם משתמשים שונים), התור נקבע בוודאות
    // למשתמש שבאמת מאומת כרגע, בלי 403 מבלבל ובלי אפשרות לקבוע תור בשם מישהו אחר.
    // Admin (מטפל) הוא היחיד שמורשה לקבוע תור בשם מטופל אחר, ולכן שולח patientId מפורש.
    const effectivePatientId = isTherapist(req)
      ? validatedData.patientId
      : currentUserId(req);

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

    // מטופל לא רשאי "להעביר" תור למטופל אחר ע"י שינוי patientId בגוף הבקשה - מתעלמים מזה עבורו
    if (!isTherapist(req)) {
      delete validatedData.patientId;
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
