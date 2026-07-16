import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import api from '../utils/api.js';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaUserTag, FaUserPlus, FaExclamationCircle } from 'react-icons/fa';
import authImage from '../assets/clinic-auth.png';


// 1. הגדרת סכמת הולידציה של טופס ההרשמה בעזרת Zod
const registerSchema = z.object({
  email: z.string().email('כתובת אימייל אינה תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
  role: z.enum(['Admin', 'User']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. חיווט ה-React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'User' // ברירת מחדל: מטופל/הורה
    }
  });

  // 3. שליחת נתוני הרישום לשרת
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // שליחת בקשת POST לנתיב ה-Register של Fastify
      const response = await api.post('/auth/register', data);
      
      const { token, user } = response.data;
      
      // ביצוע לוגין אוטומטי מיד לאחר הרשמה מוצלחת
      login(token, user);
      
      // ניווט לדאשבורד המתאים
      if (user.role === 'Admin') {
        navigate('/therapist-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || error.response?.data?.error || 'שגיאה בתהליך ההרשמה. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 p-6" dir="rtl">
      <div className="joy-blob -top-20 -left-20 h-72 w-72 bg-joy-sun" />
      <div className="joy-blob bottom-0 -right-16 h-64 w-64 bg-joy-coral" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="w-full p-8 sm:p-10 lg:w-1/2">
          <div className="mb-6 text-center lg:text-right">
            <span className="text-3xl">🌟</span>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-800">הצטרפו ל-ClinixHub</h2>
            <p className="mt-1 text-sm text-slate-500">דקה אחת של הרשמה, וכל הקליניקה בכף היד שלכם</p>
          </div>

          {errorMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              <FaExclamationCircle /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-600">אימייל</label>
              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" {...register('email')} className="joy-input pr-10" placeholder="you@example.com" />
              </div>
              {errors.email && <span className="mt-1 block text-xs font-medium text-rose-500">{errors.email.message}</span>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-600">סיסמה</label>
              <div className="relative">
                <FaLock className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" {...register('password')} className="joy-input pr-10" placeholder="••••••••" />
              </div>
              {errors.password && <span className="mt-1 block text-xs font-medium text-rose-500">{errors.password.message}</span>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-600">סוג משתמש</label>
              <div className="relative">
                <FaUserTag className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select {...register('role')} className="joy-input appearance-none pr-10">
                  <option value="User">מטופל / הורה למטופל</option>
                  <option value="Admin">מטפל מוסמך (מנהל קליניקה)</option>
                </select>
              </div>
              {errors.role && <span className="mt-1 block text-xs font-medium text-rose-500">{errors.role.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting} className="joy-btn-warm w-full text-base">
              {isSubmitting ? 'מבצע הרשמה...' : (<><FaUserPlus /> הירשם והכנס למערכת</>)}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            יש לך כבר חשבון?{' '}
            <Link to="/login" className="font-bold text-joy-teal hover:underline">
              התחברות
            </Link>
          </p>
        </div>

        <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-purple-100 via-sky-50 to-teal-100 p-8 lg:flex">
          <img src={authImage} alt="מטפלת עומדת לצד מסך הרשמה מאובטח" className="w-full max-w-xs animate-float" />
        </div>
      </div>
    </div>
  );
}
