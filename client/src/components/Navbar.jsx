import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import socket from '../services/socket';
import {
  Heart,
  Globe,
  Type,
  Eye,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Bell,
  Check,
  ExternalLink,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, largeText, setLargeText, highContrast, setHighContrast, language, setLanguage } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Join user-specific socket room
      socket.emit('join_user_room', user._id);

      socket.on('medicine_reminder', (data) => {
        fetchNotifications();
      });

      return () => {
        socket.off('medicine_reminder');
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/features/notifications');
      const list = res.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch (err) {
      console.warn('Fetch notifications notice:', err.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/features/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSOSQuick = () => {
    navigate('/elder/sos');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                {t('nav.brand')}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {t('nav.tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Accessibility Controls */}
            <button
              onClick={() => setLargeText(!largeText)}
              title="Toggle Large Typography"
              className={`p-2 rounded-lg border text-sm flex items-center space-x-1 font-semibold ${
                largeText ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>{t('nav.largeText')}</span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              title="Toggle High Contrast Mode"
              className={`p-2 rounded-lg border text-sm flex items-center space-x-1 ${
                highContrast ? 'bg-yellow-100 border-yellow-500 text-black font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{t('nav.contrast')}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition ${language === 'en' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🌐 English
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 rounded-md transition ${language === 'ta' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                🌐 தமிழ்
              </button>
            </div>

            {/* User Navigation & Notifications */}
            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl relative transition"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-sm">
                          {language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}
                        </span>
                        <span className="text-[11px] text-blue-600 font-semibold">
                          {unreadCount} {language === 'ta' ? 'புதியவை' : 'unread'}
                        </span>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400">
                            {language === 'ta' ? 'அறிவிப்புகள் எதுவும் இல்லை' : 'No notifications yet'}
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n._id}
                              className={`p-3 transition ${n.isRead ? 'bg-white opacity-80' : 'bg-blue-50/40'}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-bold text-slate-900">{n.title}</p>
                                {!n.isRead && (
                                  <button
                                    onClick={() => markAsRead(n._id)}
                                    className="text-blue-600 hover:text-blue-800 text-[10px] font-bold"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-slate-600 mt-0.5 text-[11px]">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={() => setNotifDropdownOpen(false)}
                                  className="text-blue-600 font-bold hover:underline inline-flex items-center space-x-1 mt-1 text-[11px]"
                                >
                                  <span>{language === 'ta' ? 'பார்க்கவும்' : 'View Details'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={`/${user.role}/dashboard`}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100"
                >
                  {t('nav.dashboard')} ({t(`roles.${user.role}`)})
                </Link>

                {user.role === 'elder' && (
                  <button
                    onClick={handleSOSQuick}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center space-x-1 shadow animate-pulse"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t('nav.sos')}</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 rounded-lg"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-700 font-semibold text-sm hover:text-blue-600"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Language & Menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-1 rounded ${language === 'ta' ? 'bg-blue-600 text-white font-bold' : 'text-slate-700'}`}
              >
                தமிழ்
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">{t('nav.home')}</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">{t('nav.about')}</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">{t('nav.services')}</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">{t('nav.contact')}</Link>
          {user ? (
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link to={`/${user.role}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="py-2 text-blue-600 font-bold">{t('nav.dashboard')}</Link>
              <button onClick={logout} className="text-left py-2 text-red-600 font-medium">{t('nav.logout')}</button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex space-x-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-2 border border-slate-300 rounded-lg font-semibold">{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-2 bg-blue-600 text-white rounded-lg font-semibold">{t('nav.register')}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
