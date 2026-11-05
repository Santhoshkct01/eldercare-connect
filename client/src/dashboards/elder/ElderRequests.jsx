import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  HandHeart,
  Plus,
  Clock,
  MapPin,
  CheckCircle,
  Edit,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const ElderRequests = () => {
  const { t } = useTranslation();
  const { language } = useAuth();
  const [requests, setRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);
  const locale = language === 'ta' ? 'ta-IN' : 'en-IN';

  const initialForm = {
    category: 'Grocery Shopping',
    description: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '10:00 AM',
    priority: 'Medium',
    address: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        ...formData,
        location: { address: formData.address },
      });
      setShowCreateModal(false);
      setFormData(initialForm);
      fetchRequests();
    } catch (err) {
      console.error('Create request error:', err);
    }
  };

  const openEditModal = (req) => {
    setSelectedRequest(req);
    setEditFormData({
      category: req.category || 'Grocery Shopping',
      description: req.description || '',
      preferredDate: req.preferredDate ? new Date(req.preferredDate).toISOString().split('T')[0] : '',
      preferredTime: req.preferredTime || '',
      priority: req.priority || 'Medium',
      address: req.location?.address || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      await api.put(`/requests/${selectedRequest._id}`, {
        ...editFormData,
        location: {
          address: editFormData.address,
          latitude: selectedRequest.location?.latitude || 0,
          longitude: selectedRequest.location?.longitude || 0,
        },
      });
      setShowEditModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error('Edit request error:', err);
    }
  };

  const openCancelModal = (req) => {
    setSelectedRequest(req);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;
    try {
      await api.put(`/requests/${selectedRequest._id}/cancel`, {
        reason: cancelReason,
      });
      setShowCancelModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      console.error('Cancel request error:', err);
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
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchRequests}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'புதுப்பி' : 'Refresh'}</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('requests.createNew')}</span>
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              {language === 'ta' ? 'உதவி கோரிக்கைகள் எதுவும் இல்லை.' : 'No assistance requests found. Click "Create New Request" to ask for assistance.'}
            </div>
          ) : (
            requests.map((req) => {
              const isEditable = req.status !== 'Completed' && req.status !== 'Cancelled';
              return (
                <div
                  key={req._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
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

                    {req.cancelledAt && (
                      <p className="text-[11px] text-red-600 font-semibold">
                        {language === 'ta' ? 'ரத்து செய்யப்பட்டது:' : 'Cancelled:'} {new Date(req.cancelledAt).toLocaleString(locale)}
                        {req.cancellationReason && ` (${req.cancellationReason})`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end space-y-2">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        req.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : req.status === 'Accepted' || req.status === 'In Progress' || req.status === 'Volunteer Assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
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
                        {req.assignmentType === 'admin_manual' && (
                          <span className="ml-1 text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">
                            {language === 'ta' ? 'நிர்வாகி ஒதுக்கீடு' : 'Admin Assigned'}
                          </span>
                        )}
                      </p>
                    ) : req.status === 'Pending' ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-xl text-xs max-w-sm text-left md:text-right">
                        <p className="font-semibold">
                          {language === 'ta'
                            ? 'உங்கள் கோரிக்கை சமர்ப்பிக்கப்பட்டது. எங்கள் நிர்வாகி பொருத்தமான தன்னார்வலரை நியமிப்பார்.'
                            : 'Your request has been submitted. Our administrator will assign a suitable volunteer.'}
                        </p>
                      </div>
                    ) : null}

                    {/* Working Controls: Edit & Cancel */}
                    {isEditable && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          onClick={() => openEditModal(req)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center space-x-1 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'திருத்து' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => openCancelModal(req)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold inline-flex items-center space-x-1 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'ரத்து செய்' : 'Cancel'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: Create Request */}
        {showCreateModal && (
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
                  <label className="block text-slate-700 mb-1">{t('requests.priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
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
                    onClick={() => setShowCreateModal(false)}
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

        {/* Modal: Edit Request */}
        {showEditModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {language === 'ta' ? 'உதவி கோரிக்கையை திருத்து' : 'Edit Assistance Request'}
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-mono">#{selectedRequest.requestId}</p>
              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">{t('requests.categoryLabel')}</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
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
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">{t('requests.dateLabel')}</label>
                    <input
                      type="date"
                      required
                      value={editFormData.preferredDate}
                      onChange={(e) => setEditFormData({ ...editFormData, preferredDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">{t('requests.timeLabel')}</label>
                    <input
                      type="text"
                      required
                      value={editFormData.preferredTime}
                      onChange={(e) => setEditFormData({ ...editFormData, preferredTime: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('requests.priority')}</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('requests.addressLabel')}</label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600"
                  >
                    {t('medicines.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-sm"
                  >
                    {language === 'ta' ? 'சேமி' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cancel Request Confirmation */}
        {showCancelModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-rose-600">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-lg font-bold text-slate-900">
                  {language === 'ta' ? 'கோரிக்கையை ரத்து செய்யவா?' : 'Cancel Assistance Request?'}
                </h3>
              </div>

              <p className="text-xs text-slate-600">
                {language === 'ta'
                  ? 'இந்த உதவி கோரிக்கையை நீங்கள் ரத்து செய்ய விரும்புகிறீர்களா? தன்னார்வலருக்கும் நிர்வாகிக்கும் அறிவிக்கப்படும்.'
                  : `Are you sure you want to cancel request #${selectedRequest.requestId}? The assigned volunteer and platform admins will be notified immediately.`}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ta' ? 'ரத்து செய்வதற்கான காரணம் (விருப்பமானது):' : 'Reason for Cancellation (Optional):'}
                </label>
                <textarea
                  rows="2"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder={language === 'ta' ? 'காரணத்தை உள்ளிடவும்...' : 'e.g. Schedule changed, emergency resolved...'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
                >
                  {language === 'ta' ? 'பின்செல்' : 'Go Back'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  {language === 'ta' ? 'ஆம், ரத்து செய்' : 'Yes, Cancel Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ElderRequests;
