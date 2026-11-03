import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboards
import ElderDashboard from './dashboards/elder/ElderDashboard';
import ElderSOS from './dashboards/elder/ElderSOS';
import ElderMedicines from './dashboards/elder/ElderMedicines';
import ElderRequests from './dashboards/elder/ElderRequests';
import ElderWellness from './dashboards/elder/ElderWellness';

import FamilyDashboard from './dashboards/family/FamilyDashboard';
import VolunteerDashboard from './dashboards/volunteer/VolunteerDashboard';
import CaregiverDashboard from './dashboards/caregiver/CaregiverDashboard';
import AdminDashboard from './dashboards/admin/AdminDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
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

          {/* Elder Protected Routes */}
          <Route
            path="/elder/dashboard"
            element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/elder/sos"
            element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderSOS />
              </ProtectedRoute>
            }
          />
          <Route
            path="/elder/medicines"
            element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderMedicines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/elder/requests"
            element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/elder/wellness"
            element={
              <ProtectedRoute allowedRoles={['elder']}>
                <ElderWellness />
              </ProtectedRoute>
            }
          />

          {/* Family Protected Routes */}
          <Route
            path="/family/dashboard"
            element={
              <ProtectedRoute allowedRoles={['family']}>
                <FamilyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Protected Routes */}
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/requests"
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Caregiver Protected Routes */}
          <Route
            path="/caregiver/dashboard"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
