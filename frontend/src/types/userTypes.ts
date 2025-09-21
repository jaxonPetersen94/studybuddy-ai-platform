// ============================================
// ENUMS AND TYPES
// ============================================

export type UserRole = 'admin' | 'user';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type ThemeMode = 'light' | 'dark' | 'auto';

// ============================================
// PREFERENCE INTERFACES
// ============================================

export interface AppearancePreferences {
  themeMode?: ThemeMode;
}

export interface DataPreferences {
  analyticsEnabled: boolean;
  dataExportFormat: 'json' | 'csv' | 'pdf';
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface UserPreferences {
  appearance?: Partial<AppearancePreferences>;
  data?: Partial<DataPreferences>;
  timezone?: string;
}

// ============================================
// CORE USER INTERFACE
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  phone?: string;
  firstLogin: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;

  // Profile fields
  learningLevel?: LearningLevel;
  timezone?: string;
  location?: string;
  bio?: string;
  studyGoal?: string;

  // User preferences
  preferences?: UserPreferences;
}

// ============================================
// UPDATE INTERFACES
// ============================================

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  learningLevel?: LearningLevel;
  timezone?: string;
  location?: string;
  bio?: string;
  studyGoal?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}

// ============================================
// HELPER TYPES
// ============================================

// Type for profile-specific fields only
export type UserProfileFields = Pick<
  User,
  'learningLevel' | 'timezone' | 'location' | 'bio' | 'studyGoal'
>;

// Type for basic user info
export type UserBasicInfo = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'avatar' | 'role'
>;

// Type for data management settings specifically
export type UserDataSettings = DataPreferences;
