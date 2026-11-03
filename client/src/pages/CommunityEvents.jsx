import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Users, Calendar, MapPin, Plus, Check } from 'lucide-react';

const CommunityEvents = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Social',
    date: new Date().toISOString().split('T')[0],
    location: 'Community Hall / Online',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/features/community-events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/features/community-events', formData);
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Social',
        date: new Date().toISOString().split('T')[0],
        location: 'Community Hall / Online',
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('sidebar.communityEvents')}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Participate in health workshops, gentle yoga, social gatherings, and peer groups.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Host Community Event</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold">
                  {ev.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-3">{ev.title}</h3>
                <p className="text-xs text-slate-600 mt-2">{ev.description}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>{ev.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Create Community Gathering</h3>
              <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Morning Walking & Laughing Club"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details about time, activity and requirements..."
                    className="w-full px-3 py-2 border rounded-xl"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Municipal Park, East Gate"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 text-white rounded-xl font-bold"
                  >
                    Publish Event
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

export default CommunityEvents;
