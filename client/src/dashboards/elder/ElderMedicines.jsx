import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { Pill, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';

const ElderMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Daily',
    scheduleTimes: '08:00, 20:00',
    instructions: 'Take after meals with water',
    stockRemaining: 30,
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const times = formData.scheduleTimes.split(',').map((t) => t.trim());
      await api.post('/medicines', {
        ...formData,
        scheduleTimes: times,
      });
      setShowModal(false);
      fetchMedicines();
    } catch (err) {
      console.error(err);
    }
  };

  const markTaken = async (id) => {
    try {
      await api.put(`/medicines/${id}/take`, { status: 'Taken' });
      fetchMedicines();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Medicine Reminders & Schedule</h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated reminders alert you when it's time to take your doses.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prescription</span>
          </button>
        </div>

        {/* Medicines List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.map((med) => (
            <div key={med._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Pill className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                    {med.frequency}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">Dosage: {med.dosage}</p>
                <p className="text-xs text-slate-500 mt-2">Instructions: {med.instructions}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-600">
                  <Clock className="w-4 h-4 mr-1 text-slate-400" />
                  <span>Times: {med.scheduleTimes?.join(', ')}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Remaining Stock: <strong className="text-slate-800">{med.stockRemaining} pills</strong>
                </div>
              </div>

              <div className="mt-6 pt-3">
                <button
                  onClick={() => markTaken(med._id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-sm transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Taken</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding medicine */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Add New Medicine</h3>
              <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Metformin / Amlodipine"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 500mg, 1 tablet"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Daily Schedule Times (Comma separated, 24h format)</label>
                  <input
                    type="text"
                    required
                    value={formData.scheduleTimes}
                    onChange={(e) => setFormData({ ...formData, scheduleTimes: e.target.value })}
                    placeholder="08:00, 14:00, 20:00"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Special Instructions</label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Starting Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockRemaining}
                    onChange={(e) => setFormData({ ...formData, stockRemaining: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold"
                  >
                    Save Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ElderMedicines;
