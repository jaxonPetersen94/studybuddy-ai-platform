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
import ChatSession from './pages/chat/ChatSession';
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
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* New chat creation page */}
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <NewChat />
              </ProtectedRoute>
            }
          />

          {/* Individual chat sessions */}
          <Route
            path="/chat/:sessionId"
            element={
              <ProtectedRoute>
                <ChatSession />
              </ProtectedRoute>
            }
          />

          {/* User settings */}
          <Route
            path="/user-settings"
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <ToastContainer toasts={toasts} position="top-center" />
    </div>
  );
}

export default App;
