import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import socket from '../../services/socket';
import {
  ShieldAlert,
  Pill,
  Calendar,
  HandHeart,
  HeartPulse,
  PhoneCall,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ElderDashboard = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [wellnessLogs, setWellnessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();

    socket.on('medicine_reminder', (data) => {
      setActionMessage(`🔔 Medicine Reminder: Time to take ${data.medicine.name} (${data.medicine.dosage})`);
    });

    return () => {
      socket.off('medicine_reminder');
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [medRes, apptRes, reqRes, wellRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/features/appointments'),
        api.get('/requests'),
        api.get('/features/wellness'),
      ]);
      setMedicines(medRes.data || []);
      setAppointments(apptRes.data || []);
      setRequests(reqRes.data || []);
      setWellnessLogs(wellRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching elder data:', err);
      setLoading(false);
    }
  };

  const handleTakeMedicine = async (medId) => {
    try {
      await api.put(`/medicines/${medId}/take`, { status: 'Taken' });
      setActionMessage('Medicine marked as taken successfully.');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <div>
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Elderly Care Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Good day, {user?.name}!</h1>
            <p className="mt-2 text-blue-100 max-w-lg">
              Here is your daily health and assistance summary. Emergency assistance and volunteers are always ready.
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex flex-col items-center">
            <Link
              to="/elder/sos"
              className="px-8 py-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xl rounded-2xl shadow-2xl flex items-center space-x-3 transition transform hover:scale-105 active:scale-95 border-2 border-red-400 animate-pulse"
            >
              <ShieldAlert className="w-8 h-8" />
              <span>EMERGENCY SOS</span>
            </Link>
            <span className="text-xs text-red-100 mt-2 font-medium">One-touch instant broadcast</span>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-sm">{actionMessage}</span>
            </div>
            <button onClick={() => setActionMessage('')} className="text-xs text-teal-600 underline">Dismiss</button>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/elder/requests"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <HandHeart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Request Help</h4>
              <p className="text-xs text-slate-500">Groceries, Doctor, Walk</p>
            </div>
          </Link>

          <Link
            to="/elder/medicines"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Medicines</h4>
              <p className="text-xs text-slate-500">{medicines.length} registered</p>
            </div>
          </Link>

          <Link
            to="/elder/wellness"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Daily Check-in</h4>
              <p className="text-xs text-slate-500">Log mood & vitals</p>
            </div>
          </Link>

          <Link
            to="/elder/appointments"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Appointments</h4>
              <p className="text-xs text-slate-500">{appointments.length} upcoming</p>
            </div>
          </Link>
        </div>

        {/* Two Column Layout: Medicines + Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Medicines Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Today's Medication</h3>
              </div>
              <Link to="/elder/medicines" className="text-xs text-blue-600 font-semibold flex items-center">
                Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {medicines.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No medicines scheduled. Click "Manage" to add your prescriptions.
              </div>
            ) : (
              <div className="space-y-3">
                {medicines.slice(0, 4).map((med) => (
                  <div key={med._id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{med.name}</h4>
                      <p className="text-xs text-slate-500">
                        {med.dosage} • {med.instructions} • Times: {med.scheduleTimes?.join(', ') || '08:00'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleTakeMedicine(med._id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                    >
                      Mark Taken
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Assistance Requests */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <HandHeart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Assistance Status</h3>
              </div>
              <Link to="/elder/requests" className="text-xs text-teal-600 font-semibold flex items-center">
                New Request <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {requests.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active requests. Need help with groceries or appointments? Click New Request.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-full">
                          {req.category}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1">{req.description}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Date: {new Date(req.preferredDate).toLocaleDateString()} at {req.preferredTime}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                        req.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'Accepted' || req.status === 'In Progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    {req.assignedVolunteer && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                        <span>Assigned Volunteer: <strong>{req.assignedVolunteer.name}</strong></span>
                        <a href={`tel:${req.assignedVolunteer.phone}`} className="text-blue-600 font-bold flex items-center">
                          <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call Volunteer
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Contacts & Trusted Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900">Configured Emergency Contact</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Name: <strong>{user?.emergencyContact?.name || 'Family Contact'}</strong> • Phone: <strong>{user?.emergencyContact?.phone || user?.phone}</strong>
            </p>
          </div>
          <a
            href={`tel:${user?.emergencyContact?.phone || user?.phone}`}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center space-x-2"
          >
            <PhoneCall className="w-4 h-4 text-slate-600" />
            <span>Call Trusted Contact</span>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElderDashboard;
