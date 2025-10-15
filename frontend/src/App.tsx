import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Background from './components/layout/Background';
import Header from './components/layout/Header';
import ErrorBoundary from './components/security/ErrorBoundary';
import ProtectedRoute from './components/security/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';
import { useOAuthHandler } from './hooks/useOAuthHandler';
import AuthForm from './pages/auth/AuthForm';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ChatSession from './pages/chat/ChatSession';
import NewChat from './pages/chat/NewChat';
import Dashboard from './pages/dashboard/Dashboard';
import NewFlashCards from './pages/flashCards/NewFlashCards';
import FlashCardsSession from './pages/flashCards/FlashCardsSession';
import Podcast from './pages/podcast/Podcast';
import Presentation from './pages/presentation/Presentation';
import Quiz from './pages/quiz/Quiz';
import UserSettings from './pages/user/UserSettings';
import { useThemeStore } from './stores/ThemeStore';
import { useToastStore } from './stores/ToastStore';
import { useUserStore } from './stores/UserStore';

const HomeRoute = () => {
  const { isAuthenticated } = useUserStore();

  useOAuthHandler();

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/auth" replace />
  );
};

function App() {
  const { isAuthenticated } = useUserStore();
  const { toasts } = useToastStore();
  const currentTheme = useThemeStore((state) => state.currentTheme);

  return (
    <div className="App relative min-h-screen" data-theme={currentTheme}>
      <Background />

      {isAuthenticated && (
        <div className="sticky top-0 z-50">
          <Header />
        </div>
      )}

      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* FlashCards Routes */}
          <Route
            path="/new-flashcards"
            element={
              <ProtectedRoute>
                <NewFlashCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards/:sessionId"
            element={
              <ProtectedRoute>
                <FlashCardsSession />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />

          <Route
            path="/new-chat"
            element={
              <ProtectedRoute>
                <NewChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:sessionId"
            element={
              <ProtectedRoute>
                <ChatSession />
              </ProtectedRoute>
            }
          />

          <Route
            path="/presentation"
            element={
              <ProtectedRoute>
                <Presentation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/podcast"
            element={
              <ProtectedRoute>
                <Podcast />
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

      <ToastContainer toasts={toasts} position="top-center" />
    </div>
  );
}

export default App;
