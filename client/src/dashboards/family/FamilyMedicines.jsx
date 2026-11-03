import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Pill, CheckCircle, Clock } from 'lucide-react';

const FamilyMedicines = () => {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    api.get('/medicines').then((res) => setMedicines(res.data)).catch(console.error);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.medicineAdherence')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time verification of scheduled medication doses taken by your loved ones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.map((med) => (
            <div key={med._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Pill className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg">
                    Adherence Monitored
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{med.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{med.dosage}</p>
                <p className="text-xs text-slate-500 mt-2">{med.instructions}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span>Scheduled: {med.scheduleTimes?.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyMedicines;

