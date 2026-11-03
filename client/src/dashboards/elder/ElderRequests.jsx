import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { HandHeart, Plus, Clock, MapPin, CheckCircle } from 'lucide-react';

const ElderRequests = () => {
  const { t } = useTranslation();
  const { language } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const locale = language === 'ta' ? 'ta-IN' : 'en-IN';

  const [formData, setFormData] = useState({
    category: 'Grocery Shopping',
    description: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '10:00 AM',
    priority: 'Medium',
    address: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        ...formData,
        location: { address: formData.address },
      });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('requests.title')}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('requests.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('requests.createNew')}</span>
          </button>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-bold">
                    {req.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{req.requestId}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-semibold">
                    {t('requests.priority')}: {req.priority}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{req.description}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {new Date(req.preferredDate).toLocaleDateString(locale)} {t('elder.at')} {req.preferredTime}
                  </span>
                  {req.location?.address && (
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {req.location.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  req.status === 'Accepted' || req.status === 'In Progress' || req.status === 'Volunteer Assigned' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {t('requests.status')}: {req.status}
                </span>

                {req.assignedVolunteer ? (
                  <p className="text-xs text-slate-600">
                    {t('requests.assigned')}: <strong>{req.assignedVolunteer.name}</strong> ({req.assignedVolunteer.phone})
                    {req.assignmentType === 'automatic' && (
                      <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        {language === 'ta' ? 'தானாக ஒதுக்கப்பட்டது' : 'Auto-Assigned'}
                      </span>
                    )}
                  </p>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-xs max-w-sm text-right">
                    <p className="font-semibold">
                      {language === 'ta'
                        ? 'உங்கள் கோரிக்கை சமர்ப்பிக்கப்பட்டது. எங்கள் நிர்வாகி பொருத்தமான தன்னார்வலரை நியமிப்பார்.'
                        : 'Your request has been submitted. Our administrator will assign a suitable volunteer.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t('requests.createTitle')}</h3>
              <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">{t('requests.categoryLabel')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Grocery Shopping">{t('requests.categories.grocery')}</option>
                    <option value="Hospital Visit">{t('requests.categories.hospital')}</option>
                    <option value="Doctor Appointment">{t('requests.categories.doctor')}</option>
                    <option value="Medicine Collection">{t('requests.categories.medicine')}</option>
                    <option value="Transportation">{t('requests.categories.transport')}</option>
                    <option value="Household Assistance">{t('requests.categories.household')}</option>
                    <option value="Companionship">{t('requests.categories.companionship')}</option>
                    <option value="Emergency Assistance">{t('requests.categories.emergency')}</option>
                    <option value="Other">{t('requests.categories.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('requests.descLabel')}</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('requests.descPlaceholder')}
                    className="w-full px-3 py-2 border rounded-xl"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">{t('requests.dateLabel')}</label>
                    <input
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">{t('requests.timeLabel')}</label>
                    <input
                      type="text"
                      required
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      placeholder="e.g. 10:30 AM"
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('requests.addressLabel')}</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('requests.addressPlaceholder')}
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
                    className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold"
                  >
                    {t('requests.submit')}
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

export default ElderRequests;
