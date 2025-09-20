import React, { JSX, useState } from 'react';
import { Settings, Eye, EyeOff, Info } from 'lucide-react';
import { useUserStore } from '../../stores/UserStore';
import { PasswordState, PasswordField } from '../../types/authTypes';
import {
  getPasswordStrength,
  isValidPassword,
  passwordsMatch,
  checkPasswordRequirements,
} from '../../utils/validation';

const UserSecuritySettings: React.FC = () => {
  const { changePassword, isLoading } = useUserStore();

  const [passwords, setPasswords] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handlePasswordChange = (field: PasswordField, value: string): void => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSavePassword = async (): Promise<void> => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return;
    }

    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);

      // Clear form on successful password change
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setHasChanges(false);
    } catch (error) {
      // Error handling is done in the store with toast notifications
      console.error('Password change failed:', error);
    }
  };

  const handleResetForm = (): void => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setHasChanges(false);
  };

  const togglePasswordVisibility = (
    field: 'current' | 'new' | 'confirm',
  ): void => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  const renderPasswordVisibilityIcon = (isVisible: boolean): JSX.Element =>
    isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />;

  const isFormValid = (): boolean => {
    return Boolean(
      passwords.currentPassword &&
        passwords.newPassword &&
        passwords.confirmPassword &&
        isValidPassword(passwords.newPassword) &&
        passwordsMatch(passwords.newPassword, passwords.confirmPassword),
    );
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);
  const passwordRequirements = checkPasswordRequirements(passwords.newPassword);

  const hasPasswordMismatch = (): boolean => {
    return Boolean(
      passwords.newPassword &&
        passwords.confirmPassword &&
        !passwordsMatch(passwords.newPassword, passwords.confirmPassword),
    );
  };

  return (
    <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
      <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
        <h2 className="font-mono text-sm uppercase tracking-wide text-base-content flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Password_&_Security</span>
        </h2>
      </div>
      <div className="card-body p-6">
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                Current_Password *
              </span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handlePasswordChange('currentPassword', e.target.value)
                }
                className="input input-bordered w-full font-mono pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content"
                aria-label={
                  showCurrentPassword
                    ? 'Hide current password'
                    : 'Show current password'
                }
              >
                {renderPasswordVisibilityIcon(showCurrentPassword)}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                New_Password *
              </span>
              {passwordStrength.strength && (
                <span
                  className={`label-text-alt font-mono text-xs text-${passwordStrength.color}`}
                >
                  {passwordStrength.strength.toUpperCase()}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handlePasswordChange('newPassword', e.target.value)
                }
                className="input input-bordered w-full font-mono pr-12"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content"
                aria-label={
                  showNewPassword ? 'Hide new password' : 'Show new password'
                }
              >
                {renderPasswordVisibilityIcon(showNewPassword)}
              </button>
            </div>
            {passwords.newPassword &&
              !isValidPassword(passwords.newPassword) && (
                <div className="text-error text-xs font-mono mt-1">
                  Password must be at least 8 characters with letters and
                  numbers
                </div>
              )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                Confirm_New_Password *
              </span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handlePasswordChange('confirmPassword', e.target.value)
                }
                className={`input input-bordered w-full font-mono pr-12 ${
                  hasPasswordMismatch() ? 'input-error' : ''
                }`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content"
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {renderPasswordVisibilityIcon(showConfirmPassword)}
              </button>
            </div>
            {hasPasswordMismatch() && (
              <div className="text-error text-xs font-mono mt-1">
                Passwords do not match
              </div>
            )}
          </div>

          {/* Password Requirements */}
          <div>
            <div className="bg-base-300/20 rounded-lg p-4">
              <h4 className="font-mono text-xs uppercase tracking-wide text-base-content/80 mb-2">
                Password_Requirements:
              </h4>
              <ul className="space-y-1 text-xs font-mono text-base-content/60">
                {passwordRequirements.map((requirement) => (
                  <li
                    key={requirement.id}
                    className={requirement.isMet ? 'text-success' : ''}
                  >
                    • {requirement.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-base-300/50">
              <button
                onClick={handleSavePassword}
                disabled={!isFormValid() || isLoading}
                className="btn btn-primary font-mono flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    CHANGING_PASSWORD...
                  </>
                ) : (
                  'CHANGE_PASSWORD'
                )}
              </button>
              <button
                onClick={handleResetForm}
                disabled={isLoading}
                className="btn btn-ghost font-mono flex-1 sm:flex-none"
              >
                RESET_FORM
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSecuritySettings;
