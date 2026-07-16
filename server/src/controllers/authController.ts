// import { FastifyReply, FastifyRequest } from 'fastify';
// import bcrypt from 'bcrypt';

// // פונקציית הרשמה לתקן!!!!!!!!!!!!!
// export const register = async (req: FastifyRequest, reply: FastifyReply) => {
//     const { email, password } = req.body as any;

//     // 1. הצפנת הסיסמה (Hash)
//     // 10 הוא מספר הסבבים (ככל שיותר גבוה - יותר בטוח אבל איטי יותר)
//     const passwordHash = await bcrypt.hash(password, 10);

//     // 2. כאן תכניסי את הקוד ששומר את המשתמש ב-DB שלך
//     // await saveUserToDb({ email, passwordHash });

//     return reply.status(201).send({ message: "User registered successfully" });
// };


//בנתיים עד שיהיה DB

import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ROLES } from '../constants/roles.js';

// מערך זמני בזיכרון
const users: any[] = [];

/**
 * פונקציית רישום
 */
export const register = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password, role } = req.body as { email: string, password: string, role?: string };

    // הצפנת סיסמה
    const passwordHash = await bcrypt.hash(password, 10);
    
    // וידוא שהתפקיד תקין לפי הקבועים
    const assignedRole = (role === ROLES.THERAPIST) ? ROLES.THERAPIST : ROLES.PATIENT;

    // יצירת משתמש ושמירה במערך
    const newUser = { 
        id: Date.now().toString(), 
        email, 
        passwordHash, 
        role: assignedRole 
    };
    users.push(newUser);

    return reply.status(201).send({ message: "User registered successfully" });
};

/**
 * פונקציית התחברות
 */
export const login = async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string, password: string };

    // מציאת משתמש במערך
    const user = users.find(u => u.email === email);
    if (!user) return reply.status(401).send({ error: "Invalid credentials" });

    // בדיקת סיסמה
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return reply.status(401).send({ error: "Invalid credentials" });

    // יצירת טוקן עם התפקיד מהמערך
    const token = jwt.sign(
        { id: user.id, role: user.role }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: '1h' }
    );

    return reply.send({ token });
};

//
//כשיהיה חיבור לDB למחוק את הקוד למעלה ולהשאיר אותו
// import { FastifyReply, FastifyRequest } from 'fastify';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// // 1. ייבוא ה-Model מהפרויקט שלך (תוודאי שהנתיב נכון)
// import { User } from '../models/userModel'; 
// import { ROLES } from '../constants/roles';

// /**
//  * פונקציית רישום: עובדת מול MongoDB
//  */
// export const register = async (req: FastifyRequest, reply: FastifyReply) => {
//     // הוספנו טיפוסיות בסיסית
//     const { email, password, role } = req.body as { email: string, password: string, role?: string };

//     // הצפנת סיסמה
//     const passwordHash = await bcrypt.hash(password, 10);
    
//     // 2. שמירה ב-MongoDB במקום במערך
//     // אם לא נשלח תפקיד, נגדיר כ-PATIENT כברירת מחדל
//     const userRole = (role === ROLES.THERAPIST) ? ROLES.THERAPIST : ROLES.PATIENT;
    
//     const newUser = await User.create({ 
//         email, 
//         passwordHash, 
//         role: userRole 
//     });

//     return reply.status(201).send({ message: "User registered successfully", userId: newUser._id });
// };

// /**
//  * פונקציית התחברות: עובדת מול MongoDB
//  */
// export const login = async (req: FastifyRequest, reply: FastifyReply) => {
//     const { email, password } = req.body as { email: string, password: string };

//     // 3. חיפוש ב-DB
//     const user = await User.findOne({ email });
//     if (!user) return reply.status(401).send({ error: "Invalid credentials" });

//     // בדיקת סיסמה
//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) return reply.status(401).send({ error: "Invalid credentials" });

//     // יצירת טוקן עם ה-role מה-DB
//     const token = jwt.sign(
//         { id: user._id, role: user.role }, 
//         process.env.JWT_SECRET as string, 
//         { expiresIn: '1h' }
//     );

//     return reply.send({ token });
// };