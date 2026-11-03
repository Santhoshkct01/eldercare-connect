import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import socket from '../../services/socket';
import { Users, MapPin, Pill, HeartPulse, ShieldAlert, PhoneCall, AlertCircle } from 'lucide-react';

const FamilyDashboard = () => {
  const { t } = useTranslation();
  const [sosAlerts, setSosAlerts] = useState([]);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    fetchFamilyData();

    socket.on('family_alert', (data) => {
      alert(`[Family Notification]: ${data.message}`);
    });

    return () => {
      socket.off('family_alert');
    };
  }, []);

  const fetchFamilyData = async () => {
    try {
      const [sosRes, wellRes, medRes] = await Promise.all([
        api.get('/sos'),
        api.get('/features/wellness'),
        api.get('/medicines'),
      ]);
      setSosAlerts(sosRes.data || []);
      setWellnessLogs(wellRes.data || []);
      setMedicines(medRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            {t('family.portalBadge')}
          </span>
          <h1 className="text-3xl font-black mt-2">{t('family.title')}</h1>
          <p className="mt-1 text-teal-100 text-sm">
            {t('family.subtitle')}
          </p>
        </div>

        {/* SOS Alerts Banner */}
        {sosAlerts.filter((a) => a.status === 'Active').length > 0 && (
          <div className="p-5 bg-red-100 border-2 border-red-500 rounded-3xl text-red-900 animate-pulse">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-extrabold text-lg">{t('family.criticalSosTitle')}</h3>
                <p className="text-xs mt-0.5">
                  {t('family.criticalSosDesc')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wellness Summary */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t('family.wellnessCard')}</h3>
                <p className="text-xs text-slate-500">{t('family.wellnessSub')}</p>
              </div>
            </div>

            {wellnessLogs.length > 0 ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                  <span className="text-slate-500">{t('family.reportedMood')}</span>
                  <span className="font-bold text-slate-800">{wellnessLogs[0].mood}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                  <span className="text-slate-500">{t('family.sleepDuration')}</span>
                  <span className="font-bold text-slate-800">{wellnessLogs[0].sleepHours} {t('wellness.hours')}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between">
                  <span className="text-slate-500">{t('family.bloodPressure')}</span>
                  <span className="font-bold text-slate-800">
                    {wellnessLogs[0].bloodPressure?.systolic || 120} / {wellnessLogs[0].bloodPressure?.diastolic || 80}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">{t('family.noWellness')}</p>
            )}
          </div>

          {/* Medicine Adherence */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t('family.medCard')}</h3>
                <p className="text-xs text-slate-500">{t('family.medSub')}</p>
              </div>
            </div>

            <div className="space-y-3">
              {medicines.slice(0, 3).map((med) => (
                <div key={med._id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{med.name}</h5>
                    <p className="text-slate-500 text-[11px]">{med.dosage}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px]">
                    {t('family.prescribed')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Safety */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t('family.locationCard')}</h3>
                <p className="text-xs text-slate-500">{t('family.locationSub')}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800">{t('family.residenceCoords')}</p>
              <p className="font-mono text-[11px]">Lat: 11.0168, Lon: 76.9558</p>
              <a
                href="https://maps.google.com/?q=11.0168,76.9558"
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs"
              >
                {t('family.openMaps')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyDashboard;
