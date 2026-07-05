// import { FastifyReply, FastifyRequest } from 'fastify';
// import jwt from 'jsonwebtoken';

// export const verifyToken = async (req: FastifyRequest, reply: FastifyReply) => {
//     try {
//         // משיכת הטוקן מה-Header של הבקשה
//         const authHeader = req.headers.authorization;
//         const token = authHeader?.split(' ')[1]; // פורמט: "Bearer <token>"

//         if (!token) return reply.status(401).send({ error: "Unauthorized" });

//         // אימות הטוקן מול הסוד (SECRET) ששמור ב-.env
//         const secret = process.env.JWT_SECRET || 'supersecret';
//         jwt.verify(token, secret);
        
//     } catch (err) {
//         return reply.status(403).send({ error: "Invalid token" });
//     }
// };
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

/**
 * Middleware לאימות טוקן JWT
 * מוודא שהמשתמש מחובר ושומר את נתוניו ב-req לצורך המשך טיפול
 */
export const verifyToken = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = req.headers.authorization;
        // שליפת הטוקן מה-Header בפורמט "Bearer token"
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return reply.status(401).send({ error: "Unauthorized: No token provided" });
        }

        const secret = process.env.JWT_SECRET as string;
        // פענוח ואימות הטוקן
        const decoded = jwt.verify(token, secret);
        
        // הזרקת פרטי המשתמש לבקשה כדי שיהיו זמינים ל-Middlewares הבאים
        (req as any).user = decoded; 
        
    } catch (err) {
        return reply.status(403).send({ error: "Invalid or expired token" });
    }
};