import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  patientId?: mongoose.Types.ObjectId; // אופציונלי - אם ריק, התור פנוי!
  doctorId: mongoose.Types.ObjectId;  // קישור ל-ID של הרופא
  department: string;                  // התחום הנבחר
  appointmentDate: Date;               // תאריך ושעה מדויקים של התור
  status: 'available' | 'pending' | 'confirmed' | 'cancelled';
}

const AppointmentSchema: Schema = new Schema(
  {
    // אם התור פנוי, ה-patientId יהיה null או לא קיים
    patientId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { 
      type: String, 
      required: true,
      enum: ['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'General']
    },
    appointmentDate: { type: Date, required: true }, // תוקן ל-Date
    status: { 
      type: String, 
      enum: ['available', 'pending', 'confirmed', 'cancelled'], 
      default: 'available' 
    }
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);