// import { Request, Response } from "express";
// import { Appointment } from "../models/appointment.model.js";
// import {
//   createAppointmentSchema,
//   updateAppointmentSchema,
// } from "../validations/appointment.validation.js";
// import { ZodError } from "zod";

// export const createAppointment = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     // 1. validation
//     const validatedData = createAppointmentSchema.parse(req.body);

//     // 2. business rule - overlap check
//     const conflict = await Appointment.findOne({
//       therapistId: validatedData.therapistId,
//       startTime: { $lt: validatedData.endTime },
//       endTime: { $gt: validatedData.startTime },
//     });

//     if (conflict) {
//       return res.status(409).json({
//         success: false,
//         message: "Appointment time conflicts with another appointment",
//         errors: [
//           {
//             path: ["time"],
//             message: "Therapist already has an appointment in this time range",
//           },
//         ],
//       });
//     }
// const cleanData = {
//   ...validatedData,
//   notes: validatedData.notes ?? undefined,
// };
//     // 3. create
// const appointment = await Appointment.create({
//   ...validatedData,
//   notes: validatedData.notes || undefined,
// } as any);
//   } catch (error) {
//     console.error("Create appointment error:", error);

//     // 4. Zod validation errors (structured)
//     if (error instanceof ZodError) {
//       return res.status(400).json({
//         success: false,
//         message: "Appointment validation failed",
//         errors: error.issues.map((e) => ({
//           path: e.path,
//           message: e.message,
//         })),
//       });
//     }

//     // 5. fallback error (Mongo / runtime / etc.)
//     return res.status(500).json({
//       success: false,
//       message: "Server error while creating appointment",
//     });
//   }
// };

// export const getAppointments = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       status,
//       patientId,
//       therapistId,
//     } = req.query;

//     const skip = (Number(page) - 1) * Number(limit);

//     const filter: any = {};

//     if (status) filter.status = status;
//     if (patientId) filter.patientId = patientId;
//     if (therapistId) filter.therapistId = therapistId;

//     const appointments = await Appointment.find(filter)
//       .skip(skip)
//       .limit(Number(limit));

//     const total = await Appointment.countDocuments(filter);

//     return res.status(200).json({
//       success: true,
//       data: appointments,
//       pagination: {
//         total,
//         page: Number(page),
//         pages: Math.ceil(total / Number(limit)),
//       },
//     });
//   } catch (error) {
//     console.error("Get appointments error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Error fetching appointments",
//     });
//   }
// };

// export const getAppointmentById = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     const appointment = await Appointment.findById(id);

//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: "Appointment not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: appointment,
//     });
//   } catch (error) {
//     console.error("Get appointment error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Error fetching appointment",
//     });
//   }
// };

// export const updateAppointment = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     const validatedData = updateAppointmentSchema.parse(req.body);
// const appointment = await Appointment.create({

//     const appointment = await Appointment.findByIdAndUpdate(
//       id,
//       validatedData,
//       { new: true }
//     );

//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: "Appointment not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: appointment,
//     });
//   } catch (error) {
//     console.error("Update appointment error:", error);

//     if (error instanceof ZodError) {
//       return res.status(400).json({
//         success: false,
//         message: "Appointment validation failed",
//         errors: error.issues.map((e) => ({
//           path: e.path,
//           message: e.message,
//         })),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Error updating appointment",
//     });
//   }
// };

// export const deleteAppointment = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { id } = req.params;

//     const appointment = await Appointment.findByIdAndDelete(id);

//     if (!appointment) {
//       return res.status(404).json({
//         success: false,
//         message: "Appointment not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Appointment deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete appointment error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Error deleting appointment",
//     });
//   }
// };
import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validations/appointment.validation.js";
import { ZodError } from "zod";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    // 1. validation
    const validatedData = createAppointmentSchema.parse(req.body);

    // 2. business rule - overlap check
    const conflict = await Appointment.findOne({
      therapistId: validatedData.therapistId,
      startTime: { $lt: validatedData.endTime },
      endTime: { $gt: validatedData.startTime },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Appointment time conflicts with another appointment",
        errors: [
          {
            path: ["time"],
            message: "Therapist already has an appointment in this time range",
          },
        ],
      });
    }

    // 3. clean data (fix undefined issues)
    const cleanData = {
      ...validatedData,
      ...(validatedData.notes ? { notes: validatedData.notes } : {}),
    };

    // 4. create
    const appointment = await Appointment.create(cleanData);

    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    // 5. Zod validation errors
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

    // 6. fallback
    return res.status(500).json({
      success: false,
      message: "Server error while creating appointment",
    });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      patientId,
      therapistId,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};

    if (status) filter.status = status;
    if (patientId) filter.patientId = patientId;
    if (therapistId) filter.therapistId = therapistId;

    const appointments = await Appointment.find(filter)
      .skip(skip)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching appointments",
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

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
    console.error("Get appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching appointment",
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const validatedData = updateAppointmentSchema.parse(req.body);

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      validatedData,
      { new: true }
    );

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

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error("Delete appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Error deleting appointment",
    });
  }
};






