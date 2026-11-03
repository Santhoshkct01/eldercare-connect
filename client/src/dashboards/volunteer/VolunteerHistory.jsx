import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { CheckCircle, Clock } from 'lucide-react';

const VolunteerHistory = () => {
  const { t } = useTranslation();
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    api.get('/requests').then((res) => {
      setMissions(res.data.filter((r) => r.status === 'Completed'));
    }).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.completedMissions')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            History of completed volunteer missions and elderly community assistance services.
          </p>
        </div>

        <div className="space-y-3">
          {missions.map((m) => (
            <div key={m._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg">
                    {m.category}
                  </span>
                  <span className="text-slate-400">#{m.requestId}</span>
                </div>
                <h4 className="font-bold text-slate-800 mt-1 text-sm">{m.description}</h4>
                <p className="text-slate-500 mt-0.5">Assisted: {m.elder?.name} • {m.location?.address}</p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" /> Completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VolunteerHistory;

