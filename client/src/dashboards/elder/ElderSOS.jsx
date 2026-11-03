import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import socket from '../../services/socket';
import { ShieldAlert, MapPin, CheckCircle, AlertTriangle, Phone, Radio } from 'lucide-react';

const ElderSOS = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle');
  const [alertData, setAlertData] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: 11.0168, lng: 76.9558 });
  const [address, setAddress] = useState(user?.address || 'Current Resident Location');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.log('Geolocation note:', err.message)
      );
    }
  }, []);

  const triggerEmergency = async () => {
    setStatus('sending');
    try {
      const res = await api.post('/sos', {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        address,
      });
      setAlertData(res.data.alert);
      setStatus('active');
      socket.emit('join_emergency', res.data.alert._id);
    } catch (err) {
      console.error(err);
      alert('Failed to dispatch SOS alert. Please dial 112 / 108 immediately.');
      setStatus('idle');
    }
  };

  const resolveEmergency = async () => {
    if (!alertData) return;
    try {
      await api.put(`/sos/${alertData._id}`, { status: 'Resolved' });
      setStatus('resolved');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold text-red-900">{t('sos.title')}</h1>
          <p className="mt-2 text-red-700 text-sm max-w-lg mx-auto">
            {t('sos.desc')}
          </p>

          <div className="mt-8">
            {status === 'idle' && (
              <button
                onClick={triggerEmergency}
                className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-2xl shadow-2xl transition transform hover:scale-105 active:scale-95 border-8 border-red-300 mx-auto flex flex-col items-center justify-center space-y-2 animate-bounce"
              >
                <Radio className="w-8 h-8" />
                <span>{t('sos.pressSos')}</span>
              </button>
            )}

            {status === 'sending' && (
              <div className="p-8 text-red-800 font-bold text-lg animate-pulse">
                {t('sos.broadcasting')}
              </div>
            )}

            {status === 'active' && (
              <div className="space-y-6">
                <div className="p-5 bg-white rounded-2xl border border-red-300 shadow-md text-left">
                  <div className="flex items-center space-x-2 text-red-600 font-bold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{t('sos.broadcastActive')}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {t('sos.alertId')}: <strong>{alertData?._id}</strong>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {t('sos.gpsCoords')}: <strong>{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</strong>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    <a
                      href={`https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      {t('sos.gmapsLink')}
                    </a>
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resolveEmergency}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow text-sm"
                  >
                    {t('sos.safeButton')}
                  </button>
                </div>
              </div>
            )}

            {status === 'resolved' && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <h3 className="font-bold text-lg">{t('sos.resolvedTitle')}</h3>
                <p className="text-xs mt-1">{t('sos.resolvedDesc')}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  {t('sos.resetButton')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">{t('sos.disclaimerTitle')}</p>
          {t('sos.disclaimerText')}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElderSOS;
