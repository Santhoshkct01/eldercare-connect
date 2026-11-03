import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { MapPin, Navigation, ToggleLeft, ToggleRight, ShieldCheck } from 'lucide-react';

const ElderLocation = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isSharing, setIsSharing] = useState(user?.location?.isSharing || false);
  const [coords, setCoords] = useState({
    latitude: user?.location?.latitude || 11.0168,
    longitude: user?.location?.longitude || 76.9558,
  });
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let watchId;
    if (isSharing && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ latitude: lat, longitude: lon });

          try {
            await api.post('/features/location/update', {
              latitude: lat,
              longitude: lon,
              isSharing: true,
            });
            socket.emit('update_location', {
              userId: user?._id,
              latitude: lat,
              longitude: lon,
            });
            setStatusMessage('Live coordinates updating every 15s');
          } catch (e) {
            console.error('Location sync error:', e);
          }
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharing]);

  const toggleLocationSharing = async () => {
    const nextState = !isSharing;
    setIsSharing(nextState);

    try {
      await api.post('/features/location/update', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        isSharing: nextState,
      });
      setStatusMessage(nextState ? 'Location sharing enabled' : 'Location sharing stopped');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{t('sidebar.locationSharing')}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Share authorized real-time GPS location with your family members and assigned volunteers during emergencies.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleLocationSharing}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow transition ${
                isSharing ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isSharing ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>{isSharing ? 'Sharing Active' : 'Sharing Paused'}</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>Current Registered GPS Position</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Latitude</p>
              <p className="font-mono font-bold text-slate-800 text-base">{coords.latitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-slate-500">Longitude</p>
              <p className="font-mono font-bold text-slate-800 text-base">{coords.longitude.toFixed(6)}</p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://maps.google.com/?q=${coords.latitude},${coords.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps Navigation</span>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElderLocation;

