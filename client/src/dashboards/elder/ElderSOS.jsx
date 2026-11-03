import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import { ShieldAlert, MapPin, CheckCircle, AlertTriangle, Phone, Radio } from 'lucide-react';

const ElderSOS = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, sending, active, resolved
  const [alertData, setAlertData] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: 11.0168, lng: 76.9558 });
  const [address, setAddress] = useState(user?.address || 'Current Resident Location');
  const [countdown, setCountdown] = useState(0);

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

      // Join real-time socket emergency room
      socket.emit('join_emergency', res.data.alert._id);
    } catch (err) {
      console.error(err);
      alert('Failed to dispatch SOS alert. Please dial 112 / 911 immediately.');
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

          <h1 className="text-3xl font-extrabold text-red-900">Emergency SOS Dispatch</h1>
          <p className="mt-2 text-red-700 text-sm max-w-lg mx-auto">
            Pressing the SOS button instantly notifies your family members, platform administrators, and dispatches the nearest approved volunteers to your GPS location.
          </p>

          <div className="mt-8">
            {status === 'idle' && (
              <button
                onClick={triggerEmergency}
                className="w-48 h-48 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-2xl shadow-2xl transition transform hover:scale-105 active:scale-95 border-8 border-red-300 mx-auto flex flex-col items-center justify-center space-y-2 animate-bounce"
              >
                <Radio className="w-8 h-8" />
                <span>PRESS SOS</span>
              </button>
            )}

            {status === 'sending' && (
              <div className="p-8 text-red-800 font-bold text-lg animate-pulse">
                Broadcasting emergency coordinates to response team...
              </div>
            )}

            {status === 'active' && (
              <div className="space-y-6">
                <div className="p-5 bg-white rounded-2xl border border-red-300 shadow-md text-left">
                  <div className="flex items-center space-x-2 text-red-600 font-bold mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>EMERGENCY DISPATCH BROADCAST ACTIVE</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Alert ID: <strong>{alertData?._id}</strong>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Dispatched GPS Coordinates: <strong>{coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}</strong>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Google Maps Link:{' '}
                    <a
                      href={`https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline font-semibold"
                    >
                      View on Google Maps
                    </a>
                  </p>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={resolveEmergency}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow text-sm"
                  >
                    I Am Safe Now (Cancel / Resolve SOS)
                  </button>
                </div>
              </div>
            )}

            {status === 'resolved' && (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <h3 className="font-bold text-lg">Alert Marked as Resolved</h3>
                <p className="text-xs mt-1">Your family and volunteers have been notified that you are safe.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  Reset Button
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Safety Disclaimer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-500">
          <p className="font-semibold text-slate-700 mb-1">Important Safety Disclaimer:</p>
          This platform coordinates with local volunteers and family caregivers. In life-threatening emergencies requiring immediate paramedic or law enforcement response, please call your local official emergency telephone number directly (112 / 911 / 108).
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElderSOS;

