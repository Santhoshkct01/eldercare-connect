import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, FileText, Activity, Calendar, Plus, Check } from 'lucide-react';

const CaregiverDashboard = () => {
  const { user } = useAuth();
  const [carePlans, setCarePlans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    dietaryRestrictions: 'Low Sodium, Diabetic Friendly',
    notes: 'Requires assistance with physical mobility and medication monitoring',
  });

  useEffect(() => {
    fetchCaregiverData();
  }, []);

  const fetchCaregiverData = async () => {
    try {
      const [cpRes, apptRes] = await Promise.all([
        api.get('/features/careplans'),
        api.get('/features/appointments'),
      ]);
      setCarePlans(cpRes.data || []);
      setAppointments(apptRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await api.post('/features/careplans', newPlan);
      setShowModal(false);
      fetchCaregiverData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            Professional Caregiver Portal
          </span>
          <h1 className="text-3xl font-black mt-2">Caregiver Console</h1>
          <p className="mt-1 text-blue-100 text-sm">
            Manage comprehensive senior care plans, clinical visit schedules, and health observations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Care Plans */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-lg">Care Plans</h3>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Plan</span>
              </button>
            </div>

            {carePlans.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No care plans configured yet.</p>
            ) : (
              <div className="space-y-3">
                {carePlans.map((plan) => (
                  <div key={plan._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <p className="font-bold text-slate-800">Dietary: {plan.dietaryRestrictions}</p>
                    <p className="text-slate-500 mt-1">{plan.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical Visits & Appointments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-lg">Clinical Schedules</h3>
            </div>

            <div className="space-y-3">
              {appointments.slice(0, 4).map((a) => (
                <div key={a._id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800">{a.doctorName}</h5>
                    <p className="text-slate-500">{a.hospital} • {a.specialty}</p>
                  </div>
                  <span className="font-semibold text-slate-600">
                    {new Date(a.appointmentDate).toLocaleDateString()} at {a.appointmentTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaregiverDashboard;

