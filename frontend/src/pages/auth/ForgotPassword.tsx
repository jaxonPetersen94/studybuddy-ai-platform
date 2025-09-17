import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import TerminalCard from '../../components/ui/TerminalCard';
import { authService } from '../../services/authService';
import AuthHeader from '../../components/auth/AuthHeader';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword({ email });
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError(null);
    setResendCooldown(30);

    try {
      await authService.forgotPassword({ email });
      console.log('Resent password reset email to:', email);
    } catch (err: any) {
      console.error('Resend failed:', err);
      setError(err.message || 'Failed to resend email. Please try again.');
      setResendCooldown(0);
    } finally {
      setLoading(false);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  const resetForm = () => {
    setEmail('');
    setEmailSent(false);
    setResendCooldown(0);
    setError(null);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <AuthHeader subtitle="// Password Recovery System" />

          {/* Main TerminalCard */}
          <TerminalCard title="password_recovery.terminal">
            {!emailSent ? (
              <>
                {/* Header Text */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-base-content mb-2 font-mono">
                    RESET_PASSWORD
                  </h2>
                  <p className="text-base-content/60 text-sm font-mono leading-relaxed">
                    ENTER_YOUR_EMAIL_ADDRESS_&
                    RECIEVE_A_LINK_TO_RESET_YOUR_PASSWORD
                  </p>
                </div>

                {/* Email Field */}
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                      Email Address
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-base-content/40 peer-focus:text-primary transition-colors" />
                    </div>
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@domain.com"
                      className="input input-bordered w-full pl-10 bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 focus:border-primary/50 focus:bg-base-300/50 font-mono text-sm peer"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-error mb-4 bg-error/10 border-error/20 text-error text-sm font-mono">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="btn btn-primary w-full mb-4 font-mono text-sm uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 border border-primary/30 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      <span>SENDING...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>SEND_RESET_LINK</span>
                    </div>
                  )}
                </button>

                {/* Back to Login */}
                <button
                  onClick={handleBackToAuth}
                  className="btn btn-ghost w-full font-mono text-sm uppercase tracking-wide text-base-content/60 hover:text-base-content"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>BACK_TO_LOGIN</span>
                </button>
              </>
            ) : (
              <>
                {/* Success Icon */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-success/10 border-2 border-success/30 rounded-box">
                    <CheckCircle className="text-2xl text-success" />
                  </div>
                  <h2 className="text-xl font-bold text-base-content mb-2 font-mono">
                    EMAIL_SENT
                  </h2>
                  <p className="text-base-content/60 text-sm font-mono leading-relaxed mb-2">
                    PASSWORD_RESET_INSTRUCTIONS_HAVE_BEEN_SENT_TO:
                  </p>
                  <p className="text-primary font-mono text-sm font-semibold break-all">
                    {email}
                  </p>
                </div>

                {/* Instructions */}
                <div className="alert alert-info mb-6 bg-info/10 border-info/20">
                  <div className="text-sm font-mono text-base-content/80 space-y-1">
                    <p>→ CHECK_YOUR_EMAIL_INBOX</p>
                    <p>→ CLICK_THE_RESET_LINK</p>
                    <p>→ CREATE_YOUR_NEW_PASSWORD</p>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-error mb-4 bg-error/10 border-error/20 text-error text-sm font-mono">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Resend Button */}
                  <button
                    onClick={handleResend}
                    disabled={loading || resendCooldown > 0}
                    className="btn btn-outline btn-primary w-full font-mono text-sm uppercase tracking-wide disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <span className="loading loading-spinner loading-sm"></span>
                        <span>SENDING...</span>
                      </div>
                    ) : resendCooldown > 0 ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4" />
                        <span>RESEND_IN_{resendCooldown}s</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4" />
                        <span>RESEND_EMAIL</span>
                      </div>
                    )}
                  </button>

                  {/* Back to Login */}
                  <button
                    onClick={handleBackToAuth}
                    className="btn btn-ghost w-full font-mono text-sm uppercase tracking-wide text-base-content/60 hover:text-base-content"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>BACK_TO_LOGIN</span>
                  </button>

                  {/* Try Different Email */}
                  <button
                    onClick={resetForm}
                    className="btn btn-ghost w-full font-mono text-xs uppercase tracking-wide text-base-content/40 hover:text-base-content/60"
                  >
                    TRY_DIFFERENT_EMAIL
                  </button>
                </div>
              </>
            )}
          </TerminalCard>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-base-content/40 font-mono">
              DEMO_PROJECT_BY_JAXON_RAY_PETERSEN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
