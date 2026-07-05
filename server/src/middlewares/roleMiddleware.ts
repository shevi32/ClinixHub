// import { FastifyReply, FastifyRequest } from 'fastify';

// /**
//  * Middleware לבדיקת הרשאות לפי תפקיד
//  * @param requiredRole - התפקיד הנדרש לגישה לנתיב (למשל 'Admin')
//  */
//  export const checkRole = (requiredRole: 'Admin' | 'User') => {
//     return async (req: FastifyRequest, reply: FastifyReply) => {
//         // משיכת פרטי המשתמש שהוזרקו ב-verifyToken
//         const user = (req as any).user;

//         // בדיקה האם המשתמש קיים והאם התפקיד שלו תואם לדרישה
//         if (!user || user.role !== requiredRole) {
//             return reply.status(403).send({ error: "Forbidden: Insufficient permissions" });
//         }
//     };
// };
import { FastifyReply, FastifyRequest } from 'fastify';
import { ROLES } from '../constants/roles.js'; // ייבוא התפקידים מהקובץ החדש

/**
 * Middleware לבדיקת הרשאות לפי תפקיד
 * מוודא שלמשתמש המחובר יש את התפקיד הנדרש
 */
export const checkRole = (requiredRole: string) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        // משיכת פרטי המשתמש שהוזרקו ב-verifyToken
        const user = (req as any).user;

        // בדיקה האם המשתמש קיים והאם התפקיד שלו תואם לדרישה
        if (!user || user.role !== requiredRole) {
            return reply.status(403).send({ error: "Forbidden: Insufficient permissions" });
        }
    };
};