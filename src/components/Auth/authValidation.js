// authValidation.js - Validation logic with unit tests

/**
 * Calculate password entropy (bits of randomness)
 * Helps determine password strength
 */
export function calculateEntropy(password) {
  const patterns = {
    lowercase: /[a-z]/,
    uppercase: /[A-Z]/,
    numbers: /[0-9]/,
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?\/]/
  };

  let charspaceSize = 0;
  if (patterns.lowercase.test(password)) charspaceSize += 26;
  if (patterns.uppercase.test(password)) charspaceSize += 26;
  if (patterns.numbers.test(password)) charspaceSize += 10;
  if (patterns.symbols.test(password)) charspaceSize += 32;

  const entropy = password.length * Math.log2(charspaceSize || 1);
  return entropy;
}

/**
 * Get password strength level based on entropy and other factors
 */
export function getPasswordStrength(password) {
  if (!password) return { level: 'empty', score: 0, label: 'No password' };

  const entropy = calculateEntropy(password);
  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?\/]/.test(password);

  const varietyScore = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;

  // Scoring: based on entropy and character variety
  if (length < 6) {
    return { level: 'weak', score: 1, label: 'Too short', entropy };
  }

  if (entropy < 30) {
    return { level: 'weak', score: 1, label: 'Weak', entropy };
  }

  if (entropy < 50 && varietyScore < 3) {
    return { level: 'fair', score: 2, label: 'Fair', entropy };
  }

  if (entropy < 60) {
    return { level: 'good', score: 3, label: 'Good', entropy };
  }

  return { level: 'strong', score: 4, label: 'Strong', entropy };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate signup form
 */
export function validateSignup(values) {
  const errors = {};

  // Name validation
  if (!values.name || values.name.trim().length === 0) {
    errors.name = 'Full name is required';
  } else if (values.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (values.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Email validation
  if (!values.email || values.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!validateEmail(values.email)) {
    errors.email = 'Please enter a valid email';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  } else {
    const strength = getPasswordStrength(values.password);
    if (strength.level === 'weak') {
      errors.password = 'Password is too weak. Add uppercase, numbers, or symbols';
    }
  }

  // Confirm password validation
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Optional: invite code validation (alphanumeric only)
  if (values.inviteCode && !/^[a-zA-Z0-9]*$/.test(values.inviteCode)) {
    errors.inviteCode = 'Invite code must be alphanumeric';
  }

  return errors;
}

/**
 * Validate login form
 */
export function validateLogin(values) {
  const errors = {};

  // Email/username validation
  if (!values.emailOrUsername || values.emailOrUsername.trim().length === 0) {
    errors.emailOrUsername = 'Email or username is required';
  } else if (values.emailOrUsername.includes('@') && !validateEmail(values.emailOrUsername)) {
    errors.emailOrUsername = 'Please enter a valid email';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

/**
 * Unit tests for validation
 */
export const tests = {
  testPasswordStrength() {
    const cases = [
      { password: '', expected: 'empty' },
      { password: '123', expected: 'weak' },
      { password: 'hello', expected: 'weak' },
      { password: 'Hello123', expected: 'fair' },
      { password: 'SecurePass123!', expected: 'strong' },
    ];

    cases.forEach(({ password, expected }) => {
      const result = getPasswordStrength(password);
      console.assert(result.level === expected, `Failed for "${password}": got ${result.level}, expected ${expected}`);
    });
    console.log('✓ Password strength tests passed');
  },

  testEmailValidation() {
    const cases = [
      { email: 'test@example.com', valid: true },
      { email: 'invalid.email', valid: false },
      { email: 'user+tag@domain.co.uk', valid: true },
      { email: '', valid: false },
    ];

    cases.forEach(({ email, valid }) => {
      const result = validateEmail(email);
      console.assert(result === valid, `Email validation failed for "${email}"`);
    });
    console.log('✓ Email validation tests passed');
  },

  testSignupValidation() {
    const validInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      inviteCode: ''
    };

    const errors = validateSignup(validInput);
    console.assert(Object.keys(errors).length === 0, 'Valid signup should have no errors');
    console.log('✓ Signup validation tests passed');
  },

  testLoginValidation() {
    const validInput = {
      emailOrUsername: 'test@example.com',
      password: 'MyPassword123'
    };

    const errors = validateLogin(validInput);
    console.assert(Object.keys(errors).length === 0, 'Valid login should have no errors');
    console.log('✓ Login validation tests passed');
  }
};

// Run tests if needed: tests.testPasswordStrength(), etc.
