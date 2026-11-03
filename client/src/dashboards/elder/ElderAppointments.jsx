import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, Plus, Clock, MapPin, XCircle, Trash2, CheckCircle } from 'lucide-react';

const ElderAppointments = () => {
  const { t } = useTranslation();
  const { language } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const locale = language === 'ta' ? 'ta-IN' : 'en-IN';

  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: 'Cardiologist',
    hospital: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '10:00 AM',
    notes: '',
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/features/appointments');
      setAppointments(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/features/appointments', formData);
      setShowModal(false);
      setFormData({
        doctorName: '',
        specialty: 'General Physician',
        hospital: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '10:00 AM',
        notes: '',
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.put(`/features/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(language === 'ta' ? 'இந்த மருத்துவ சந்திப்பை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this appointment?')) {
      try {
        await api.delete(`/features/appointments/${id}`);
        fetchAppointments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('sidebar.appointments')}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ta' ? 'உங்கள் மருத்துவர் சந்திப்புகளை நிர்வகியுங்கள்' : 'Schedule and keep track of your clinical consultations and doctor visits.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ta' ? 'புதிய சந்திப்பு' : 'Schedule Appointment'}</span>
          </button>
        </div>

        {/* Appointments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                    a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    a.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{a.doctorName}</h3>
                <p className="text-xs font-semibold text-purple-600">{a.specialty}</p>
                <div className="mt-3 flex items-center text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{a.hospital}</span>
                </div>
                <div className="mt-1 flex items-center text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{new Date(a.appointmentDate).toLocaleDateString(locale)} {t('elder.at')} {a.appointmentTime}</span>
                </div>
                {a.notes && <p className="text-xs text-slate-400 mt-2 italic">{a.notes}</p>}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                {a.status === 'Scheduled' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(a._id)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-800"
                  >
                    {language === 'ta' ? 'ரத்து செய்க' : 'Cancel'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(a._id)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 ml-auto flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>{language === 'ta' ? 'நீக்குக' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {language === 'ta' ? 'மருத்துவர் சந்திப்பை திட்டமிடுங்கள்' : 'Schedule Doctor Consultation'}
              </h3>
              <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">{language === 'ta' ? 'மருத்துவர் பெயர்' : 'Doctor Name'}</label>
                  <input
                    type="text"
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{language === 'ta' ? 'மருத்துவ சிறப்பு' : 'Specialty'}</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="e.g. Cardiologist, Orthopedic"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{language === 'ta' ? 'மருத்துவமனை / கிளினிக்' : 'Hospital / Clinic'}</label>
                  <input
                    type="text"
                    required
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    placeholder="e.g. City General Hospital"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">{language === 'ta' ? 'தேதி' : 'Date'}</label>
                    <input
                      type="date"
                      required
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">{language === 'ta' ? 'நேரம்' : 'Time'}</label>
                    <input
                      type="text"
                      required
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      placeholder="10:30 AM"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{language === 'ta' ? 'குறிப்புகள்' : 'Notes / Preparation'}</label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Fasting blood sugar report needed"
                    className="w-full px-3 py-2 border rounded-xl"
                  ></textarea>
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
                    className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold"
                  >
                    {language === 'ta' ? 'பதிவு செய்க' : 'Save Appointment'}
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

export default ElderAppointments;
