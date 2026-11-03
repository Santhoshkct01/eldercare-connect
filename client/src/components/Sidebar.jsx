import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const elderNav = [
    { name: 'Dashboard', path: '/elder/dashboard', icon: LayoutDashboard },
    { name: 'Emergency SOS', path: '/elder/sos', icon: ShieldAlert, highlight: true },
    { name: 'My Medicines', path: '/elder/medicines', icon: Pill },
    { name: 'Doctor Appointments', path: '/elder/appointments', icon: Calendar },
    { name: 'Request Assistance', path: '/elder/requests', icon: HandHeart },
    { name: 'Daily Wellness Check', path: '/elder/wellness', icon: HeartPulse },
    { name: 'Location Sharing', path: '/elder/location', icon: MapPin },
    { name: 'Medical Vault', path: '/elder/documents', icon: FileText },
    { name: 'Community Events', path: '/community', icon: Users },
  ];

  const familyNav = [
    { name: 'Family Dashboard', path: '/family/dashboard', icon: LayoutDashboard },
    { name: 'Live GPS Location', path: '/family/location', icon: MapPin },
    { name: 'Medicine Adherence', path: '/family/medicines', icon: Pill },
    { name: 'Wellness Tracker', path: '/family/wellness', icon: HeartPulse },
    { name: 'SOS Alerts', path: '/family/sos', icon: ShieldAlert },
    { name: 'Assistance History', path: '/family/requests', icon: HandHeart },
  ];

  const volunteerNav = [
    { name: 'Volunteer Dashboard', path: '/volunteer/dashboard', icon: LayoutDashboard },
    { name: 'Available Tasks', path: '/volunteer/requests', icon: HandHeart },
    { name: 'Emergency SOS Dispatches', path: '/volunteer/sos', icon: ShieldAlert, highlight: true },
    { name: 'Completed Missions', path: '/volunteer/history', icon: CheckCircle },
  ];

  const caregiverNav = [
    { name: 'Caregiver Dashboard', path: '/caregiver/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Elders', path: '/caregiver/elders', icon: Users },
    { name: 'Care Plans', path: '/caregiver/careplans', icon: FileText },
    { name: 'Health Logs', path: '/caregiver/health', icon: Activity },
  ];

  const adminNav = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Volunteer Approvals', path: '/admin/volunteers', icon: CheckCircle },
    { name: 'Emergency Monitor', path: '/admin/sos', icon: ShieldAlert },
    { name: 'All Assistance Requests', path: '/admin/requests', icon: HandHeart },
  ];

  let currentNav = elderNav;
  if (role === 'family') currentNav = familyNav;
  if (role === 'volunteer') currentNav = volunteerNav;
  if (role === 'caregiver') currentNav = caregiverNav;
  if (role === 'admin') currentNav = adminNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between py-6 min-h-[calc(100vh-4rem)]">
      <div className="px-4 space-y-1">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          {role.toUpperCase()} MENU
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
        <p className="capitalize text-teal-600 font-medium">{user.role}</p>
        <p className="mt-1">Connected: db01.dbhost.dev</p>
      </div>
    </aside>
  );
};

export default Sidebar;

