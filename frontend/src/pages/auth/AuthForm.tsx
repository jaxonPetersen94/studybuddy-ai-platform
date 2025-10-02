import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Github,
  Zap,
  Shield,
  Globe,
  User,
} from 'lucide-react';
import { useUserStore } from '../../stores/UserStore';
import { useToastStore } from '../../stores/ToastStore';
import TerminalCard from '../../components/ui/TerminalCard';
import AuthHeader from '../../components/auth/AuthHeader';
import {
  isValidEmail,
  isValidPassword,
  getPasswordStrength,
  validateLoginForm,
  validateRegistrationForm,
  passwordsMatch,
  isValidName,
} from '../../utils/validation';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailError, setEmailError] = useState('');

  const { login, register, isLoading, error, clearError, handleOAuthSuccess } =
    useUserStore();
  const { error: showErrorToast } = useToastStore();

  // Handle OAuth success callback
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (token) {
      handleOAuthSuccess(token);
      navigate('/dashboard');
    } else if (oauthError) {
      showErrorToast('OAuth authentication failed. Please try again.', {
        title: 'Authentication Error',
        duration: 5000,
      });
      // Clean up the URL
      navigate('/auth', { replace: true });
    }
  }, [location, handleOAuthSuccess, navigate, showErrorToast]);

  const handleSubmit = async () => {
    clearError();
    setEmailError('');

    if (!email || !password) return;

    if (!isValidEmail(email)) {
      setEmailError('INVALID_EMAIL_FORMAT');
      return;
    }

    if (!isLogin) {
      if (!isValidName(firstName) || !isValidName(lastName)) return;
      if (!passwordsMatch(password, confirmPassword)) return;
      if (!isValidPassword(password)) return;
    }

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    window.location.href = `${backendUrl}/api/v1/users/auth/${provider}`;
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setEmailError('');
    clearError();
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const isFormValid = () => {
    if (isLogin) {
      return validateLoginForm(email, password);
    }
    return validateRegistrationForm({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <AuthHeader />

          <TerminalCard title="auth.terminal">
            {error && (
              <div className="alert alert-error mb-4">
                <div className="flex-1">
                  <span className="font-mono text-xs">{error}</span>
                </div>
              </div>
            )}

            <div className="tabs tabs-boxed bg-base-300/30 mb-6">
              <button
                onClick={() => isLogin || toggleMode()}
                className={`tab flex-1 font-mono text-sm ${
                  isLogin
                    ? 'tab-active bg-primary/20 text-primary border border-primary/30'
                    : 'text-base-content/60 hover:text-base-content/80'
                }`}
              >
                LOGIN
              </button>
              <button
                onClick={() => !isLogin || toggleMode()}
                className={`tab flex-1 font-mono text-sm ${
                  !isLogin
                    ? 'tab-active bg-primary/20 text-primary border border-primary/30'
                    : 'text-base-content/60 hover:text-base-content/80'
                }`}
              >
                REGISTER
              </button>
            </div>

            <div className="space-y-4 select-none">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                        First Name
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-base-content/40" />
                      </div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="input input-bordered w-full pl-10 bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 focus:border-primary/50 focus:bg-base-300/50 font-mono text-sm"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                        Last Name
                      </span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="input input-bordered w-full bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 focus:border-primary/50 focus:bg-base-300/50 font-mono text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs uppercase tracking-wide text-base-content/60">
                    Email Address
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-base-content/40 peer-focus:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@domain.com"
                    className="input input-bordered w-full pl-10 bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 focus:border-primary/50 focus:bg-base-300/50 font-mono text-sm peer"
                    required
                    disabled={isLoading}
                  />
                </div>
                {emailError && (
                  <div className="text-error text-xs mt-1 font-mono">
                    {emailError}
                  </div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                    Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-base-content/40 peer-focus:text-primary transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input input-bordered w-full pl-10 pr-12 bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 focus:border-primary/50 focus:bg-base-300/50 font-mono text-sm peer"
                    required
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/40 hover:text-primary transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {!isLogin && password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-base-content/60">
                        PASSWORD_STRENGTH
                      </span>
                      <span
                        className={`text-xs font-mono text-${
                          getPasswordStrength(password).color
                        } capitalize`}
                      >
                        {getPasswordStrength(password).strength}
                      </span>
                    </div>
                    <progress
                      className={`progress progress-${
                        getPasswordStrength(password).color
                      } w-full h-1`}
                      value={
                        password.length < 6
                          ? 33
                          : password.length < 8
                          ? 66
                          : 100
                      }
                      max="100"
                    ></progress>
                    {!isValidPassword(password) && password.length > 0 && (
                      <div className="text-warning text-xs mt-1 font-mono">
                        MIN_8_CHARS_WITH_LETTER_AND_NUMBER
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isLogin && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-mono text-xs uppercase tracking-wide text-base-content/60">
                      Confirm Password
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-base-content/40 peer-focus:text-primary transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input input-bordered w-full pl-10 bg-base-300/30 border-base-300/50 text-base-content placeholder-base-content/40 focus:border-primary/50 focus:bg-base-300/50 font-mono text-sm peer"
                      required
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                  </div>
                </div>
              )}

              {!isLogin &&
                confirmPassword &&
                !passwordsMatch(password, confirmPassword) && (
                  <div className="alert alert-warning">
                    <span className="font-mono text-xs">
                      PASSWORDS_DO_NOT_MATCH
                    </span>
                  </div>
                )}

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="link link-primary font-mono text-xs uppercase tracking-wide opacity-60 hover:opacity-100"
                    disabled={isLoading}
                  >
                    FORGOT_PASSWORD?
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading || !isFormValid()}
                className="btn btn-primary w-full mt-6 font-mono text-sm uppercase tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 border border-primary/30"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>PROCESSING...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>{isLogin ? 'AUTHENTICATE' : 'CREATE_ACCOUNT'}</span>
                  </div>
                )}
              </button>
            </div>

            <div className="divider font-mono text-xs text-base-content/40">
              OR_CONTINUE_WITH
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="btn btn-outline btn-neutral font-mono text-xs"
                disabled={isLoading}
              >
                <Globe className="w-4 h-4" />
                GOOGLE
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                className="btn btn-outline btn-neutral font-mono text-xs"
                disabled={isLoading}
              >
                <Github className="h-4 w-4" />
                GITHUB
              </button>
            </div>

            {!isLogin && (
              <p className="text-center text-xs text-base-content/40 mt-6 font-mono">
                BY_REGISTERING_YOU_ACCEPT_OUR{' '}
                <button className="link link-primary">TERMS</button> AND{' '}
                <button className="link link-primary">PRIVACY_POLICY</button>
              </p>
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

export default AuthForm;
