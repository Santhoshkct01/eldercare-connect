import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { registerPushNotifications } from '../../services/pushNotificationService';
import { formatISTTime12, convert12to24 } from '../../utils/timeUtils';
import {
  Pill,
  Plus,
  CheckCircle,
  Clock,
  Trash2,
  Bell,
  BellRing,
  AlertCircle,
  Check,
  RefreshCw,
} from 'lucide-react';

const ElderMedicines = () => {
  const { t } = useTranslation();
  const { user, language } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushStatus, setPushStatus] = useState('default');
  const [activeAlert, setActiveAlert] = useState(null);

  // Time picker state for Add Medicine modal (12-hour AM/PM)
  const [newTime, setNewTime] = useState({ hour: '10', minute: '00', period: 'AM' });
  const [scheduledTimesList, setScheduledTimesList] = useState([
    { hour: '10', minute: '00', period: 'AM' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    instructions: 'Take after meals with water',
    stockRemaining: 30,
  });

  useEffect(() => {
    fetchMedicines();

    // Check browser notification permission status
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }

    // Real-time listener for medicine reminders via Socket.IO
    socket.on('medicine_reminder', (data) => {
      setActiveAlert(data);
      fetchMedicines();
    });

    return () => {
      socket.off('medicine_reminder');
    };
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/medicines');
      setMedicines(res.data || []);
    } catch (err) {
      console.error('Fetch medicines error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    const res = await registerPushNotifications();
    if (res.permission) {
      setPushStatus(res.permission);
    }
  };

  const handleAddTime = () => {
    // Prevent duplicate entries
    const exists = scheduledTimesList.some(
      (t) =>
        t.hour === newTime.hour &&
        t.minute === newTime.minute &&
        t.period === newTime.period
    );
    if (!exists) {
      setScheduledTimesList([...scheduledTimesList, { ...newTime }]);
    }
  };

  const handleRemoveTime = (index) => {
    if (scheduledTimesList.length > 1) {
      setScheduledTimesList(scheduledTimesList.filter((_, idx) => idx !== index));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Convert all 12h times to 24h internal storage format
      const times24 = scheduledTimesList.map((t) =>
        convert12to24(t.hour, t.minute, t.period)
      );

      await api.post('/medicines', {
        ...formData,
        scheduleTimes: times24,
      });

      setShowModal(false);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Daily',
        instructions: 'Take after meals with water',
        stockRemaining: 30,
      });
      setScheduledTimesList([{ hour: '10', minute: '00', period: 'AM' }]);
      fetchMedicines();
    } catch (err) {
      console.error('Create prescription error:', err);
    }
  };

  const markDoseTaken = async (medicineId, scheduledTime12) => {
    try {
      await api.put(`/medicines/${medicineId}/take`, {
        status: 'Taken',
        scheduledTime: scheduledTime12,
      });
      fetchMedicines();
      if (activeAlert && activeAlert.medicine?._id === medicineId) {
        setActiveAlert(null);
      }
    } catch (err) {
      console.error('Mark taken error:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Active In-App Reminder Banner */}
        {activeAlert && (
          <div className="bg-amber-500 text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-bounce">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white text-amber-600 rounded-2xl">
                <BellRing className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-black">
                  {language === 'ta' ? '💊 மருந்து நினைவூட்டல்!' : '💊 Scheduled Medicine Reminder!'}
                </h3>
                <p className="text-xs font-semibold text-amber-100">
                  {language === 'ta'
                    ? `உங்கள் ${activeAlert.medicine?.name} (${activeAlert.medicine?.dosage}) மருந்தை உட்கொள்ள வேண்டிய நேரம் (${activeAlert.medicine?.displayTime}).`
                    : `It is time to take ${activeAlert.medicine?.name} (${activeAlert.medicine?.dosage}) - Scheduled: ${activeAlert.medicine?.displayTime}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => markDoseTaken(activeAlert.medicine?._id, activeAlert.medicine?.scheduledTime)}
              className="px-5 py-2.5 bg-white text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-black shadow transition shrink-0"
            >
              {language === 'ta' ? 'எடுத்துக்கொண்டேன்' : 'Mark as Taken'}
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-900">{t('medicines.title')}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                IST (UTC+05:30)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated daily prescriptions with exact Indian Standard Time reminders and push notifications.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {pushStatus !== 'granted' && (
              <button
                onClick={handleEnablePush}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-amber-200 transition"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span>{language === 'ta' ? 'அறிவிப்புகளை இயக்கு' : 'Enable Push Alerts'}</span>
              </button>
            )}

            <button
              onClick={fetchMedicines}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              title="Refresh Prescriptions"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t('medicines.addPrescription')}</span>
            </button>
          </div>
        </div>

        {/* Prescription Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              {language === 'ta'
                ? 'மருந்து அட்டவணைகள் எதுவும் இல்லை. புதிய மருந்தைச் சேர்க்க மேலே உள்ள பொத்தானைக் கிளிக் செய்யவும்.'
                : 'No active medicine schedules found. Click "+ Add Prescription" to configure recurring daily doses.'}
            </div>
          ) : (
            medicines.map((med) => (
              <div
                key={med._id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <Pill className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                      {med.frequency}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5">
                    {t('medicines.dosage')}: {med.dosage}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">{med.instructions}</p>

                  {/* Daily Scheduled Doses Status in 12h AM/PM */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>Today's Schedule (IST)</span>
                    </p>

                    <div className="space-y-1.5">
                      {(med.dosesToday || []).map((dose, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs"
                        >
                          <span className="font-bold text-slate-800">{dose.display12}</span>

                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                dose.status === 'Taken'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : dose.status === 'Missed'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {dose.status === 'Taken'
                                ? language === 'ta' ? 'முடிந்தது' : 'Taken'
                                : dose.status === 'Missed'
                                ? language === 'ta' ? 'தவறியது' : 'Missed'
                                : language === 'ta' ? 'நிலுவையில்' : 'Pending'}
                            </span>

                            {dose.status !== 'Taken' && (
                              <button
                                onClick={() => markDoseTaken(med._id, dose.time24)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm"
                              >
                                {language === 'ta' ? 'உட்கொள்' : 'Take'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mt-3">
                    {t('medicines.remainingStock')}:{' '}
                    <strong className="text-slate-800">
                      {med.stockRemaining} {t('medicines.pills')}
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => markDoseTaken(med._id, med.scheduleTimes?.[0])}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{t('elder.markTaken')}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for adding medicine (12-hour AM/PM interface) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{t('medicines.addNew')}</h3>
              <p className="text-xs text-slate-500 mb-4">
                Schedule recurring medication with Indian Standard Time (IST) 12-hour AM/PM times.
              </p>

              <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">{t('medicines.nameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paracetamol, Metformin"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">{t('medicines.dosageLabel')}</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 500 mg, 1 tablet"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                {/* 12-Hour AM/PM Daily Schedule Selector */}
                <div className="space-y-2 border border-slate-200 p-3.5 rounded-2xl bg-slate-50/50">
                  <label className="block text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    Daily Schedule Times (12-Hour IST)
                  </label>

                  {/* Scheduled times chips */}
                  <div className="space-y-1.5 mb-3">
                    {scheduledTimesList.map((time, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200"
                      >
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {time.hour}:{time.minute} {time.period}
                        </span>
                        {scheduledTimesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(idx)}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-bold flex items-center space-x-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add time controls */}
                  <div className="flex items-center space-x-1.5 pt-1">
                    {/* Hour 1-12 */}
                    <select
                      value={newTime.hour}
                      onChange={(e) => setNewTime({ ...newTime, hour: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(
                        (h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        )
                      )}
                    </select>

                    <span className="font-bold text-slate-400">:</span>

                    {/* Minute 00-55 step 5 */}
                    <select
                      value={newTime.minute}
                      onChange={(e) => setNewTime({ ...newTime, minute: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(
                        (m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        )
                      )}
                    </select>

                    {/* AM / PM */}
                    <select
                      value={newTime.period}
                      onChange={(e) => setNewTime({ ...newTime, period: e.target.value })}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-700"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Time</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">{t('medicines.instructionsLabel')}</label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g. Take after meals with water"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">{t('medicines.stockLabel')}</label>
                  <input
                    type="number"
                    value={formData.stockRemaining}
                    onChange={(e) => setFormData({ ...formData, stockRemaining: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600"
                  >
                    {t('medicines.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                  >
                    {t('medicines.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ElderMedicines;
