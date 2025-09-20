// ============================================
// ENUMS AND TYPES
// ============================================

export type UserRole = 'admin' | 'user';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

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
  emailVerified: boolean;
  firstLogin: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;

  // Profile fields
  learningLevel?: LearningLevel;
  preferredSubjects?: string[];
  timezone?: string;
  location?: string;
  bio?: string;
  studyGoal?: string;
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
  preferredSubjects?: string[];
  timezone?: string;
  location?: string;
  bio?: string;
  studyGoal?: string;
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
  | 'learningLevel'
  | 'preferredSubjects'
  | 'timezone'
  | 'location'
  | 'bio'
  | 'studyGoal'
>;

// Type for basic user info
export type UserBasicInfo = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'avatar' | 'role'
>;

// Type for user settings/preferences
export type UserPreferences = Pick<User, 'timezone' | 'preferredSubjects'>;
