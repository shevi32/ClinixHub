
//ה-preHandler מריץ את הפונקציות לפי הסדר:
// 1. קודם מוודא שמישהו מחובר (verifyToken)
// 2. אחרי זה מוודא שזה אדמין (checkRole)

/**
 * הגדרת נתיבי אימות (Authentication Routes)
 * כולל רישום, התחברות ונתיבים מוגנים לפי תפקידים
 */
import { FastifyInstance } from 'fastify';
import { register, login } from '../controllers/authController';
import { verifyToken } from '../middlewares/authMiddleware';
import { checkRole } from '../middlewares/roleMiddleware';
import { ROLES } from '../constants/roles'; // זה הקובץ שיצרנו

/**
 * הגדרת נתיבי אימות (Authentication Routes)
 * כולל רישום, התחברות ונתיבים מוגנים לפי תפקידים למערכת Smart Clinic
 */
export async function authRoutes(fastify: FastifyInstance) {
    
    // נתיבים פתוחים לכולם
    fastify.post('/register', register);
    fastify.post('/login', login);

    // נתיב מוגן למטפל (Therapist)
    fastify.get('/therapist-dashboard', { 
        preHandler: [verifyToken, checkRole(ROLES.THERAPIST)] 
    }, async () => {
        return { message: "Welcome Therapist" };
    });

    // נתיב מוגן למטופל (Patient)
    fastify.get('/patient-dashboard', { 
        preHandler: [verifyToken, checkRole(ROLES.PATIENT)] 
    }, async () => {
        return { message: "Welcome Patient" };
    });
}