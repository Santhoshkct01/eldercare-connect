import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { language } = useAuth();
  const navigate = useNavigate();

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (cmd) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help') || lower.includes('அவசரம்') || lower.includes('உதவி')) {
      speak(t('voice.sosCommand'));
      setFeedback(t('voice.sosCommand'));
      setTimeout(() => navigate('/elder/sos'), 1000);
    } else if (lower.includes('medicine') || lower.includes('pills') || lower.includes('remind') || lower.includes('மருந்து')) {
      speak(t('voice.medCommand'));
      setFeedback(t('voice.medCommand'));
      setTimeout(() => navigate('/elder/medicines'), 800);
    } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('மருத்துவர்') || lower.includes('சந்திப்பு')) {
      speak(t('voice.apptCommand'));
      setFeedback(t('voice.apptCommand'));
      setTimeout(() => navigate('/elder/appointments'), 800);
    } else if (lower.includes('request') || lower.includes('volunteer') || lower.includes('தன்னார்வலர்')) {
      speak(t('voice.reqCommand'));
      setFeedback(t('voice.reqCommand'));
      setTimeout(() => navigate('/elder/requests'), 800);
    } else if (lower.includes('home') || lower.includes('dashboard') || lower.includes('முகப்பு')) {
      speak(t('voice.dashCommand'));
      setFeedback(t('voice.dashCommand'));
      setTimeout(() => navigate('/elder/dashboard'), 800);
    } else {
      const msg = language === 'ta'
        ? `கேட்கப்பட்டது: "${cmd}". அவசர உதவி, மருந்துகள், அல்லது மருத்துவ சந்திப்பு என்று கூறிப்பாருங்கள்.`
        : `I heard: "${cmd}". Try saying: "Emergency SOS", "My Medicines", or "Appointments".`;
      speak(msg);
      setFeedback(msg);
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'ta' ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.' : 'Web Speech API is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback(language === 'ta' ? 'கேட்கிறது... இப்போது பேசவும்.' : 'Listening... Please speak now.');
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      processCommand(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      setFeedback(language === 'ta' ? 'குரல் கேட்கவில்லை. மீண்டும் கிளிக் செய்து பேசவும்.' : 'Could not hear voice. Please try clicking again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-80 mb-3 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Volume2 className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{t('voice.title')}</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            {t('voice.subtitle')}
          </p>

          <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs min-h-[50px] flex items-center justify-center text-center text-slate-700">
            {feedback || t('voice.defaultFeedback')}
          </div>

          {transcript && (
            <p className="text-[11px] text-slate-400 italic text-center mb-3">
              "{transcript}"
            </p>
          )}

          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              className={`p-4 rounded-full text-white shadow-lg transition-transform active:scale-95 ${
                isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            speak(t('voice.readyGreeting'));
          }
        }}
        title={t('voice.title')}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition hover:scale-105"
      >
        <Mic className="w-7 h-7" />
      </button>
    </div>
  );
};

export default VoiceAssistant;
