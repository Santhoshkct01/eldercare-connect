import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users,
  ShieldAlert,
  HandHeart,
  CheckCircle,
  Clock,
  Activity,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { language } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const locale = language === 'ta' ? 'ta-IN' : 'en-IN';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, sosRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/sos'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setSosAlerts(sosRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleVerifyVolunteer = async (id, status) => {
    try {
      await api.put(`/admin/volunteers/${id}/verify`, { isVerifiedVolunteer: status });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">
              {t('admin.badge')}
            </span>
            <h1 className="text-3xl font-black mt-2">{t('admin.title')}</h1>
            <p className="mt-1 text-slate-400 text-sm">
              {t('admin.subtitle')}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-xs text-slate-400 font-mono bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
            Database: db_458492c92 <br />
            Host: db01.dbhost.dev:5050
          </div>
        </div>

        {/* Live Database Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">{t('admin.totalUsers')}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.totalUsers || 0}</h3>
            <p className="text-[11px] text-blue-600 mt-1 font-semibold">{stats?.elderlyUsers || 0} {t('admin.seniorsCount')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">{t('admin.activeRequests')}</p>
            <h3 className="text-3xl font-black text-amber-600 mt-2">{stats?.activeRequests || 0}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">{stats?.completedRequests || 0} {t('admin.completedCount')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">{t('admin.pendingVolunteers')}</p>
            <h3 className="text-3xl font-black text-indigo-600 mt-2">{stats?.pendingApprovals || 0}</h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-semibold">{stats?.approvedVolunteers || 0} {t('admin.approvedCount')}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">{t('admin.activeSos')}</p>
            <h3 className={`text-3xl font-black mt-2 ${stats?.emergencyCases > 0 ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
              {stats?.emergencyCases || 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">{t('admin.emergencyDispatch')}</p>
          </div>
        </div>

        {/* Charts & Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">{t('admin.requestCategories')}</h3>
            <div className="h-64">
              {stats?.categoryDistribution && stats.categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryDistribution}>
                    <XAxis dataKey="name" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  {t('admin.noRequestRecords')}
                </div>
              )}
            </div>
          </div>

          {/* Volunteer Approvals Pipeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4">{t('admin.volunteerQueue')}</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {users.filter((u) => u.role === 'volunteer').length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">{t('admin.noVolunteers')}</p>
              ) : (
                users.filter((u) => u.role === 'volunteer').map((vol) => (
                  <div key={vol._id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{vol.name}</p>
                      <p className="text-slate-500">{vol.email} • {vol.phone}</p>
                    </div>
                    <div className="flex space-x-2">
                      {vol.isVerifiedVolunteer ? (
                        <button
                          onClick={() => handleVerifyVolunteer(vol._id, false)}
                          className="px-3 py-1 bg-slate-200 hover:bg-red-100 hover:text-red-700 rounded-lg text-slate-700 font-bold text-[11px]"
                        >
                          {t('admin.revoke')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerifyVolunteer(vol._id, true)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          {t('admin.approve')}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Master Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">{t('admin.registeredUsers')} ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-xl">{t('admin.table.name')}</th>
                  <th className="p-3">{t('admin.table.email')}</th>
                  <th className="p-3">{t('admin.table.role')}</th>
                  <th className="p-3">{t('admin.table.phone')}</th>
                  <th className="p-3">{t('admin.table.city')}</th>
                  <th className="p-3 rounded-r-xl">{t('admin.table.joined')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.slice(0, 10).map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{u.name}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'elder' ? 'bg-blue-100 text-blue-800' :
                        u.role === 'volunteer' ? 'bg-teal-100 text-teal-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {t(`roles.${u.role}`)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.phone}</td>
                    <td className="p-3 text-slate-600">{u.city || '-'}</td>
                    <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString(locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
