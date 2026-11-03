import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { ShieldAlert, MapPin, CheckCircle, Clock } from 'lucide-react';

const AdminSOS = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/sos');
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.put(`/sos/${id}`, { status: 'Resolved' });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.emergencyMonitor')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Global emergency oversight, dispatcher logs, and real-time response monitoring.
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
                  Emergency: {al.elder?.name} ({al.elder?.phone})
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Location: {al.location?.address || `${al.location?.latitude}, ${al.location?.longitude}`}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={`https://maps.google.com/?q=${al.location?.latitude},${al.location?.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1"
                >
                  <MapPin className="w-4 h-4" />
                  <span>GPS Map</span>
                </a>
                {al.status === 'Active' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(al._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Mark Resolved
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

export default AdminSOS;

