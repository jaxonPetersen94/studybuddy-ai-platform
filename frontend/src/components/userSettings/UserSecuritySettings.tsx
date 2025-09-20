import React, { JSX, useState } from 'react';
import { Settings, Eye, EyeOff, Info } from 'lucide-react';
import { PasswordState, PasswordField } from '../../types/authTypes';

interface UserSecuritySettingsProps {
  passwords: PasswordState;
  onPasswordChange: (passwords: PasswordState) => void;
}

const UserSecuritySettings: React.FC<UserSecuritySettingsProps> = ({
  passwords,
  onPasswordChange,
}) => {
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const handlePasswordChange = (field: PasswordField, value: string): void => {
    onPasswordChange({
      ...passwords,
      [field]: value,
    });
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

  const hasPasswordMismatch = (): boolean => {
    return Boolean(
      passwords.newPassword &&
        passwords.confirmPassword &&
        passwords.newPassword !== passwords.confirmPassword,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="alert alert-info">
              <Info className="w-4 h-4" />
              <span className="font-mono text-sm">
                Leave password fields empty if you don't want to change your
                password
              </span>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                Current_Password
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

          <div>
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                New_Password
              </span>
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
          </div>

          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                Confirm_New_Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handlePasswordChange('confirmPassword', e.target.value)
                }
                className="input input-bordered w-full font-mono pr-12"
                placeholder="••••••••"
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
        </div>
      </div>
    </div>
  );
};

export default UserSecuritySettings;
