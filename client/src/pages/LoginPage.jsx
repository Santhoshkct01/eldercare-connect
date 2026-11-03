import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Heart, Lock, Mail, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 fill-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t('auth.welcomeBack')}</h2>
            <p className="text-sm text-slate-500 mt-1">{t('auth.signInSubtitle')}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm flex items-center space-x-2 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('auth.emailLabel')}</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? t('auth.signingIn') : t('auth.signInBtn')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              {t('auth.registerHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
