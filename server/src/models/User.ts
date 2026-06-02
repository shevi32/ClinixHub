import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // אופציונלי עבור מי שנרשם דרך גוגל
  googleId?: string; // מזהה ייחודי של גוגל
  role: 'patient' | 'doctor' | 'admin';
  specialty?: string; // התחום של הרופא (למשל: Cardiology, Pediatrics)
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: function(this: any) { return !this.googleId; } },
    googleId: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    specialty: { type: String } // עוזר לסנן רופאים לפי ה-Select של התחומים
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);