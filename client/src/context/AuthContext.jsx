import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import socket from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [largeText, setLargeText] = useState(() => localStorage.getItem('accessibility_largeText') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('accessibility_highContrast') === 'true');
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('eldercare_lang') || 'en';
  });

  // Sync language with i18n and localStorage
  const setLanguage = async (newLang) => {
    const lang = newLang === 'ta' ? 'ta' : 'en';
    setLanguageState(lang);
    localStorage.setItem('eldercare_lang', lang);
    await i18n.changeLanguage(lang);

    // If user is logged in, sync with MongoDB
    if (user && user._id) {
      try {
        await api.put('/auth/profile', { preferredLanguage: lang });
        const updatedUser = { ...user, preferredLanguage: lang };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Failed to sync language to database:', err);
      }
    }
  };

  useEffect(() => {
    if (user && user.preferredLanguage) {
      const preferred = user.preferredLanguage === 'ta' ? 'ta' : 'en';
      setLanguageState(preferred);
      localStorage.setItem('eldercare_lang', preferred);
      i18n.changeLanguage(preferred);
    }
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      socket.emit('join_user_room', user._id);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('accessibility_largeText', largeText);
    if (largeText) {
      document.body.classList.add('accessibility-large-text');
    } else {
      document.body.classList.remove('accessibility-large-text');
    }
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('accessibility_highContrast', highContrast);
    if (highContrast) {
      document.body.classList.add('accessibility-high-contrast');
    } else {
      document.body.classList.remove('accessibility-high-contrast');
    }
  }, [highContrast]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.preferredLanguage) {
        setLanguage(res.data.preferredLanguage);
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      setUser(res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      if (res.data.preferredLanguage) {
        setLanguage(res.data.preferredLanguage);
      }
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err.response?.data?.message || 'Registration failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        largeText,
        setLargeText,
        highContrast,
        setHighContrast,
        language,
        setLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
