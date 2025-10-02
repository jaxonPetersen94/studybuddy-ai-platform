import React, { useState, useEffect } from 'react';
import { User, Calendar, Globe, Camera, ChevronUp } from 'lucide-react';
import { User as UserType } from '../../types/userTypes';

interface UserProfileSettingsProps {
  user: UserType | null;
  isLoading: boolean;
  onProfileChange: (newProfile: Partial<UserType>) => Promise<void>;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  user,
  isLoading,
  onProfileChange,
}) => {
  const [localProfile, setLocalProfile] = useState<Partial<UserType>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local profile state when user data loads
  useEffect(() => {
    if (user) {
      setLocalProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'America/New_York',
        learningLevel: user.learningLevel || 'beginner',
        studyGoal: user.studyGoal || '',
        avatar: user.avatar || '',
      });
      setHasChanges(false);
    }
  }, [user]);

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { value: 'Europe/London', label: 'GMT (London)' },
    { value: 'Europe/Paris', label: 'CET (Paris)' },
    { value: 'Europe/Berlin', label: 'CET (Berlin)' },
    { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
    { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
    { value: 'Asia/Kolkata', label: 'IST (India)' },
    { value: 'Australia/Sydney', label: 'AEST (Sydney)' },
  ];

  const studyGoals = [
    'Academic Excellence',
    'Professional Development',
    'Career Change',
    'Personal Enrichment',
    'Certification/Exam Prep',
    'Skill Building',
    'Hobby Learning',
  ];

  const handleInputChange = (field: keyof UserType, value: any) => {
    const updatedProfile = {
      ...localProfile,
      [field]: value,
    };

    setLocalProfile(updatedProfile);
    setHasChanges(true);
  };

  const handleResetChanges = () => {
    if (user) {
      const resetProfile = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || 'America/New_York',
        learningLevel: user.learningLevel || 'beginner',
        studyGoal: user.studyGoal || '',
        avatar: user.avatar || '',
      };

      setLocalProfile(resetProfile);
      setHasChanges(false);
    }
  };

  const getLearningLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'badge-success';
      case 'intermediate':
        return 'badge-warning';
      case 'advanced':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  const getDisplayName = () => {
    const firstName = localProfile.firstName || user?.firstName || '';
    const lastName = localProfile.lastName || user?.lastName || '';
    return firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || 'Your Name';
  };

  const getInitials = () => {
    const firstName = localProfile.firstName || user?.firstName || '';
    const lastName = localProfile.lastName || user?.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial || 'YN';
  };

  const handleAvatarUpload = () => {
    // Placeholder for avatar upload functionality
    // You'll need to implement file upload logic here
    console.log('Avatar upload clicked - implement file upload logic');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="font-mono text-sm text-base-content/60">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="card-body p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleAvatarUpload}
                className="relative group w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-box flex items-center justify-center text-2xl font-bold text-primary-content shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                {localProfile.avatar || user.avatar || getInitials()}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-box transition-all duration-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                <h3 className="text-xl font-bold text-base-content">
                  {getDisplayName()}
                </h3>
              </div>

              <p className="text-base-content/60 font-mono text-sm mb-2">
                {localProfile.email || user.email || 'your.email@example.com'}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs font-mono text-base-content/60">
                <div className="flex items-center justify-center sm:justify-start space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Joined{' '}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Recently'}
                  </span>
                </div>
                {(localProfile.location || user.location) && (
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>{localProfile.location || user.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Level Badge with Chevron - Right Aligned */}
            <div className="flex flex-col items-center justify-between self-stretch">
              <ChevronUp
                size={48}
                className="text-yellow-500 flex-shrink-0"
                strokeWidth={2.5}
              />
              <div
                className={`badge ${getLearningLevelColor(
                  localProfile.learningLevel ||
                    user.learningLevel ||
                    'beginner',
                )} font-mono text-xs`}
              >
                {(
                  localProfile.learningLevel ||
                  user.learningLevel ||
                  'beginner'
                ).toUpperCase()}
                _LEARNER
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Personal_Information</span>
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  First_Name *
                </span>
              </label>
              <input
                type="text"
                value={localProfile.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Last_Name *
                </span>
              </label>
              <input
                type="text"
                value={localProfile.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="Enter your last name"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Email_Address *
                </span>
              </label>
              <input
                type="email"
                value={localProfile.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Timezone
                </span>
              </label>
              <select
                value={localProfile.timezone || 'America/New_York'}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="select select-bordered w-full font-mono"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Location (Optional)
                </span>
              </label>
              <input
                type="text"
                value={localProfile.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Phone_Number (Optional)
                </span>
              </label>
              <input
                type="tel"
                value={localProfile.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Learning_Level
                </span>
              </label>
              <select
                value={localProfile.learningLevel || 'beginner'}
                onChange={(e) =>
                  handleInputChange('learningLevel', e.target.value)
                }
                className="select select-bordered w-full font-mono"
              >
                <option value="beginner">BEGINNER - Just starting out</option>
                <option value="intermediate">
                  INTERMEDIATE - Some experience
                </option>
                <option value="advanced">ADVANCED - Experienced learner</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Primary_Study_Goal
                </span>
              </label>
              <select
                value={localProfile.studyGoal || ''}
                onChange={(e) => handleInputChange('studyGoal', e.target.value)}
                className="select select-bordered w-full font-mono"
              >
                <option value="">SELECT_GOAL</option>
                {studyGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal.toUpperCase().replace(/ /g, '_')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            <label className="label">
              <span className="label-text font-mono text-xs uppercase tracking-wide">
                About_Me (Optional)
              </span>
            </label>
            <textarea
              value={localProfile.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="textarea textarea-bordered w-full font-mono"
              rows={3}
              placeholder="Tell us about your learning journey, interests, or goals..."
              maxLength={500}
            />
            <div className="text-right text-xs font-mono text-base-content/60 mt-1">
              {(localProfile.bio || '').length}/500 characters
            </div>
          </div>

          {/* Reset Form Button */}
          <div className="flex justify-start pt-6 border-t border-base-300/50">
            <button
              onClick={handleResetChanges}
              disabled={isLoading}
              className="btn btn-ghost font-mono text-xs"
            >
              RESET_FORM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
