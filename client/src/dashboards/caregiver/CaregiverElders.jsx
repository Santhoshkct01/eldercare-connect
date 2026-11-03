import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Users, Phone, MapPin, HeartPulse } from 'lucide-react';

const CaregiverElders = () => {
  const { t } = useTranslation();
  const [elders, setElders] = useState([]);

  useEffect(() => {
    api.get('/admin/users').then((res) => {
      setElders(res.data.filter((u) => u.role === 'elder'));
    }).catch(() => {
      // Fallback for caregivers without full admin access
      api.get('/features/wellness').then((res) => {
        const unique = [];
        res.data.forEach((w) => {
          if (w.elder && !unique.find((u) => u._id === w.elder._id)) unique.push(w.elder);
        });
        setElders(unique);
      }).catch(console.error);
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.assignedElders')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered senior citizens under clinical care coordination and daily welfare observation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {elders.map((el) => (
            <div key={el._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                  {el.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{el.name}</h4>
                  <p className="text-xs text-slate-500">Age: {el.age || 70} yrs</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                <div className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{el.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  <span>{el.address || el.city || 'Tamil Nadu'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CaregiverElders;

