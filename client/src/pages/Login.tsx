import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import api from '../utils/api.js';
import { useState } from 'react';

// 1. הגדרת סכמת הולידציה של הטופס בעזרת Zod
const loginSchema = z.object({
  email: z.string().email('כתובת אימייל אינה תקינה'),
  password: z.string().min(6, 'הסיסמה חייבת להכיל לפחות 6 תווים'),
});

// גזירת הטיפוסים הסטטיים של הנתונים מתוך הסכמה
type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2.חיווט ה-React Hook Form יחד עם ה-Zod Resolver
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // 3. פונקציית שליחת הטופס לשרת ה-Fastify
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      // שליחת בקשת POST לשרת (ה-Interceptor יתעלם מזה כי עוד אין טוקן)
      const response = await api.post('/auth/login', data);
      
      // שליפת הטוקן והמשתמש שחזרו מה-Fastify authController
      const { token, user } = response.data;
      
      // עדכון ה-Context הגלובלי וה-LocalStorage
      login(token, user);
      
      // הפניית המשתמש ליעד המתאים לפי התפקיד שלו במערכת
      if (user.role === 'Admin') {
        navigate('/therapist-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } catch (error: any) {
      // תפיסת שגיאות מהשרת (למשל: סיסמה שגויה או משתמש לא קיים)
      setErrorMessage(error.response?.data?.message || 'שגיאת התחברות. נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>התחברות למערכת Smart Clinic</h2>
      
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

        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isSubmitting ? 'מתחבר...' : 'התחבר'}
        </button>
      </form>
    </div>
  );
}