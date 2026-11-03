import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';

const FamilyLocation = () => {
  const { t } = useTranslation();
  const [coords, setCoords] = useState({ latitude: 11.0168, longitude: 76.9558, address: 'Home Residence, Coimbatore' });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">{t('sidebar.liveGps')}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized GPS tracking of your connected senior members with consent.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold">
            <Compass className="w-5 h-5 text-blue-600" />
            <span>Senior Residence Location</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-500">Latitude</p>
              <p className="font-mono font-bold text-slate-800 text-base">{coords.latitude}</p>
            </div>
            <div>
              <p className="text-slate-500">Longitude</p>
              <p className="font-mono font-bold text-slate-800 text-base">{coords.longitude}</p>
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
              <span>Track on Live Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FamilyLocation;
