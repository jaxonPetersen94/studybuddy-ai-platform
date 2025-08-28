import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import TerminalCard from '../../components/layout/TerminalCard';
import { authService } from '../../services/authService';
import AuthHeader from '../../components/layout/AuthHeader';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!token) {
      setError('Invalid or missing token.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <AuthHeader subtitle="// Reset Your Password" />

          <TerminalCard title="password_reset.terminal">
            {!success ? (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-base-content mb-2 font-mono">
                    SET_NEW_PASSWORD
                  </h2>
                  <p className="text-base-content/60 text-sm font-mono leading-relaxed">
                    ENTER_YOUR_NEW_PASSWORD_AND_CONFIRM_TO_RESET
                  </p>
                </div>

                {/* Password Fields */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                      New Password
                    </span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="********"
                    className="input input-bordered w-full bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 font-mono text-sm"
                  />
                </div>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                      Confirm Password
                    </span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="input input-bordered w-full bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 font-mono text-sm"
                  />
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
                  disabled={loading || !newPassword || !confirmPassword}
                  className="btn btn-primary w-full mb-4 font-mono text-sm uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:opacity-50"
                >
                  {loading ? 'RESETTING...' : 'RESET_PASSWORD'}
                </button>

                {/* Back to Login */}
                <button
                  onClick={handleBackToLogin}
                  className="btn btn-ghost w-full font-mono text-sm uppercase tracking-wide text-base-content/60 hover:text-base-content"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>BACK_TO_LOGIN</span>
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-success/10 border-2 border-success/30 rounded-box">
                    <CheckCircle className="text-2xl text-success" />
                  </div>
                  <h2 className="text-xl font-bold text-base-content mb-2 font-mono">
                    PASSWORD_RESET_SUCCESS
                  </h2>
                  <p className="text-base-content/60 text-sm font-mono leading-relaxed mb-2">
                    YOUR_PASSWORD_HAS_BEEN_SUCCESSFULLY_UPDATED
                  </p>
                </div>

                <button
                  onClick={handleBackToLogin}
                  className="btn btn-primary w-full font-mono text-sm uppercase tracking-wide"
                >
                  BACK_TO_LOGIN
                </button>
              </>
            )}
          </TerminalCard>

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

export default ResetPassword;
