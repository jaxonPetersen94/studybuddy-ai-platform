import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { AppearancePreferences, ThemeMode } from '../../types/userTypes';

interface UserAppearanceSettingsProps {
  isLoading?: boolean;
  currentThemeMode: ThemeMode;
  userAppearanceSettings?: Partial<AppearancePreferences>;
  onThemeChange: (themeMode: ThemeMode) => void;
}

const UserAppearanceSettings: React.FC<UserAppearanceSettingsProps> = ({
  isLoading = false,
  currentThemeMode,
  userAppearanceSettings,
  onThemeChange,
}) => {
  // Default appearance settings
  const defaultSettings: AppearancePreferences = {
    themeMode: 'auto',
  };

  // Local state for appearance settings
  const [localSettings, setLocalSettings] =
    useState<AppearancePreferences>(defaultSettings);

  // Track the original/saved theme mode
  const [originalThemeMode, setOriginalThemeMode] =
    useState<ThemeMode>(currentThemeMode);

  // Initialize settings from user preferences when they load
  useEffect(() => {
    if (userAppearanceSettings) {
      const mergedSettings = {
        ...defaultSettings,
        ...userAppearanceSettings,
        themeMode: userAppearanceSettings.themeMode || currentThemeMode,
      };
      setLocalSettings(mergedSettings);
      // Update original theme mode when settings are loaded/saved
      setOriginalThemeMode(
        userAppearanceSettings.themeMode || currentThemeMode,
      );
    }
  }, [userAppearanceSettings, currentThemeMode]);

  // Check if theme has been modified from original
  const hasThemeChanges = currentThemeMode !== originalThemeMode;

  const handleThemeChange = (newThemeMode: ThemeMode) => {
    // Call parent's theme change handler for immediate UI update
    onThemeChange(newThemeMode);

    // Update local settings for UI consistency
    const updatedSettings = {
      ...localSettings,
      themeMode: newThemeMode,
    };
    setLocalSettings(updatedSettings);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
        <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
          <h2 className="font-mono text-sm uppercase tracking-wide text-base-content flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Theme_&_Colors</span>
            {hasThemeChanges && (
              <div className="badge badge-warning badge-sm font-mono text-xs">
                UNSAVED
              </div>
            )}
          </h2>
        </div>
        <div className="card-body p-6">
          <div className="space-y-6">
            {/* Theme Mode Selection */}
            <div>
              <label className="label">
                <span className="label-text font-mono text-xs uppercase tracking-wide">
                  Color_Theme
                </span>
                <span className="label-text-alt font-mono text-xs text-base-content/60">
                  Current: {currentThemeMode}
                  {hasThemeChanges && (
                    <span className="text-warning ml-2">• Modified</span>
                  )}
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('auto')}
                  disabled={isLoading}
                  className={`btn flex-col h-auto py-4 relative ${
                    currentThemeMode === 'auto' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="font-mono text-xs mt-1">AUTO</span>
                  {currentThemeMode === 'auto' && hasThemeChanges && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  disabled={isLoading}
                  className={`btn flex-col h-auto py-4 relative ${
                    currentThemeMode === 'light' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="font-mono text-xs mt-1">LIGHT</span>
                  {currentThemeMode === 'light' && hasThemeChanges && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  disabled={isLoading}
                  className={`btn flex-col h-auto py-4 relative ${
                    currentThemeMode === 'dark' ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="font-mono text-xs mt-1">DARK</span>
                  {currentThemeMode === 'dark' && hasThemeChanges && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full"></div>
                  )}
                </button>
              </div>

              {hasThemeChanges && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <p className="font-mono text-xs text-warning">
                    // Theme changes are preview only. Click "SAVE_ALL_SETTINGS"
                    to persist changes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAppearanceSettings;
