import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminVolunteers = () => {
  const { t } = useTranslation();
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const res = await api.get('/admin/users');
      setVolunteers(res.data.filter((u) => u.role === 'volunteer'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/admin/volunteers/${id}/verify`, { isVerifiedVolunteer: status });
      fetchVolunteers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.volunteerApprovals')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review community volunteer applications, verify identification and approve eligibility for senior care tasks.
          </p>
        </div>

        <div className="space-y-3">
          {volunteers.map((vol) => (
            <div key={vol._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{vol.name}</h4>
                <p className="text-slate-600 mt-0.5">Email: {vol.email} • Phone: {vol.phone} • City: {vol.city}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                    vol.isVerifiedVolunteer ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {vol.isVerifiedVolunteer ? 'Approved Volunteer' : 'Pending Verification'}
                  </span>
                  <span className="text-slate-400">Rating: {vol.volunteerRating || 5.0} ⭐</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {vol.isVerifiedVolunteer ? (
                  <button
                    type="button"
                    onClick={() => handleVerify(vol._id, false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold"
                  >
                    Revoke Approval
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleVerify(vol._id, true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                  >
                    Approve Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminVolunteers;

