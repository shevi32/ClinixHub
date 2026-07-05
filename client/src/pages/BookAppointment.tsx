import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createAppointment, resetStatus } from '../redux/appointmentSlice';

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
    <div className="p-6 max-w-lg mx-auto min-h-screen bg-slate-50 text-right" dir="rtl">
      <header className="mb-6 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">קביעת תור חדש</h1>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">בחר מטפל/ת *</label>
          <select 
            value={therapistId} 
            onChange={(e) => setTherapistId(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
            required
          >
            <option value="">-- בחר מרשימה --</option>
            <option value="therapist_1">ד"ר ישראלי ישראל</option>
            <option value="therapist_2">פרופ' כהן שרה</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">תאריך ושעת התחלה *</label>
          <input 
            type="datetime-local" 
            value={startTime}
            min={getMinDateTime()} 
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-sm text-right"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">הערות לטיפול (אופציונלי)</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="סיבת הפנייה, רקע קצר וכו'..."
            className="w-full p-2 border border-slate-300 rounded-lg text-sm text-right h-20 resize-none"
          />
        </div>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <div className="pt-2 flex gap-3">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg text-sm"
          >
            {loading ? 'קובע תור...' : 'אישור וקביעת תור'}
          </button>
          <button 
            type="button"
            onClick={() => navigate('/patient-dashboard')}
            className="w-1/3 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg text-sm"
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;