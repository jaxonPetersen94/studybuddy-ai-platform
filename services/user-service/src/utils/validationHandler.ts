import { Request, Response, NextFunction } from 'express';

/**
 * Validate email format using RFC 5322 compliant regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Enhanced password validation with special characters
 */
export const validateStrongPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

/**
 * Validate name fields (firstName, lastName)
 */
export const validateName = (name: string): boolean => {
  if (!name || name.trim().length === 0) return false;
  if (name.trim().length > 50) return false;
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  return nameRegex.test(name.trim());
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '').substring(0, 1000);
};

/**
 * Validate UUID format
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Password strength checker with detailed feedback
 */
export interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Add uppercase letter');
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Add lowercase letter');
  if (/\d/.test(password)) score++;
  else feedback.push('Add a number');
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  else feedback.push('Consider adding a special character');

  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc/i,
    /(.)\1{2,}/,
  ];
  if (commonPatterns.some((p) => p.test(password)))
    feedback.push('Avoid common patterns');

  const isValid = score >= 3 && password.length >= 8;

  return { score, feedback, isValid };
};

/**
 * Centralized validation handler middleware
 * Example usage in routes: router.post('/register', validationHandler({ email: true, password: true }), controller)
 */
export const validationHandler =
  (rules: {
    email?: boolean;
    password?: boolean;
    strongPassword?: boolean;
    firstName?: boolean;
    lastName?: boolean;
  }) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const errors: string[] = [];

    if (rules.email && !validateEmail(req.body.email))
      errors.push('Invalid email format');
    if (rules.password && !validatePassword(req.body.password))
      errors.push('Weak password');
    if (rules.strongPassword && !validateStrongPassword(req.body.password))
      errors.push(
        'Password must include uppercase, lowercase, number, and special char',
      );
    if (rules.firstName && !validateName(req.body.firstName))
      errors.push('Invalid first name');
    if (rules.lastName && !validateName(req.body.lastName))
      errors.push('Invalid last name');

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    return next();
  };
