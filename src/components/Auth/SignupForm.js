// SignupForm.js - Signup form component

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { validateSignup, getPasswordStrength, validateEmail } from './authValidation';
import '../Auth.css';

export function SignupForm({ onSubmit = () => {}, onSwitchToLogin = () => {} }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, type, checked, value } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Update password strength in real-time
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(newValue));
    }

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setServerError('');
  }, [errors]);

  // Handle blur for field validation
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate single field on blur
    const newErrors = { ...errors };
    if (name === 'email' && formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (name === 'confirmPassword' && formData.password && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);
  }, [errors, formData.password, formData.email, formData.confirmPassword]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate all fields
    const validationErrors = validateSignup(formData);
    if (!formData.agreeToTerms) {
      validationErrors.agreeToTerms = 'You must agree to the Terms & Privacy';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        inviteCode: true,
        agreeToTerms: true
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success
      await onSubmit({
        ...formData,
        confirmPassword: undefined // Don't send confirm password to API
      });

      // Show success message
      alert('Account created successfully! Redirecting...');
    } catch (error) {
      setServerError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrengthSegments = passwordStrength ? Math.min(4, Math.ceil(passwordStrength.score)) : 0;

  return (
    <>
      <div className="auth-form-header">
        <h1>Create Account</h1>
        <p>Join the cryptic community and start encrypting</p>
      </div>

      {serverError && (
        <div className="auth-alert error" role="alert">
          <span className="auth-alert-icon">⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="auth-form-group">
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`auth-form-input ${errors.name ? 'error' : touched.name && formData.name ? 'success' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            autoComplete="name"
          />
          {errors.name && (
            <div className="auth-form-error" id="name-error" role="alert">
              ✕ {errors.name}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="auth-form-group">
          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`auth-form-input ${errors.email ? 'error' : touched.email && formData.email ? 'success' : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
          />
          {errors.email && (
            <div className="auth-form-error" id="email-error" role="alert">
              ✕ {errors.email}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="auth-form-group">
          <label htmlFor="signup-password">Password</label>
          <div className="auth-password-container">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`auth-form-input ${errors.password ? 'error' : touched.password && formData.password ? 'success' : ''}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="new-password"
            />
            {formData.password && (
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            )}
          </div>

          {/* Password strength meter */}
          {formData.password && (
            <div className="auth-password-strength">
              <div className="auth-password-strength-bar">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`auth-password-strength-segment ${i < passwordStrengthSegments ? passwordStrength?.level : ''}`}
                  />
                ))}
              </div>
              <div className="auth-password-strength-text">
                <span>
                  <span className={`auth-password-strength-label ${passwordStrength?.level}`}>
                    {passwordStrength?.label}
                  </span>
                </span>
                <span>{Math.round(passwordStrength?.entropy || 0)} bits</span>
              </div>
            </div>
          )}

          {errors.password && (
            <div className="auth-form-error" id="password-error" role="alert">
              ✕ {errors.password}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="auth-form-group">
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <div className="auth-password-container">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`auth-form-input ${
                errors.confirmPassword ? 'error' : formData.password && formData.confirmPassword === formData.password ? 'success' : ''
              }`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              autoComplete="new-password"
            />
            {formData.confirmPassword && (
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            )}
          </div>
          {formData.password && formData.confirmPassword === formData.password && (
            <div className="auth-form-success">
              ✓ Passwords match
            </div>
          )}
          {errors.confirmPassword && (
            <div className="auth-form-error" id="confirm-password-error" role="alert">
              ✕ {errors.confirmPassword}
            </div>
          )}
        </div>

        {/* Invite Code (Optional) */}
        <div className="auth-form-group">
          <label htmlFor="signup-invite">
            Invite Code <span className="optional">(Optional)</span>
          </label>
          <input
            id="signup-invite"
            type="text"
            name="inviteCode"
            placeholder="Enter invite code if you have one"
            value={formData.inviteCode}
            onChange={handleChange}
            disabled={isLoading}
            className="auth-form-input"
            autoComplete="off"
          />
        </div>

        {/* Terms checkbox */}
        <div className="auth-form-checkbox">
          <input
            id="signup-terms"
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!errors.agreeToTerms}
          />
          <label htmlFor="signup-terms">
            I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <div className="auth-form-error" role="alert">
            ✕ {errors.agreeToTerms}
          </div>
        )}

        {/* Submit buttons */}
        <div className="auth-form-buttons">
          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="auth-btn-spinner" aria-hidden="true" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="auth-form-link">
            Already have an account? <a href="#login" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Sign in</a>
          </p>
        </div>

        {/* Security note */}
        <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '16px' }}>
          🔒 Your data is encrypted with AES-256-GCM. Passwords hashed with PBKDF2(SHA-256, 100k rounds).
        </div>
      </form>
    </>
  );
}

SignupForm.propTypes = {
  onSubmit: PropTypes.func,
  onSwitchToLogin: PropTypes.func
};

export default SignupForm;
