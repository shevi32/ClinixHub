// המודל מגדיר את מבנה המשתמש במסד הנתונים
// כאן נגדיר אילו שדות חובה יש למשתמש (email, password)

export interface User {
    id?: string;
    email: string;
    passwordHash: string;
    role: 'Admin' | 'User'; 
}

// בפרויקט אמיתי כאן תהיה גם הגדרה לספריה כמו Mongoose או Prisma

//@@@@@@@@@@@@@@@@@@@@@@@@@@
//כשיהיה חיבור לDB למחוק את הקוד למעלה ולהשאיר אותו
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'User'], default: 'User' }
});

export const User = mongoose.model('User', userSchema);