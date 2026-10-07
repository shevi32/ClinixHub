import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaCalendarPlus, FaUserMd, FaClock, FaStickyNote, FaExclamationCircle } from 'react-icons/fa';

type AvailableSlot = {
  startTime: string;
  endTime: string;
};

type Therapist = {
  _id: string;
  email: string;
};

const BookAppointment = () => {
  const navigate = useNavigate();
  // שליפת המשתמש המחובר
  const user = useSelector((state: any) => state.auth?.user || state.auth?.patient);
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [therapistId, setTherapistId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotsRefresh, setSlotsRefresh] = useState(0);
  const [notes, setNotes] = useState('');

  const getMinDate = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);
  };

  useEffect(() => {
    let isCurrentRequest = true;

    api.get('/appointments/therapists')
      .then((response) => {
        if (isCurrentRequest) {
          setTherapists(response.data.data || []);
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setTherapists([]);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  useEffect(() => {
    if (!therapistId || !date) {
      setSlots([]);
      setSlotsLoading(false);
      setSlotsError('');
      return;
    }

    let isCurrentRequest = true;
    setSlotsLoading(true);
    setSlotsError('');

    api.get('/appointments/available-slots', {
      params: { therapistId, date },
    })
      .then((response) => {
        if (isCurrentRequest) {
          setSlots(response.data.data);
        }
      })
      .catch((requestError: any) => {
        if (isCurrentRequest) {
          setSlots([]);
          setSlotsError(
            requestError.response?.data?.message || 'לא ניתן לטעון שעות פנויות.'
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) {
          setSlotsLoading(false);
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [therapistId, date, slotsRefresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.id || user?._id;
    if (!therapistId || !date || !selectedSlot || !userId || isSubmitting) return;

    setIsSubmitting(true);
    setBookingError('');

    try {
      await api.post('/appointments', {
        therapistId,
        patientId: userId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes,
      });
      navigate('/patient-dashboard');
    } catch (requestError: any) {
      if (requestError.response?.status === 409) {
        setBookingError('השעה נתפסה כעת. טענו מחדש את השעות ובחרו מועד אחר.');
        setSelectedSlot(null);
        setSlotsRefresh((current) => current + 1);
      } else {
        setBookingError(
          requestError.response?.data?.message || 'לא ניתן לקבוע את התור כעת.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSlotTime = (time: string) =>
    new Date(time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });

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
              onChange={(e) => {
                setTherapistId(e.target.value);
                setSelectedSlot(null);
                setBookingError('');
              }}
              className="joy-input"
              required
            >
              <option value="">-- בחר מרשימה --</option>
              {therapists.map((therapist) => (
                <option key={therapist._id} value={therapist._id}>
                  {therapist.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
              <FaClock className="text-joy-sky" /> תאריך *
            </label>
            <input
              type="date"
              value={date}
              min={getMinDate()}
              onChange={(e) => {
                setDate(e.target.value);
                setSelectedSlot(null);
                setBookingError('');
              }}
              className="joy-input"
              required
            />
          </div>

          {therapistId && date && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                <FaClock className="text-joy-sky" /> שעות פנויות *
              </p>
              {slotsLoading && (
                <p role="status" className="py-3 text-sm text-slate-500">טוען שעות פנויות...</p>
              )}
              {!slotsLoading && slotsError && (
                <p role="alert" className="flex items-center gap-2 py-3 text-sm text-rose-600">
                  <FaExclamationCircle /> {slotsError}
                </p>
              )}
              {!slotsLoading && !slotsError && slots.length === 0 && (
                <p className="py-3 text-sm text-slate-500">אין שעות פנויות בתאריך זה.</p>
              )}
              {!slotsLoading && !slotsError && slots.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      aria-pressed={selectedSlot?.startTime === slot.startTime}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setBookingError('');
                      }}
                      className={selectedSlot?.startTime === slot.startTime
                        ? 'joy-btn-primary justify-center'
                        : 'joy-btn-soft justify-center'}
                    >
                      {formatSlotTime(slot.startTime)}–{formatSlotTime(slot.endTime)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {bookingError && (
            <p className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              <FaExclamationCircle /> {bookingError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || slotsLoading || !selectedSlot}
              className="joy-btn-primary w-full text-sm"
            >
              {isSubmitting ? 'קובע תור...' : 'אישור וקביעת תור 🎊'}
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