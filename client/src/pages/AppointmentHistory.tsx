import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../redux/appointmentSlice';
import type { AppDispatch } from '../redux/store';
import { FaCalendarPlus, FaHistory, FaArrowRight } from 'react-icons/fa';

const AppointmentHistory = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { list: appointments = [], loading, error } = useSelector((state: any) => state.appointments || {});
  const user = useSelector((state: any) => state.auth?.user || state.auth?.patient);

  useEffect(() => {
    const userId = user?.id || user?._id;
    if (userId) {
      dispatch(fetchAppointments(userId));
    }
  }, [dispatch, user]);

  const now = new Date();
  const upcomingAppointments = appointments.filter((apt: any) => new Date(apt.startTime) >= now);
  const pastAppointments = appointments.filter((apt: any) => new Date(apt.startTime) < now);

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, any> = {
      scheduled: <span className="joy-badge-scheduled">🗓️ מאושר</span>,
      pending: <span className="joy-badge-pending">⏳ ממתין לאישור</span>,
      completed: <span className="joy-badge-completed">✅ בוצע</span>,
      cancelled: <span className="joy-badge-cancelled">❌ בוטל</span>,
    };
    return statuses[status] || <span className="joy-badge bg-slate-100 text-slate-600">{status}</span>;
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
  };

  const renderTable = (list: any[], title: string, icon: React.ReactNode) => (
    <div className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-700">
        {icon} {title} <span className="joy-badge bg-slate-100 text-slate-500">{list.length}</span>
      </h2>
      {list.length === 0 ? (
        <p className="joy-card p-4 text-sm text-slate-400">אין תורים בקטגוריה זו.</p>
      ) : (
        <div className="joy-card overflow-hidden">
          <table className="w-full text-right text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">מטפל/ת</th>
                <th className="px-6 py-3">זמן התחלה</th>
                <th className="px-6 py-3">זמן סיום</th>
                <th className="px-6 py-3">הערות</th>
                <th className="px-6 py-3">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((apt: any) => (
                <tr key={apt._id || apt.id} className="transition-colors hover:bg-teal-50/40">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {apt.therapistId === 'therapist_1' ? 'ד"ר ישראלי ישראל' : apt.therapistId === 'therapist_2' ? "פרופ' כהן שרה" : apt.therapistId}
                  </td>
                  <td className="px-6 py-4">{formatDateTime(apt.startTime)}</td>
                  <td className="px-6 py-4">{formatDateTime(apt.endTime)}</td>
                  <td className="max-w-xs truncate px-6 py-4 text-slate-500">{apt.notes || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(apt.status || 'scheduled')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-16 -right-16 h-64 w-64 bg-joy-grape" />
      <div className="joy-blob bottom-0 -left-16 h-64 w-64 bg-joy-sky" style={{ animationDelay: '2.5s' }} />

      <div className="relative z-10 mx-auto max-w-4xl p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 pb-2">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-800">
              <FaHistory className="text-joy-grape" /> היסטוריית וניהול תורים
            </h1>
          </div>
          <button
            onClick={() => navigate('/book-appointment')}
            className="joy-btn-primary text-sm"
          >
            <FaCalendarPlus /> קביעת תור חדש
          </button>
        </header>

        {loading && <p className="py-8 text-center text-slate-500">טוען את רשימת התורים... 🔄</p>}
        {error && <p className="py-4 text-center font-medium text-rose-600">{error}</p>}

        {!loading && !error && (
          <>
            {renderTable(upcomingAppointments, "תורים קרובים", <span>📅</span>)}
            {renderTable(pastAppointments, "תורים מהעבר (היסטוריה)", <span>🗂️</span>)}
          </>
        )}

        <button
          onClick={() => navigate('/patient-dashboard')}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-joy-teal"
        >
          <FaArrowRight /> חזרה לדאשבורד
        </button>
      </div>
    </div>
  );
};

export default AppointmentHistory;
