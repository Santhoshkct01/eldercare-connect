import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CommunityEvents from './pages/CommunityEvents';

// Elder Views
import ElderDashboard from './dashboards/elder/ElderDashboard';
import ElderSOS from './dashboards/elder/ElderSOS';
import ElderMedicines from './dashboards/elder/ElderMedicines';
import ElderRequests from './dashboards/elder/ElderRequests';
import ElderWellness from './dashboards/elder/ElderWellness';
import ElderAppointments from './dashboards/elder/ElderAppointments';
import ElderLocation from './dashboards/elder/ElderLocation';
import ElderDocuments from './dashboards/elder/ElderDocuments';

// Family Views
import FamilyDashboard from './dashboards/family/FamilyDashboard';
import FamilyLocation from './dashboards/family/FamilyLocation';
import FamilyMedicines from './dashboards/family/FamilyMedicines';
import FamilyWellness from './dashboards/elder/ElderWellness';
import FamilySOS from './dashboards/family/FamilySOS';
import FamilyRequests from './dashboards/family/FamilyRequests';

// Volunteer Views
import VolunteerDashboard from './dashboards/volunteer/VolunteerDashboard';
import VolunteerSOS from './dashboards/volunteer/VolunteerSOS';
import VolunteerHistory from './dashboards/volunteer/VolunteerHistory';


// Admin Views
import AdminDashboard from './dashboards/admin/AdminDashboard';
import AdminUsers from './dashboards/admin/AdminUsers';
import AdminVolunteers from './dashboards/admin/AdminVolunteers';
import AdminSOS from './dashboards/admin/AdminSOS';
import AdminRequests from './dashboards/admin/AdminRequests';

// Robust Protected Route with Loading & Role Validation
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve intended destination after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">
          <h2 className="text-xl font-black text-slate-900 mb-2">Access Denied (403)</h2>
          <p className="text-xs text-slate-500 mb-6">
            Your current account role (<strong>{user.role}</strong>) does not have permission to view this page.
          </p>
          <a
            href={`/${user.role}/dashboard`}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow"
          >
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<HomePage />} />
          <Route path="/services" element={<HomePage />} />
          <Route path="/contact" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/community" element={<CommunityEvents />} />

          {/* Elder Protected Routes */}
          <Route path="/elder/dashboard" element={<ProtectedRoute allowedRoles={['elder']}><ElderDashboard /></ProtectedRoute>} />
          <Route path="/elder/sos" element={<ProtectedRoute allowedRoles={['elder']}><ElderSOS /></ProtectedRoute>} />
          <Route path="/elder/medicines" element={<ProtectedRoute allowedRoles={['elder']}><ElderMedicines /></ProtectedRoute>} />
          <Route path="/elder/requests" element={<ProtectedRoute allowedRoles={['elder']}><ElderRequests /></ProtectedRoute>} />
          <Route path="/elder/wellness" element={<ProtectedRoute allowedRoles={['elder']}><ElderWellness /></ProtectedRoute>} />
          <Route path="/elder/appointments" element={<ProtectedRoute allowedRoles={['elder']}><ElderAppointments /></ProtectedRoute>} />
          <Route path="/elder/location" element={<ProtectedRoute allowedRoles={['elder']}><ElderLocation /></ProtectedRoute>} />
          <Route path="/elder/documents" element={<ProtectedRoute allowedRoles={['elder']}><ElderDocuments /></ProtectedRoute>} />

          {/* Family Protected Routes */}
          <Route path="/family/dashboard" element={<ProtectedRoute allowedRoles={['family']}><FamilyDashboard /></ProtectedRoute>} />
          <Route path="/family/location" element={<ProtectedRoute allowedRoles={['family']}><FamilyLocation /></ProtectedRoute>} />
          <Route path="/family/medicines" element={<ProtectedRoute allowedRoles={['family']}><FamilyMedicines /></ProtectedRoute>} />
          <Route path="/family/wellness" element={<ProtectedRoute allowedRoles={['family']}><FamilyWellness /></ProtectedRoute>} />
          <Route path="/family/sos" element={<ProtectedRoute allowedRoles={['family']}><FamilySOS /></ProtectedRoute>} />
          <Route path="/family/requests" element={<ProtectedRoute allowedRoles={['family']}><FamilyRequests /></ProtectedRoute>} />

          {/* Volunteer Protected Routes */}
          <Route path="/volunteer/dashboard" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/volunteer/requests" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/volunteer/sos" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerSOS /></ProtectedRoute>} />
          <Route path="/volunteer/history" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerHistory /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/volunteers" element={<ProtectedRoute allowedRoles={['admin']}><AdminVolunteers /></ProtectedRoute>} />
          <Route path="/admin/sos" element={<ProtectedRoute allowedRoles={['admin']}><AdminSOS /></ProtectedRoute>} />
          <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequests /></ProtectedRoute>} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
