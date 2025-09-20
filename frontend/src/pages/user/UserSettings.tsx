import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Database,
  Save,
  Palette,
  Lock,
} from 'lucide-react';
import UserProfileSettings from '../../components/userSettings/UserProfileSettings';
import UserSecuritySettings from '../../components/userSettings/UserSecuritySettings';
import { UserProfile } from '../../types/userTypes';
import { PasswordState } from '../../types/authTypes';

const UserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Mock user profile data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    avatar: 'AC',
    joinDate: '2024-01-15',
    learningLevel: 'intermediate',
    preferredSubjects: ['programming', 'mathematics'],
    timezone: 'America/New_York',
    location: 'New York, NY',
    bio: 'Software developer passionate about learning new technologies and improving problem-solving skills.',
    studyGoal: 'Professional Development',
  });

  // Separate password state for security settings
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
      icon: <User className="w-4 h-4" />,
      description: 'Personal info, learning level, preferred subjects',
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleProfileChange = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
  };

  const handlePasswordChange = (newPasswords: PasswordState) => {
    setPasswords(newPasswords);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <UserProfileSettings
            profile={userProfile}
            onProfileChange={handleProfileChange}
          />
        );

      case 'security':
        return (
          <UserSecuritySettings
            passwords={passwords}
            onPasswordChange={handlePasswordChange}
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

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Appearance_&_Accessibility
                </h2>
              </div>
              <div className="card-body p-6">
                <p className="font-mono text-sm text-base-content/60">
                  // AppearanceSettings component will be implemented here // -
                  Theme selection (light, dark, auto, custom themes) // - Color
                  scheme and accent colors // - Font size and typography
                  preferences // - Interface density (compact, comfortable,
                  spacious) // - Animation and motion preferences // -
                  Accessibility features (high contrast, screen reader support)
                  // - Language and localization settings // - Layout
                  preferences (sidebar position, card styles)
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
