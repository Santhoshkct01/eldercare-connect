import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import VoiceAssistant from '../components/VoiceAssistant';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  ShieldAlert,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  PhoneCall,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-16 md:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-6">
            <Heart className="w-3.5 h-3.5 fill-blue-600" />
            <span>{t('home.badge')}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            {t('home.titlePrefix')} <br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              {t('home.titleGradient')}
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/register?role=elder"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center space-x-2 text-base"
            >
              <span>{t('home.joinElder')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/register?role=volunteer"
              className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center space-x-2 text-base"
            >
              <Users className="w-5 h-5" />
              <span>{t('home.joinVolunteer')}</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold rounded-xl shadow-sm transition text-base"
            >
              {t('home.signIn')}
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-800">{t('home.metrics.sosTime')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('home.metrics.sosLabel')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-800">{t('home.metrics.reminderRate')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('home.metrics.reminderLabel')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <MapPin className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-800">{t('home.metrics.matchingAlgorithm')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('home.metrics.matchingLabel')}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-slate-800">{t('home.metrics.vettedStatus')}</h3>
              <p className="text-xs text-slate-500 font-medium">{t('home.metrics.vettedLabel')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">
              {t('home.featuresTitle')}
            </h2>
            <p className="mt-4 text-slate-600">
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-400 transition">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.sosCardTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.sosCardDesc')}
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-400 transition">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.medCardTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.medCardDesc')}
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 hover:border-blue-400 transition">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{t('home.volCardTitle')}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('home.volCardDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 text-center text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-white mb-2">{t('nav.brand')} - {t('nav.tagline')}</p>
          <p className="text-xs">
            {t('home.footerNotice')}
          </p>
          <p className="text-xs mt-4 text-slate-500">
            {t('home.footerTech')}
          </p>
        </div>
      </footer>

      <VoiceAssistant />
    </div>
  );
};

export default HomePage;
