import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { Users, Search } from 'lucide-react';

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data)).catch(console.error);
  }, []);

  const filtered = users.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('sidebar.userManagement')}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete registry of all registered seniors, volunteers, caregivers, family members and admins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="elder">Elder</option>
              <option value="family">Family</option>
              <option value="volunteer">Volunteer</option>
              <option value="caregiver">Caregiver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">City</th>
                <th className="p-3">Language</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full uppercase text-[10px] font-bold bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{u.phone}</td>
                  <td className="p-3 text-slate-600">{u.city || '-'}</td>
                  <td className="p-3 font-mono uppercase">{u.preferredLanguage || 'en'}</td>
                  <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;

