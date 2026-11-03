import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { ShieldAlert, MapPin, CheckCircle } from 'lucide-react';

const VolunteerSOS = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/sos');
      setAlerts(res.data.filter((a) => a.status === 'Active'));
    } catch (err) {
      console.error(err);
    }
  };

  const respondToAlert = async (id) => {
    try {
      await api.put(`/sos/${id}`, { status: 'Responded' });
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-red-50 p-6 rounded-3xl border border-red-200">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-black text-red-950">{t('sidebar.sosDispatches')}</h1>
              <p className="text-xs text-red-700 mt-1">
                Active emergency distress calls from nearby senior citizens. Rapid responder coordination.
              </p>
            </div>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400 text-sm">
            No active emergency SOS alerts in your region right now. Thank you for staying on alert!
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((al) => (
              <div key={al._id} className="bg-white p-6 rounded-3xl border-2 border-red-400 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold animate-pulse">
                    URGENT SOS
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    Distress Call from {al.elder?.name || 'Elderly Resident'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Contact: {al.elder?.phone} • Location: {al.location?.address}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${al.location?.latitude},${al.location?.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs text-blue-600 font-bold mt-2"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" /> View Exact GPS Location
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => respondToAlert(al._id)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-lg"
                >
                  I Am Responding Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VolunteerSOS;

