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
}

// ============================================
// USER PROFILE INTERFACE
// ============================================

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  learningLevel: LearningLevel;
  preferredSubjects: string[];
  timezone: string;
  location: string;
  bio: string;
  studyGoal: string;
}

// ============================================
// UPDATE INTERFACES
// ============================================

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  user: User;
  message: string;
}
