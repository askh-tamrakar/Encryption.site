// LoginForm.js - Login form component

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { validateLogin } from './authValidation';
import '../Auth.css';

export function LoginForm({ onSubmit = () => {}, onSwitchToSignup = () => {}, on2FARequired = () => {} }) {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, type, checked, value } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

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
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setServerError('Too many login attempts. Please try again later.');
      return;
    }

    setServerError('');

    // Validate all fields
    const validationErrors = validateLogin(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({
        emailOrUsername: true,
        password: true
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - replace with real API
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Simulate different responses
      const isValidLogin = formData.emailOrUsername && formData.password;

      if (!isValidLogin) {
        throw new Error('Invalid credentials');
      }

      // Check if 2FA is needed (mock)
      const needs2FA = Math.random() < 0.1; // 10% chance for demo
      if (needs2FA) {
        on2FARequired();
        return;
      }

      // Save remember-me preference
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('lastEmail', formData.emailOrUsername);
      }

      // Simulate success
      await onSubmit(formData);
      setLoginAttempts(0);

    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        setServerError('Account locked due to too many failed attempts. Please try again in 15 minutes or use "Forgot Password".');
      } else {
        setServerError(error.message || 'Invalid email or password.');
        if (newAttempts === 4) {
          setServerError('Invalid email or password. One more attempt before lockout.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Password reset link sent to ${forgotEmail}. Check your inbox.`);
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      alert('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <>
        <div className="auth-form-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form className="auth-form" onSubmit={handleForgotPassword} noValidate>
          <div className="auth-form-group">
            <label htmlFor="forgot-email">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className="auth-form-input"
              autoComplete="email"
            />
          </div>

          <div className="auth-form-buttons">
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="auth-btn-spinner" aria-hidden="true" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
            <button
              type="button"
              className="auth-btn auth-btn-secondary"
              onClick={() => setShowForgotPassword(false)}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="auth-form-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your account to continue</p>
      </div>

      {serverError && (
        <div className={`auth-alert ${isLocked ? 'error' : 'error'}`} role="alert">
          <span className="auth-alert-icon">⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      {loginAttempts > 0 && loginAttempts < 5 && (
        <div className="auth-alert warning">
          <span className="auth-alert-icon">⏱️</span>
          <span>{5 - loginAttempts} attempt{5 - loginAttempts !== 1 ? 's' : ''} remaining</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Email or Username */}
        <div className="auth-form-group">
          <label htmlFor="login-email">Email or Username</label>
          <input
            id="login-email"
            type="text"
            name="emailOrUsername"
            placeholder="Enter your email or username"
            value={formData.emailOrUsername}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading || isLocked}
            className={`auth-form-input ${errors.emailOrUsername ? 'error' : touched.emailOrUsername && formData.emailOrUsername ? 'success' : ''}`}
            aria-invalid={!!errors.emailOrUsername}
            aria-describedby={errors.emailOrUsername ? 'email-error' : undefined}
            autoComplete="username"
          />
          {errors.emailOrUsername && (
            <div className="auth-form-error" id="email-error" role="alert">
              ✕ {errors.emailOrUsername}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="auth-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="login-password">Password</label>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', textDecoration: 'none' }}
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading || isLocked}
            >
              Forgot?
            </button>
          </div>
          <div className="auth-password-container">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading || isLocked}
              className={`auth-form-input ${errors.password ? 'error' : touched.password && formData.password ? 'success' : ''}`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            {formData.password && (
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading || isLocked}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            )}
          </div>
          {errors.password && (
            <div className="auth-form-error" id="password-error" role="alert">
              ✕ {errors.password}
            </div>
          )}
        </div>

        {/* Remember me */}
        <div className="auth-form-checkbox">
          <input
            id="login-remember"
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isLoading || isLocked}
          />
          <label htmlFor="login-remember">
            Remember me on this device
          </label>
        </div>

        {/* Submit buttons */}
        <div className="auth-form-buttons">
          <button
            type="submit"
            className="auth-btn"
            disabled={isLoading || isLocked}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="auth-btn-spinner" aria-hidden="true" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="auth-form-link">
            Don't have an account? <a href="#signup" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>Create one</a>
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

LoginForm.propTypes = {
  onSubmit: PropTypes.func,
  onSwitchToSignup: PropTypes.func,
  on2FARequired: PropTypes.func
};

export default LoginForm;
