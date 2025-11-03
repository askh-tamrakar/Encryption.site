// AuthModal.js - Main authentication modal component

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import '../Auth.css';

export function AuthModal({ type = 'signup', open = true, onClose = () => {}, onSuccess = () => {} }) {
  const [currentView, setCurrentView] = useState(type);
  const [isAnimating, setIsAnimating] = useState(open);

  useEffect(() => {
    setCurrentView(type);
  }, [type]);

  if (!open && !isAnimating) {
    return null;
  }

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleSwitchView = (newView) => {
    setCurrentView(newView);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSuccess = () => {
    handleClose();
    setTimeout(() => onSuccess(), 300);
  };

  // Desktop sidebar content
  const renderSidebar = () => (
    <div className="auth-sidebar">
      <div className="auth-sidebar-content">
        <h2>Cryptic Encryptor</h2>
        <p>Military-grade encryption at your fingertips. Fast, secure, and completely private.</p>

        <div className="auth-sidebar-features">
          <div className="auth-sidebar-feature">
            <div className="auth-sidebar-feature-icon">🔐</div>
            <div className="auth-sidebar-feature-text">
              <div className="auth-sidebar-feature-title">Military-Grade Security</div>
              <div className="auth-sidebar-feature-desc">AES-256-GCM encryption standard</div>
            </div>
          </div>

          <div className="auth-sidebar-feature">
            <div className="auth-sidebar-feature-icon">⚡</div>
            <div className="auth-sidebar-feature-text">
              <div className="auth-sidebar-feature-title">Lightning Fast</div>
              <div className="auth-sidebar-feature-desc">Process files instantly</div>
            </div>
          </div>

          <div className="auth-sidebar-feature">
            <div className="auth-sidebar-feature-icon">🌐</div>
            <div className="auth-sidebar-feature-text">
              <div className="auth-sidebar-feature-title">Completely Private</div>
              <div className="auth-sidebar-feature-desc">Zero-knowledge architecture</div>
            </div>
          </div>

          <div className="auth-sidebar-feature">
            <div className="auth-sidebar-feature-icon">🎯</div>
            <div className="auth-sidebar-feature-text">
              <div className="auth-sidebar-feature-title">Always Available</div>
              <div className="auth-sidebar-feature-desc">Works on all devices</div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-sidebar-footer">
        Your privacy is our priority. All encryption happens client-side. We never store or have access to your encryption keys.
      </div>
    </div>
  );

  return (
    <div className="auth-modal" onClick={handleBackdropClick}>
      <div className="auth-modal-content" style={{
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 300ms ease'
      }}>
        <button
          className="auth-modal-close"
          onClick={handleClose}
          aria-label="Close authentication modal"
        >
          ✕
        </button>

        {currentView === 'signup' ? renderSidebar() : null}

        <div className="auth-form-container">
          {currentView === 'signup' ? (
            <SignupForm
              onSubmit={handleSuccess}
              onSwitchToLogin={() => handleSwitchView('login')}
            />
          ) : (
            <LoginForm
              onSubmit={handleSuccess}
              onSwitchToSignup={() => handleSwitchView('signup')}
              on2FARequired={() => {
                alert('2FA would be required here');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

AuthModal.propTypes = {
  type: PropTypes.oneOf(['signup', 'login']),
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export default AuthModal;
