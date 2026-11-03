import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [largeText, setLargeText] = useState(() => localStorage.getItem('accessibility_largeText') === 'true');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('accessibility_highContrast') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('eldercare_lang') || 'en');

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
