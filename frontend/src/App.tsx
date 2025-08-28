import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/UserStore';
import ProtectedRoute from './components/guards/ProtectedRoute';
import ErrorBoundary from './components/guards/ErrorBoundary';
import Dashboard from './pages/dashboard/Dashboard';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Background from './components/layout/Background';
import Header from './components/layout/header/Header';
import AuthForm from './pages/auth/AuthForm';
import UserSettings from './pages/user/UserSettings';

const HomeRoute = () => {
  const { isAuthenticated } = useUserStore();
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  const { isAuthenticated } = useUserStore();

  return (
    <div className="App relative min-h-screen" data-theme="StudyBuddy-Dark">
      <Background />

      {/* Header */}
      {isAuthenticated && (
        <div className="relative z-50 p-6 pb-0">
          <Header />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<AuthForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Password reset route (not protected) */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-settings"
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<ErrorBoundary />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
