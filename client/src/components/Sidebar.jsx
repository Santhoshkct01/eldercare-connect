import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ShieldAlert,
  Pill,
  Calendar,
  HandHeart,
  Users,
  MapPin,
  HeartPulse,
  FileText,
  DollarSign,
  Activity,
  CheckCircle,
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const elderNav = [
    { name: t('sidebar.dashboard'), path: '/elder/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.emergencySos'), path: '/elder/sos', icon: ShieldAlert, highlight: true },
    { name: t('sidebar.medicines'), path: '/elder/medicines', icon: Pill },
    { name: t('sidebar.appointments'), path: '/elder/appointments', icon: Calendar },
    { name: t('sidebar.requestAssistance'), path: '/elder/requests', icon: HandHeart },
    { name: t('sidebar.wellnessCheck'), path: '/elder/wellness', icon: HeartPulse },
    { name: t('sidebar.locationSharing'), path: '/elder/location', icon: MapPin },
    { name: t('sidebar.medicalVault'), path: '/elder/documents', icon: FileText },
    { name: t('sidebar.communityEvents'), path: '/community', icon: Users },
  ];

  const familyNav = [
    { name: t('sidebar.familyDashboard'), path: '/family/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.liveGps'), path: '/family/location', icon: MapPin },
    { name: t('sidebar.medicineAdherence'), path: '/family/medicines', icon: Pill },
    { name: t('sidebar.wellnessTracker'), path: '/family/wellness', icon: HeartPulse },
    { name: t('sidebar.sosAlerts'), path: '/family/sos', icon: ShieldAlert },
    { name: t('sidebar.assistanceHistory'), path: '/family/requests', icon: HandHeart },
  ];

  const volunteerNav = [
    { name: t('sidebar.volunteerDashboard'), path: '/volunteer/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.availableTasks'), path: '/volunteer/requests', icon: HandHeart },
    { name: t('sidebar.sosDispatches'), path: '/volunteer/sos', icon: ShieldAlert, highlight: true },
    { name: t('sidebar.completedMissions'), path: '/volunteer/history', icon: CheckCircle },
  ];

  const adminNav = [
    { name: t('sidebar.adminOverview'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.userManagement'), path: '/admin/users', icon: Users },
    { name: t('sidebar.volunteerApprovals'), path: '/admin/volunteers', icon: CheckCircle },
    { name: t('sidebar.emergencyMonitor'), path: '/admin/sos', icon: ShieldAlert },
    { name: t('sidebar.allRequests'), path: '/admin/requests', icon: HandHeart },
  ];

  let currentNav = elderNav;
  if (role === 'family') currentNav = familyNav;
  if (role === 'volunteer') currentNav = volunteerNav;
  if (role === 'admin') currentNav = adminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between py-6 min-h-[calc(100vh-4rem)]">
      <div className="px-4 space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t(`roles.${role}`).toUpperCase()} {t('sidebar.menu')}
        </div>
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                item.highlight
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.highlight ? 'text-red-500' : isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="px-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
        <p className="font-semibold text-slate-700">{user.name}</p>
        <p className="capitalize text-teal-600 font-medium">{t(`roles.${user.role}`)}</p>
        <p className="mt-1">{t('sidebar.connectedDb')}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
