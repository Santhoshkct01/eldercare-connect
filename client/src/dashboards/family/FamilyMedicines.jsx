import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { formatISTTime12 } from '../../utils/timeUtils';
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
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900">{t('sidebar.medicineAdherence')}</h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
              IST (UTC+05:30)
            </span>
          </div>
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

                {/* Doses today status */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-600 uppercase flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    <span>Today's Doses (IST)</span>
                  </p>
                  {(med.dosesToday || []).map((dose, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-xl">
                      <span className="font-semibold text-slate-800">{dose.display12}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dose.status === 'Taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dose.status === 'Missed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dose.status}
                      </span>
                    </div>
                  ))}
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
