import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Globe, Type, Eye, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout, largeText, setLargeText, highContrast, setHighContrast, language, setLanguage } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

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
                Eldercare Connect
              </span>
              <span className="block text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Smart Assistance Platform
              </span>
            </div>
          </Link>

          {/* Accessibility Controls & Language */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setLargeText(!largeText)}
              title="Toggle Large Typography"
              className={`p-2 rounded-lg border text-sm flex items-center space-x-1 font-semibold ${
                largeText ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>A+</span>
            </button>

            <button
              onClick={() => setHighContrast(!highContrast)}
              title="Toggle High Contrast Mode"
              className={`p-2 rounded-lg border text-sm flex items-center space-x-1 ${
                highContrast ? 'bg-yellow-100 border-yellow-500 text-black font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Contrast</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-2 py-0.5 rounded ${language === 'ta' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'}`}
              >
                हिन्दी
              </button>
            </div>

            {/* User Navigation */}
            {user ? (
              <div className="flex items-center space-x-3 ml-4">
                <Link
                  to={`/${user.role}/dashboard`}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100"
                >
                  Dashboard ({user.role})
                </Link>
                {user.role === 'elder' && (
                  <button
                    onClick={handleSOSQuick}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold flex items-center space-x-1 shadow animate-pulse"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>SOS</span>
                  </button>
                )}
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 rounded-lg"
                  title="Logout"
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
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Home</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">About Us</Link>
          <Link to="/services" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Services</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 font-medium">Contact</Link>
          {user ? (
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link to={`/${user.role}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="py-2 text-blue-600 font-bold">Go to Dashboard</Link>
              <button onClick={logout} className="text-left py-2 text-red-600 font-medium">Logout</button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex space-x-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-2 border border-slate-300 rounded-lg font-semibold">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-1/2 text-center py-2 bg-blue-600 text-white rounded-lg font-semibold">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

