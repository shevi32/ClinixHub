import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();
  
  // 1. שליפת פרטי המשתמש המחובר מתוך ה-State של Redux
  // שימי לב: ודאי שזהו המבנה של ה-slice שלך (למשל state.auth.user)
  const { user } = useSelector((state: any) => state.auth);

  // חילוץ השם הפרטי של המשתמש, אם הוא לא קיים נציג ברירת מחדל
  const userFirstName = user?.firstName || user?.name || 'מטופל/ת';

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-slate-50 text-right" dir="rtl">
      
      {/* כותרת עמוד וברכה אישית מ-Redux */}
      <header className="mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">שלום, {userFirstName} 👋</h1>
        <p className="text-slate-500 mt-1">ברוך הבא לאזור האישי שלך ב-ClinixHub</p>
      </header>

      {/* גריד של כרטיסיות מידע ופעולות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* כרטיסייה 1: התור הקרוב */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">📅</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">התור הקרוב שלך</h3>
            <p className="text-slate-600 text-sm">אין לך תורים מתוכננים לימים הקרובים.</p>
          </div>
          <button 
            onClick={() => navigate('/book-appointment')} // בהמשך תעשי עמוד כזה
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
          >
            קביעת תור חדש
          </button>
        </div>

        {/* כרטיסייה 2: פעולות מהירות וקישורים */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-4">פעולות מהירות</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <button 
                onClick={() => navigate('/appointment-history')}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-right w-full"
              >
                ← צפייה בהיסטוריית טיפולים ותורים
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/profile')}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-right w-full"
              >
                ← עדכון פרטים אישיים ורפואיים
              </button>
            </li>
          </ul>
        </div>

        {/* כרטיסייה 3: תקציר פרופיל / מידע כללי */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-2xl mb-2">👤</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">פרטי המנוי</h3>
          <div className="text-sm text-slate-600 space-y-1 mt-4">
            <p><span className="font-medium text-slate-700">אימייל:</span> {user?.email || 'לא עודכן'}</p>
            <p><span className="font-medium text-slate-700">סוג חשבון:</span> מטופל / הורה</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientDashboard;