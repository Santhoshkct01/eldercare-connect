import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { HandHeart, Clock, MapPin } from 'lucide-react';

const FamilyRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get('/requests').then((res) => setRequests(res.data)).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.assistanceHistory')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking volunteer assistance requests submitted on behalf of or by your family elder.
          </p>
        </div>

        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg">
                  {r.category}
                </span>
                <h4 className="font-bold text-slate-900 mt-1 text-sm">{r.description}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Scheduled: {new Date(r.preferredDate).toLocaleDateString()} at {r.preferredTime}
                </p>
              </div>

              <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                r.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                r.status === 'Accepted' || r.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyRequests;
