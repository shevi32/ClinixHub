import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../redux/appointmentSlice';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  
  const { user } = useSelector((state: any) => state.auth || {});
  const { list: appointments = [] } = useSelector((state: any) => state.appointments || {});

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      dispatch(fetchAppointments(userId));
    }
  }, [dispatch, user]);

  // תיקון: מציאת התור העתידי הקרוב ביותר בזמן אמת!
  const now = new Date();
  const upcoming = appointments
    .filter((apt: any) => new Date(apt.startTime) >= now && apt.status !== 'cancelled')
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const nextAppointment = upcoming[0];
  const userFirstName = user?.firstName || user?.name || 'מטופל/ת';

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-slate-50 text-right" dir="rtl">
      <header className="mb-8 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">שלום, {userFirstName} 👋</h1>
        <p className="text-slate-500 mt-1">ברוך הבא לאזור האישי שלך ב-ClinixHub</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* כרטיסייה 1: דינמית לחלוטין לפי הדרישות */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="text-2xl mb-2">📅</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">התור הקרוב שלך</h3>
            
            {nextAppointment ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-1">
                <p className="text-sm font-semibold text-blue-900">
                  מטפל: {nextAppointment.therapistId === 'therapist_1' ? 'ד"ר ישראלי ישראל' : "פרופ' כהן שרה"}
                </p>
                <p className="text-xs text-blue-700">
                  מועד: {formatDateTime(nextAppointment.startTime)}
                </p>
                <p className="text-xs text-blue-600 truncate">
                  הערה: {nextAppointment.notes || 'אין הערות'}
                </p>
              </div>
            ) : (
              <p className="text-slate-600 text-sm">אין לך תורים מתוכננים לימים הקרובים.</p>
            )}
          </div>
          <button 
            onClick={() => navigate('/book-appointment')}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center text-sm"
          >
            קביעת תור חדש
          </button>
        </div>

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
          </ul>
        </div>

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