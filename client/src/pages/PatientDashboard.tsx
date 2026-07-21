import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../redux/appointmentSlice';
import { FaCalendarCheck, FaBolt, FaUserCircle, FaHistory, FaCalendarPlus } from 'react-icons/fa';

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-20 -left-20 h-72 w-72 bg-joy-sky" />
      <div className="joy-blob bottom-0 right-0 h-64 w-64 bg-joy-sun" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 mx-auto max-w-6xl p-6">
        <header className="mb-8 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-800">
            שלום, {userFirstName} <span className="inline-block animate-wiggle">👋</span>
          </h1>
          <p className="mt-1 text-slate-500">ברוך הבא לאזור האישי שלך ב-ClinixHub 🌿</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {/* כרטיסייה 1: דינמית לחלוטין לפי הדרישות */}
          <div className="joy-card flex flex-col justify-between p-6">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 text-xl text-white shadow-pop">
                <FaCalendarCheck />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-800">התור הקרוב שלך</h3>

              {nextAppointment ? (
                <div className="space-y-1 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                  <p className="text-sm font-semibold text-teal-900">
                    מטפל: {nextAppointment.therapistId === 'therapist_1' ? 'ד"ר ישראלי ישראל' : "פרופ' כהן שרה"}
                  </p>
                  <p className="text-xs text-teal-700">
                    מועד: {formatDateTime(nextAppointment.startTime)}
                  </p>
                  <p className="truncate text-xs text-teal-600">
                    הערה: {nextAppointment.notes || 'אין הערות'}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">אין לך תורים מתוכננים לימים הקרובים. 🌤️</p>
              )}
            </div>
            <button
              onClick={() => navigate('/book-appointment')}
              className="joy-btn-primary mt-4 w-full text-sm"
            >
              <FaCalendarPlus /> קביעת תור חדש
            </button>
          </div>

          <div className="joy-card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-xl text-white shadow-pop">
              <FaBolt />
            </div>
            <h3 className="mb-4 text-xl font-bold text-slate-800">פעולות מהירות</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/appointment-history')}
                  className="flex w-full items-center gap-2 font-semibold text-joy-teal hover:underline"
                >
                  <FaHistory /> צפייה בהיסטוריית טיפולים ותורים
                </button>
              </li>
            </ul>
          </div>

          <div className="joy-card p-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-400 text-xl text-white shadow-pop">
              <FaUserCircle />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">פרטי המנוי</h3>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p><span className="font-medium text-slate-700">אימייל:</span> {user?.email || 'לא עודכן'}</p>
              <p><span className="font-medium text-slate-700">סוג חשבון:</span> מטופל / הורה</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
