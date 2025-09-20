import React from 'react';
import { User, Calendar, Upload, Camera, Globe } from 'lucide-react';
import { UserProfile } from '../../types/userTypes';

interface UserProfileSettingsProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  profile,
  onProfileChange,
}) => {
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

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    onProfileChange({
      ...profile,
      [field]: value,
    });
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

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="card-body p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-box flex items-center justify-center text-2xl font-bold text-primary-content shadow-lg">
                  {profile.avatar || profile.name.charAt(0).toUpperCase()}
                </div>
                <button className="absolute -bottom-1 -right-1 btn btn-xs btn-primary rounded-full opacity-80 hover:opacity-100 transition-opacity">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <button className="btn btn-xs font-mono bg-base-300/50 border-base-300/50 text-base-content/60 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200">
                <Upload className="w-3 h-3" />
                CHANGE_AVATAR
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                <h3 className="text-xl font-bold text-base-content">
                  {profile.name || 'Your Name'}
                </h3>
                <div
                  className={`badge ${getLearningLevelColor(
                    profile.learningLevel,
                  )} font-mono text-xs mt-2 md:mt-0`}
                >
                  {profile.learningLevel?.toUpperCase()}_LEARNER
                </div>
              </div>

              <p className="text-base-content/60 font-mono text-sm mb-2">
                {profile.email || 'your.email@example.com'}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs font-mono text-base-content/60">
                <div className="flex items-center justify-center sm:justify-start space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Joined {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                </div>
                {profile.location && (
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>{profile.location}</span>
                  </div>
                )}
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
                  Full_Name *
                </span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="Enter your full name"
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
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Learning_Level
                </span>
              </label>
              <select
                value={profile.learningLevel}
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
                value={profile.studyGoal}
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

            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Timezone
                </span>
              </label>
              <select
                value={profile.timezone}
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
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="input input-bordered w-full font-mono"
                placeholder="City, Country"
              />
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
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="textarea textarea-bordered w-full font-mono"
              rows={3}
              placeholder="Tell us about your learning journey, interests, or goals..."
              maxLength={500}
            />
            <div className="text-right text-xs font-mono text-base-content/60 mt-1">
              {profile.bio?.length || 0}/500 characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings;
