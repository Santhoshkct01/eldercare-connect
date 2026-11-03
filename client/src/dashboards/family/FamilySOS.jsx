import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { ShieldAlert, MapPin, CheckCircle, Clock } from 'lucide-react';

const FamilySOS = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/sos').then((res) => setAlerts(res.data)).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.sosAlerts')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Emergency history, live broadcasts and responder dispatch status for family members.
          </p>
        </div>

        <div className="space-y-4">
          {alerts.map((al) => (
            <div
              key={al._id}
              className={`p-6 rounded-3xl border ${
                al.status === 'Active' ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200'
              } shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    al.status === 'Active' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {al.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(al.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Emergency Broadcast by {al.elder?.name || 'Elderly Member'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Location: {al.location?.address || `${al.location?.latitude}, ${al.location?.longitude}`}
                </p>
              </div>

              <div>
                <a
                  href={`https://maps.google.com/?q=${al.location?.latitude},${al.location?.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1"
                >
                  <MapPin className="w-4 h-4" />
                  <span>View GPS Location</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilySOS;

