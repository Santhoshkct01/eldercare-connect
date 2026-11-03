import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Activity, HeartPulse } from 'lucide-react';

const CaregiverHealth = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/features/wellness').then((res) => setLogs(res.data)).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.healthLogs')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Clinical vitals log, sleep tracking, and physical symptoms recorded across elderly members.
          </p>
        </div>

        <div className="space-y-3">
          {logs.map((l) => (
            <div key={l._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center text-xs gap-3">
              <div>
                <span className="font-bold text-slate-800 text-sm">
                  {new Date(l.date || l.createdAt).toLocaleDateString()}
                </span>
                <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded">
                  Mood: {l.mood}
                </span>
                <div className="mt-1 text-slate-600">
                  BP: <strong>{l.bloodPressure?.systolic || 120} / {l.bloodPressure?.diastolic || 80}</strong> • Sugar: <strong>{l.sugarLevel || 110} mg/dL</strong> • Sleep: <strong>{l.sleepHours} hrs</strong>
                </div>
              </div>

              {l.notes && (
                <div className="text-slate-500 italic max-w-md">
                  "{l.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaregiverHealth;

