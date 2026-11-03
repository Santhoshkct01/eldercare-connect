import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { HandHeart, CheckCircle, Clock, MapPin, ToggleLeft, ToggleRight, Phone, ShieldAlert } from 'lucide-react';

const VolunteerDashboard = () => {
  const { user, setUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isAvailable, setIsAvailable] = useState(user?.isVolunteerAvailable ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    try {
      await api.put('/auth/profile', { isVolunteerAvailable: nextVal });
      if (user) setUser({ ...user, isVolunteerAvailable: nextVal });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Community Volunteer Portal
            </span>
            <h1 className="text-3xl font-black mt-2">Welcome, {user?.name}!</h1>
            <p className="mt-1 text-teal-100 text-sm">
              Status: {user?.isVerifiedVolunteer ? 'Verified Volunteer ✅' : 'Pending Admin Verification ⏳'} • Rating: {user?.volunteerRating || '5.0'} ⭐
            </p>
          </div>

          {/* Availability Toggle */}
          <button
            onClick={toggleAvailability}
            className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow transition ${
              isAvailable ? 'bg-white text-emerald-800' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {isAvailable ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{isAvailable ? 'Available for Missions' : 'Currently Offline'}</span>
          </button>
        </div>

        {/* Requests Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-900 text-lg">Assistance Missions & Tasks</h3>
            <span className="text-xs text-slate-500 font-semibold">{requests.length} Total</span>
          </div>

          {requests.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-sm">No tasks currently require assistance. Thank you for your service!</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                        {req.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{req.requestId}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded">
                        Priority: {req.priority}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-800">{req.description}</h4>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>Elder: <strong>{req.elder?.name}</strong></span>
                      <span className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {req.elder?.phone}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {req.location?.address || req.elder?.address || 'Local Community'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {new Date(req.preferredDate).toLocaleDateString()} at {req.preferredTime}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                      >
                        Accept Mission
                      </button>
                    )}
                    {req.status === 'Accepted' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'On The Way')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                        >
                          On The Way
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req._id, 'Completed')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                        >
                          Mark Completed
                        </button>
                      </>
                    )}
                    {req.status === 'On The Way' && (
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Completed')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Mark Completed
                      </button>
                    )}
                    {req.status === 'Completed' && (
                      <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Done
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerDashboard;

