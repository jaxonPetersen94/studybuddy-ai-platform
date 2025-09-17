import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/security/ErrorBoundary';
import ProtectedRoute from './components/security/ProtectedRoute';
import Background from './components/layout/Background';
import Header from './components/layout/Header';
import { useOAuthHandler } from './hooks/useOAuthHandler';
import AuthForm from './pages/auth/AuthForm';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NewChat from './pages/chat/NewChat';
import UserSettings from './pages/user/UserSettings';
import { useUserStore } from './stores/UserStore';
import { useToastStore } from './stores/ToastStore';
import { ToastContainer } from './components/ui/Toast';

const HomeRoute = () => {
  const { isAuthenticated } = useUserStore();

  useOAuthHandler();

  return isAuthenticated ? (
    <Navigate to="/new" replace />
  ) : (
    <Navigate to="/auth" replace />
  );
};

function App() {
  const { isAuthenticated } = useUserStore();
  const { toasts } = useToastStore();

  return (
    <div className="App relative min-h-screen" data-theme="StudyBuddy-Dark">
      <Background />

      {/* Header */}
      {isAuthenticated && (
        <div className="relative z-50">
          <Header />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Password reset route (not protected) */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Changed from /dashboard to /new */}
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <NewChat />
              </ProtectedRoute>
            }
          />

          {/* Keep /dashboard route for backward compatibility (optional) */}
          <Route path="/dashboard" element={<Navigate to="/new" replace />} />

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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} position="top-center" />
    </div>
  );
}

export default App;
