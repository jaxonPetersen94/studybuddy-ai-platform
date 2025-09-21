export interface PasswordStrength {
  strength: 'weak' | 'fair' | 'strong';
  color: 'error' | 'warning' | 'success';
}

// ============================================
// PASSWORD REQUIREMENTS CONFIGURATION
// ============================================

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
  required: boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters long',
    test: (password: string) => password.length >= 8,
    required: true,
  },
  {
    id: 'lowercase',
    label: 'Contains lowercase letters',
    test: (password: string) => /[a-z]/.test(password),
    required: true,
  },
  {
    id: 'uppercase',
    label: 'Contains uppercase letters',
    test: (password: string) => /[A-Z]/.test(password),
    required: true,
  },
  {
    id: 'numbers',
    label: 'Contains numbers',
    test: (password: string) => /\d/.test(password),
    required: true,
  },
  {
    id: 'special',
    label: 'Contains special characters (recommended)',
    test: (password: string) =>
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    required: false,
  },
];

// ============================================
// ENHANCED PASSWORD VALIDATION
// ============================================

export interface PasswordRequirementCheck {
  id: string;
  label: string;
  isMet: boolean;
  isRequired: boolean;
}

/**
 * Checks which password requirements are met
 * @param password - Password string to check
 * @returns Array of requirement checks
 */
export const checkPasswordRequirements = (
  password: string,
): PasswordRequirementCheck[] => {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    id: requirement.id,
    label: requirement.label,
    isMet: requirement.test(password),
    isRequired: requirement.required,
  }));
};

/**
 * Gets unmet required password requirements
 * @param password - Password string to check
 * @returns Array of unmet required requirements
 */
export const getUnmetRequirements = (password: string): string[] => {
  return checkPasswordRequirements(password)
    .filter((req) => req.isRequired && !req.isMet)
    .map((req) => req.label);
};

// ============================================
// EXISTING VALIDATION FUNCTIONS
// ============================================

/**
 * Validates email format using regex
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength requirements
 * @param password - Password string to validate
 * @returns boolean indicating if password meets requirements
 */
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
  );
};

/**
 * Calculates password strength based on length and complexity
 * @param password - Password string to analyze
 * @returns PasswordStrength object with strength level and color
 */
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (password.length < 6) {
    return { strength: 'weak', color: 'error' };
  }

  if (password.length < 8) {
    return { strength: 'fair', color: 'warning' };
  }

  if (isValidPassword(password)) {
    return { strength: 'strong', color: 'success' };
  }

  return { strength: 'fair', color: 'warning' };
};

/**
 * Validates that passwords match
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns boolean indicating if passwords match
 */
export const passwordsMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword;
};

/**
 * Validates that a name field is not empty after trimming
 * @param name - Name string to validate
 * @returns boolean indicating if name is valid
 */
export const isValidName = (name: string): boolean => {
  return name.trim().length > 0;
};

/**
 * Validates form data for login
 * @param email - Email string
 * @param password - Password string
 * @returns boolean indicating if login form is valid
 */
export const validateLoginForm = (email: string, password: string): boolean => {
  return email.length > 0 && password.length > 0 && isValidEmail(email);
};

/**
 * Validates form data for registration
 * @param formData - Registration form data
 * @returns boolean indicating if registration form is valid
 */
export const validateRegistrationForm = (formData: {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}): boolean => {
  const { email, password, confirmPassword, firstName, lastName } = formData;

  return (
    isValidEmail(email) &&
    isValidPassword(password) &&
    passwordsMatch(password, confirmPassword) &&
    isValidName(firstName) &&
    isValidName(lastName)
  );
};
