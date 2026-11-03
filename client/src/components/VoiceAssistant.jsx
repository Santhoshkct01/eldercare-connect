import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (cmd) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help')) {
      speak('Activating emergency SOS alert immediately.');
      setFeedback('Triggering Emergency SOS...');
      setTimeout(() => navigate('/elder/sos'), 1000);
    } else if (lower.includes('medicine') || lower.includes('pills') || lower.includes('remind')) {
      speak('Opening medicine schedule and reminders.');
      setFeedback('Navigating to Medicines...');
      setTimeout(() => navigate('/elder/medicines'), 800);
    } else if (lower.includes('doctor') || lower.includes('appointment')) {
      speak('Opening your appointments.');
      setFeedback('Navigating to Appointments...');
      setTimeout(() => navigate('/elder/appointments'), 800);
    } else if (lower.includes('request') || lower.includes('volunteer')) {
      speak('Opening assistance requests.');
      setFeedback('Navigating to Assistance Requests...');
      setTimeout(() => navigate('/elder/requests'), 800);
    } else if (lower.includes('home') || lower.includes('dashboard')) {
      speak('Going to your dashboard.');
      setFeedback('Navigating to Dashboard...');
      setTimeout(() => navigate('/elder/dashboard'), 800);
    } else {
      speak("I heard: " + cmd + ". Try saying: 'Emergency SOS', 'My Medicines', 'Appointments', or 'Request Assistance'.");
      setFeedback("Unrecognized command. Try saying 'Emergency SOS' or 'My Medicines'.");
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback('Listening... Please speak now.');
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      processCommand(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsListening(false);
      setFeedback('Could not hear voice. Please try clicking again.');
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
              <h4 className="font-bold text-slate-800 text-sm">Voice Companion</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Speak commands like <strong>"Emergency SOS"</strong>, <strong>"My Medicines"</strong>, or <strong>"Doctor Appointment"</strong>.
          </p>

          <div className="bg-slate-50 p-3 rounded-xl mb-4 text-xs min-h-[50px] flex items-center justify-center text-center text-slate-700">
            {feedback || 'Click the microphone button to start speaking.'}
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
            speak('Voice assistant ready. How can I help you?');
          }
        }}
        title="Voice Assistant"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition hover:scale-105"
      >
        <Mic className="w-7 h-7" />
      </button>
    </div>
  );
};

export default VoiceAssistant;
