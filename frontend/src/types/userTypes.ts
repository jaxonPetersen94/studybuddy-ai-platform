export type UserRole = 'admin' | 'user';
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface AppearancePreferences {
  themeMode?: ThemeMode;
}

export interface UserPreferences {
  appearance?: Partial<AppearancePreferences>;
  timezone?: string;
}

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
  learningLevel?: LearningLevel;
  timezone?: string;
  location?: string;
  bio?: string;
  studyGoal?: string;
  preferences?: UserPreferences;
}

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

export type UserProfileFields = Pick<
  User,
  'learningLevel' | 'timezone' | 'location' | 'bio' | 'studyGoal'
>;

export type UserBasicInfo = Pick<
  User,
  'id' | 'email' | 'firstName' | 'lastName' | 'avatar' | 'role'
>;
