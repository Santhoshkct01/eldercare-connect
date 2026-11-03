import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import VoiceAssistant from '../components/VoiceAssistant';

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <VoiceAssistant />
    </div>
  );
};

export default DashboardLayout;

