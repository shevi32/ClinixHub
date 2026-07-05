import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import api from '../utils/api.js';
import { useState } from 'react';


// 1. הגדרת סכמת הולידציה של טופס ההרשמה בעזרת Zod
const registerSchema = z.object({
  email: z.string().email('כתובת אימייל אינה תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
  role: z.enum(['Admin', 'User'], {
    errorMap: () => ({ message: 'חובה לבחור תפקיד במערכת' }),
  }),
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
      setErrorMessage(error.response?.data?.message || 'שגיאה בתהליך ההרשמה. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>הרשמה למערכת Smart Clinic</h2>
      
      {errorMessage && <div style={{ color: 'red', marginBottom: '15px' }}>{errorMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* שדה אימייל */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>אימייל:</label>
          <input type="email" {...register('email')} style={{ width: '100%', padding: '8px' }} />
          {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
        </div>

        {/* שדה סיסמה */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>סיסמה:</label>
          <input type="password" {...register('password')} style={{ width: '100%', padding: '8px' }} />
          {errors.password && <span style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</span>}
        </div>

        {/* שדה בחירת תפקיד */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>סוג משתמש:</label>
          <select { ...register('role') } style={{ width: '100%', padding: '8px' }}>
            <option value="User">מטופל / הורה למטופל</option>
            <option value="Admin">מטפל מוסמך (מנהל קליניקה)</option>
          </select>
          {errors.role && <span style={{ color: 'red', fontSize: '12px' }}>{errors.role.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isSubmitting ? 'מבצע הרשמה...' : 'הירשם והכנס למערכת'}
        </button>
      </form>
    </div>
  );
}