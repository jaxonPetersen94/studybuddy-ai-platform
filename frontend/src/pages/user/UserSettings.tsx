import {
  Bell,
  Database,
  Lock,
  Palette,
  Save,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import UserAppearanceSettings from '../../components/userSettings/UserAppearanceSettings';
import UserProfileSettings from '../../components/userSettings/UserProfileSettings';
import UserSecuritySettings from '../../components/userSettings/UserSecuritySettings';
import { useThemeStore } from '../../stores/ThemeStore';
import { useUserStore } from '../../stores/UserStore';
import { PasswordState } from '../../types/authTypes';
import {
  AppearancePreferences,
  ThemeMode,
  User as UserProfile,
} from '../../types/userTypes';

const UserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const {
    user,
    updateProfile,
    changePassword,
    isLoading: userStoreLoading,
  } = useUserStore();

  const { themeMode, setThemeMode } = useThemeStore();

  // Local state to track pending theme changes
  const [pendingThemeMode, setPendingThemeMode] = useState<ThemeMode | null>(
    null,
  );

  const [passwords, setPasswords] = useState<PasswordState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Define the main settings sections
  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserIcon className="w-4 h-4" />,
      description: 'Personal info & learning level',
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Lock className="w-4 h-4" />,
      description: 'Password, 2FA, sessions, security notifications',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      description: 'Reminders, alerts, feedback notifications',
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="w-4 h-4" />,
      description: 'Theme, UI preferences, accessibility options',
    },
    {
      id: 'data',
      label: 'Data',
      icon: <Database className="w-4 h-4" />,
      description: 'Export, backup, reset, account management',
    },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'security') {
        // Handle password save if there are changes
        if (
          passwords.currentPassword &&
          passwords.newPassword &&
          passwords.confirmPassword
        ) {
          await handlePasswordSave(
            passwords.currentPassword,
            passwords.newPassword,
          );
        }
      } else if (activeTab === 'appearance' && pendingThemeMode !== null) {
        // Save pending theme changes to backend
        await handleThemeSave(pendingThemeMode);
      } else {
        // Add any additional save logic here for other tabs
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = async (
    newProfile: Partial<UserProfile>,
  ): Promise<void> => {
    try {
      await updateProfile(newProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Re-throw to let the child component handle it
      throw error;
    }
  };

  const handlePasswordChange = (newPasswords: PasswordState) => {
    setPasswords(newPasswords);
  };

  const handlePasswordSave = async (
    currentPassword: string,
    newPassword: string,
  ): Promise<void> => {
    try {
      await changePassword(currentPassword, newPassword);

      // Clear form on successful password change
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Error handling is done in the store with toast notifications
      console.error('Password change failed:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  const handlePasswordReset = (): void => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  // Handle immediate theme change for UI preview (no backend save)
  const handleThemeChange = (newThemeMode: ThemeMode) => {
    // Update theme immediately for UI preview
    setThemeMode(newThemeMode);
    // Track pending change for later save
    setPendingThemeMode(newThemeMode);
  };

  // Handle saving theme changes to backend
  const handleThemeSave = async (themeMode: ThemeMode) => {
    try {
      const updatedSettings: AppearancePreferences = {
        ...user?.preferences?.appearance,
        themeMode: themeMode,
      };

      await handleAppearanceSettingsChange(updatedSettings);

      // Clear pending changes after successful save
      setPendingThemeMode(null);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      throw error;
    }
  };

  const handleAppearanceSettingsChange = async (
    settings: AppearancePreferences,
  ): Promise<void> => {
    try {
      // Update the user profile with new appearance settings
      const updatedProfile: Partial<UserProfile> = {
        preferences: {
          ...user?.preferences,
          appearance: settings,
        },
      };

      await updateProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
      throw error;
    }
  };

  const getCurrentThemeMode = (): ThemeMode => {
    return themeMode;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <UserProfileSettings
            user={user}
            isLoading={userStoreLoading}
            onProfileChange={handleProfileChange}
          />
        );

      case 'security':
        return (
          <UserSecuritySettings
            passwords={passwords}
            onPasswordChange={handlePasswordChange}
            onPasswordSave={handlePasswordSave}
            onPasswordReset={handlePasswordReset}
            isLoading={userStoreLoading}
          />
        );

      case 'appearance':
        return (
          <UserAppearanceSettings
            isLoading={userStoreLoading}
            currentThemeMode={getCurrentThemeMode()}
            userAppearanceSettings={user?.preferences?.appearance}
            onThemeChange={handleThemeChange}
          />
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Notification_Preferences
                </h2>
              </div>
              <div className="card-body p-6">
                <p className="font-mono text-sm text-base-content/60">
                  // NotificationSettings component will be implemented here //
                  - Study reminders and scheduling alerts // - Achievement and
                  milestone celebrations // - AI tutor feedback notifications //
                  - Deadline and goal reminders // - Weekly progress reports //
                  - System updates and feature announcements // - Email vs push
                  notification preferences // - Quiet hours and do-not-disturb
                  settings
                </p>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Data_Management
                </h2>
              </div>
              <div className="card-body p-6">
                <p className="font-mono text-sm text-base-content/60">
                  // DataManagement component will be implemented here // -
                  Export all learning data and progress // - Export study
                  analytics and reports // - Export AI conversation history // -
                  Import/export settings and preferences // - Data backup and
                  restore // - Account data statistics and usage // - Reset
                  specific data types (progress, conversations, etc.) // -
                  Account deletion and data cleanup
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="font-mono text-sm text-base-content/60">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-base-content">
            StudyBuddy Settings
          </h1>
        </div>
        <p className="text-base-content/60 font-mono text-sm">
          // Configure your AI tutor and personalized learning experience
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg sticky top-6">
            <div className="card-body p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`btn w-full justify-start font-mono text-xs ${
                      activeTab === tab.id ? 'btn-primary' : 'btn-ghost'
                    }`}
                    title={tab.description}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn btn-primary font-mono text-xs"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  SAVING_CONFIGURATION...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SAVE_ALL_SETTINGS
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
