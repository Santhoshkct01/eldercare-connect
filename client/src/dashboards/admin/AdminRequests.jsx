import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { HandHeart, Clock, MapPin, UserCheck } from 'lucide-react';

const AdminRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, userRes] = await Promise.all([
        api.get('/requests'),
        api.get('/admin/users'),
      ]);
      setRequests(reqRes.data);
      setVolunteers(userRes.data.filter((u) => u.role === 'volunteer'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualAssign = async (reqId, volunteerId) => {
    try {
      await api.put(`/requests/${reqId}/status`, {
        status: 'Volunteer Assigned',
        assignedVolunteer: volunteerId,
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.allRequests')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global view of all senior assistance requests with administrative volunteer assignment overrides.
          </p>
        </div>

        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-teal-50 text-teal-800 font-bold rounded-full">
                    {r.category}
                  </span>
                  <span className="text-slate-400">#{r.requestId}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold">
                    Priority: {r.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2">{r.description}</h3>
                <p className="text-slate-600 mt-1">
                  Elder: <strong>{r.elder?.name}</strong> ({r.elder?.phone}) • Location: {r.location?.address}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Scheduled: {new Date(r.preferredDate).toLocaleDateString()} at {r.preferredTime}
                </p>
              </div>

              <div className="flex flex-col items-end space-y-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold">
                  Status: {r.status}
                </span>

                {r.assignedVolunteer ? (
                  <p className="text-slate-600">
                    Assigned: <strong>{r.assignedVolunteer.name}</strong>
                  </p>
                ) : (
                  <select
                    onChange={(e) => handleManualAssign(r._id, e.target.value)}
                    defaultValue=""
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="" disabled>Manual Volunteer Assignment</option>
                    {volunteers.map((v) => (
                      <option key={v._id} value={v._id}>{v.name} ({v.city || 'Available'})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminRequests;

