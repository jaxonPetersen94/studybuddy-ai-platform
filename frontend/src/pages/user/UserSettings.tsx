import React, { useState } from 'react';
import {
  User,
  Settings,
  Bell,
  Shield,
  Brain,
  Target,
  Key,
  Database,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Smartphone,
  Calendar,
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

interface NotificationSettings {
  studyReminders: boolean;
  achievementAlerts: boolean;
  weeklyReports: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

interface StudyPreferences {
  defaultSessionLength: number;
  breakReminders: boolean;
  autoStartBreaks: boolean;
  focusMode: boolean;
  backgroundSounds: boolean;
  dailyGoal: number;
}

const UserSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    avatar: 'AC',
    joinDate: '2024-01-15',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    studyReminders: true,
    achievementAlerts: true,
    weeklyReports: true,
    systemUpdates: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  const [studyPrefs, setStudyPrefs] = useState<StudyPreferences>({
    defaultSessionLength: 25,
    breakReminders: true,
    autoStartBreaks: false,
    focusMode: true,
    backgroundSounds: false,
    dailyGoal: 120,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
    },
    { id: 'study', label: 'Study_Prefs', icon: <Brain className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="card-body p-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-box flex items-center justify-center text-2xl font-bold text-primary-content">
                {userProfile.avatar}
              </div>
              <button className="absolute -bottom-1 -right-1 btn btn-xs btn-primary rounded-full">
                <Settings className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-base-content">
                {userProfile.name}
              </h3>
              <p className="text-base-content/60 font-mono text-sm">
                {userProfile.email}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-base-content/60" />
                  <span className="text-xs font-mono text-base-content/60">
                    Joined {new Date(userProfile.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
            Profile_Info
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Full_Name
                </span>
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, name: e.target.value })
                }
                className="input input-bordered w-full font-mono"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Email
                </span>
              </label>
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, email: e.target.value })
                }
                className="input input-bordered w-full font-mono"
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Current_Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered w-full font-mono pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  New_Password
                </span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
            Notification_Settings
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="space-y-6">
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-base-300/20 rounded-box border border-base-300/30"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-4 h-4 text-base-content/60" />
                  <div>
                    <div className="font-mono text-sm text-base-content">
                      {key.replace(/([A-Z])/g, '_$1').toUpperCase()}
                    </div>
                    <div className="text-xs text-base-content/60 font-mono">
                      {key === 'studyReminders' &&
                        'Get reminded to start study sessions'}
                      {key === 'achievementAlerts' &&
                        'Celebrate when you unlock achievements'}
                      {key === 'weeklyReports' &&
                        'Receive weekly progress summaries'}
                      {key === 'systemUpdates' &&
                        'Important app updates and features'}
                      {key === 'emailNotifications' &&
                        'Receive notifications via email'}
                      {key === 'pushNotifications' &&
                        'Browser and mobile push notifications'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      [key]: e.target.checked,
                    })
                  }
                  className="toggle toggle-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudyPreferences = () => (
    <div className="space-y-6">
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
            Study_Configuration
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Default_Session_Length
                </span>
              </label>
              <select
                value={studyPrefs.defaultSessionLength}
                onChange={(e) =>
                  setStudyPrefs({
                    ...studyPrefs,
                    defaultSessionLength: parseInt(e.target.value),
                  })
                }
                className="select select-bordered w-full font-mono"
              >
                <option value={15}>15 MINUTES</option>
                <option value={25}>25 MINUTES</option>
                <option value={45}>45 MINUTES</option>
                <option value={60}>60 MINUTES</option>
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Daily_Goal_Minutes
                </span>
              </label>
              <input
                type="number"
                value={studyPrefs.dailyGoal}
                onChange={(e) =>
                  setStudyPrefs({
                    ...studyPrefs,
                    dailyGoal: parseInt(e.target.value),
                  })
                }
                className="input input-bordered w-full font-mono"
                min="30"
                max="480"
              />
            </div>
          </div>

          <div className="divider font-mono text-xs">AUTOMATION_SETTINGS</div>

          <div className="space-y-4">
            {[
              {
                key: 'breakReminders',
                label: 'Break_Reminders',
                desc: "Get notified when it's time for a break",
              },
              {
                key: 'autoStartBreaks',
                label: 'Auto_Start_Breaks',
                desc: 'Automatically start break timers',
              },
              {
                key: 'focusMode',
                label: 'Focus_Mode',
                desc: 'Block distracting websites during study',
              },
              {
                key: 'backgroundSounds',
                label: 'Background_Sounds',
                desc: 'Play ambient sounds while studying',
              },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-base-300/20 rounded-box border border-base-300/30"
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-4 h-4 text-base-content/60" />
                  <div>
                    <div className="font-mono text-sm text-base-content">
                      {label}
                    </div>
                    <div className="text-xs text-base-content/60 font-mono">
                      {desc}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={studyPrefs[key as keyof StudyPreferences] as boolean}
                  onChange={(e) =>
                    setStudyPrefs({ ...studyPrefs, [key]: e.target.checked })
                  }
                  className="toggle toggle-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
            Privacy_&_Security
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="space-y-4">
            <div className="alert alert-info">
              <Shield className="w-4 h-4" />
              <span className="font-mono text-sm">
                Your data is encrypted and stored securely. We never share
                personal information with third parties.
              </span>
            </div>

            <div className="space-y-4">
              <button className="btn btn-outline w-full font-mono text-xs justify-start">
                <Key className="w-4 h-4" />
                Enable_Two_Factor_Authentication
              </button>
              <button className="btn btn-outline w-full font-mono text-xs justify-start">
                <Globe className="w-4 h-4" />
                Manage_Connected_Apps
              </button>
              <button className="btn btn-outline w-full font-mono text-xs justify-start">
                <Smartphone className="w-4 h-4" />
                Active_Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderData = () => (
    <div className="space-y-6">
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
            Data_Management
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="btn btn-primary font-mono text-xs">
                <Database className="w-4 h-4" />
                Export_All_Data
              </button>
              <button className="btn btn-outline font-mono text-xs">
                <RefreshCw className="w-4 h-4" />
                Backup_Settings
              </button>
            </div>

            <div className="divider font-mono text-xs">DANGER_ZONE</div>

            <div className="space-y-3">
              <button className="btn btn-error btn-outline w-full font-mono text-xs">
                <Trash2 className="w-4 h-4" />
                Clear_All_Study_Data
              </button>
              <button className="btn btn-error w-full font-mono text-xs">
                <Trash2 className="w-4 h-4" />
                Delete_Account_Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-base-content">
            User Settings
          </h1>
        </div>
        <p className="text-base-content/60 font-mono text-sm">
          // Configure your StudyBuddy AI experience
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
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'study' && renderStudyPreferences()}
          {activeTab === 'privacy' && renderPrivacy()}
          {activeTab === 'data' && renderData()}

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
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SAVE_CHANGES
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
