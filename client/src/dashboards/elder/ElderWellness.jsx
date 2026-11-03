import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { HeartPulse, Check, Smile, Meh, Frown, Droplet, Moon, Activity } from 'lucide-react';

const ElderWellness = () => {
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    mood: 'Good',
    sleepHours: 7,
    waterIntakeGlasses: 6,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    sugarLevel: 110,
    notes: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWellness();
  }, []);

  const fetchWellness = async () => {
    try {
      const res = await api.get('/features/wellness');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/features/wellness', {
        mood: formData.mood,
        sleepHours: Number(formData.sleepHours),
        waterIntakeGlasses: Number(formData.waterIntakeGlasses),
        bloodPressure: {
          systolic: Number(formData.bloodPressureSystolic),
          diastolic: Number(formData.bloodPressureDiastolic),
        },
        sugarLevel: Number(formData.sugarLevel),
        notes: formData.notes,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchWellness();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Daily Wellness Check-In</h1>
              <p className="text-xs text-slate-500">
                Log your daily mood, sleep, and vitals to keep your family and caregivers updated.
              </p>
            </div>
          </div>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-2 text-sm font-semibold">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>Today's wellness check logged successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-3">How are you feeling today?</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {['Great', 'Good', 'Okay', 'Unwell', 'In Pain'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setFormData({ ...formData, mood: m })}
                  className={`p-3 rounded-2xl border text-center transition ${
                    formData.mood === m
                      ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs">{m}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
                <Moon className="w-4 h-4 text-purple-600" />
                <span>Sleep Hours (Last Night)</span>
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={formData.sleepHours}
                onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span>Water Intake (Glasses)</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.waterIntakeGlasses}
                onChange={(e) => setFormData({ ...formData, waterIntakeGlasses: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
                <Activity className="w-4 h-4 text-red-600" />
                <span>Blood Pressure (Systolic / Diastolic)</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="120"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                />
                <input
                  type="number"
                  placeholder="80"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                  className="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 mb-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>Blood Sugar Level (mg/dL)</span>
              </label>
              <input
                type="number"
                placeholder="110"
                value={formData.sugarLevel}
                onChange={(e) => setFormData({ ...formData, sugarLevel: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Daily Notes / Symptoms</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Mild knee stiffness, walked in garden for 20 minutes"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
          >
            Save Today's Check-In
          </button>
        </form>

        {/* Recent logs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold text-slate-900 text-base mb-4">Past Wellness History</h3>
          <div className="space-y-3">
            {history.slice(0, 5).map((log) => (
              <div key={log._id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    {new Date(log.date || log.createdAt).toLocaleDateString()}
                  </span>
                  <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold">
                    Mood: {log.mood}
                  </span>
                  <span className="ml-2 text-slate-500">
                    Sleep: {log.sleepHours} hrs • BP: {log.bloodPressure?.systolic || 120}/{log.bloodPressure?.diastolic || 80}
                  </span>
                </div>
                {log.notes && <span className="text-slate-400 italic truncate max-w-xs">{log.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElderWellness;

