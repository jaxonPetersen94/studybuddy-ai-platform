export interface PasswordStrength {
  strength: 'weak' | 'fair' | 'strong';
  color: 'error' | 'warning' | 'success';
}

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
