import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAppointments } from '../redux/appointmentSlice';
import type { AppDispatch } from '../redux/store';

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
      scheduled: <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-300">מאושר</span>,
      pending: <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">ממתין לאישור</span>,
      completed: <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-300">בוצע</span>,
      cancelled: <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-300">בוטל</span>,
    };
    return statuses[status] || <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded border border-slate-300">{status}</span>;
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' });
  };

  const renderTable = (list: any[], title: string) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-700 mb-3">{title} ({list.length})</h2>
      {list.length === 0 ? (
        <p className="text-slate-400 bg-white p-4 border border-slate-200 rounded-xl text-sm">אין תורים בקטגוריה זו.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-right text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">מזהה מטפל</th>
                <th className="px-6 py-3">זמן התחלה</th>
                <th className="px-6 py-3">זמן סיום</th>
                <th className="px-6 py-3">הערות</th>
                <th className="px-6 py-3">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {list.map((apt: any) => (
                <tr key={apt._id || apt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {apt.therapistId === 'therapist_1' ? 'ד"ר ישראלי ישראל' : apt.therapistId === 'therapist_2' ? "פרופ' כהן שרה" : apt.therapistId}
                  </td>
                  <td className="px-6 py-4">{formatDateTime(apt.startTime)}</td>
                  <td className="px-6 py-4">{formatDateTime(apt.endTime)}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{apt.notes || '-'}</td>
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
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-slate-50 text-right" dir="rtl">
      <header className="mb-6 flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">היסטוריית וניהול תורים</h1>
        </div>
        <button 
          onClick={() => navigate('/book-appointment')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-4 rounded-lg"
        >
          + קביעת תור חדש
        </button>
      </header>

      {loading && <p className="text-center text-slate-600 py-8">טוען את רשימת התורים...</p>}
      {error && <p className="text-center text-red-600 font-medium py-4">{error}</p>}

      {!loading && !error && (
        <>
          {renderTable(upcomingAppointments, "תורים קרובים")}
          {renderTable(pastAppointments, "תורים מהעבר (היסטוריה)")}
        </>
      )}

      <button 
        onClick={() => navigate('/patient-dashboard')} 
        className="mt-6 text-slate-600 hover:text-slate-800 text-sm font-medium underline block"
      >
        חזרה לדאשבורד
      </button>
    </div>
  );
};

export default AppointmentHistory;