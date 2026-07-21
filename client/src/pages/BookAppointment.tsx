import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createAppointment, resetStatus } from '../redux/appointmentSlice';
import { FaCalendarPlus, FaUserMd, FaClock, FaStickyNote, FaExclamationCircle } from 'react-icons/fa';

const BookAppointment = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  // שליפת נתוני התור מה-Store
  const appointmentData = useSelector((state: any) => state.appointment || state.appointments || {});
  const loading = appointmentData.loading;
  const error = appointmentData.error;
  const success = appointmentData.success;
  
  // שליפת המשתמש המחובר
  const user = useSelector((state: any) => state.auth?.user || state.auth?.patient);
  
  const [therapistId, setTherapistId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [notes, setNotes] = useState('');

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!therapistId || !startTime || !userId) return;

    const start = new Date(startTime);
    
    if (start <= new Date()) {
      alert("יש לבחור תאריך ושעה עתידיים בלבד");
      return;
    }

    const end = new Date(start.getTime() + 60 * 60 * 1000); 

    dispatch(createAppointment({ 
      therapistId, 
      patientId: userId,
      startTime: start.toISOString(), 
      endTime: end.toISOString(),
      type: "ייעוץ",
      notes
    }));
  };

  useEffect(() => {
    if (success) {
      dispatch(resetStatus());
      navigate('/patient-dashboard');
    }
  }, [success, dispatch, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-50 via-white to-purple-50 text-right" dir="rtl">
      <div className="joy-blob -top-16 -right-16 h-64 w-64 bg-joy-coral" />
      <div className="joy-blob bottom-0 -left-16 h-64 w-64 bg-joy-teal" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 mx-auto max-w-lg p-6">
        <header className="mb-6 pb-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-joy-warm text-2xl text-white shadow-joy">
            <FaCalendarPlus />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-800">קביעת תור חדש 🎉</h1>
          <p className="mt-1 text-sm text-slate-500">כמה פרטים קטנים ואתם בפנים!</p>
        </header>

        <form onSubmit={handleSubmit} className="joy-card space-y-4 p-6">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaUserMd className="text-joy-grape" /> בחר מטפל/ת *
            </label>
            <select
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="joy-input"
              required
            >
              <option value="">-- בחר מרשימה --</option>
              <option value="therapist_1">ד"ר ישראלי ישראל</option>
              <option value="therapist_2">פרופ' כהן שרה</option>
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaClock className="text-joy-sky" /> תאריך ושעת התחלה *
            </label>
            <input
              type="datetime-local"
              value={startTime}
              min={getMinDateTime()}
              onChange={(e) => setStartTime(e.target.value)}
              className="joy-input"
              required
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaStickyNote className="text-joy-sun" /> הערות לטיפול (אופציונלי)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="סיבת הפנייה, רקע קצר וכו'..."
              className="joy-input h-20 resize-none"
            />
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              <FaExclamationCircle /> {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="joy-btn-primary w-full text-sm"
            >
              {loading ? 'קובע תור...' : 'אישור וקביעת תור 🎊'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/patient-dashboard')}
              className="joy-btn-ghost w-1/3 text-sm"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;