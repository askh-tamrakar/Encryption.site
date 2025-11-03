// App.js - Updated to include authentication

import React from 'react';
import './App.css';
import { encryptText, bytesToBase64 } from './crypto';
import themePresets from './themes/presets';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';
import PillNav from './components/PillNav';
import Pill from './components/Pill';
import EncryptText from './components/EncryptText';
import AuthModal from './components/AuthModal';

function App() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'theme-violet');
  const [navColors, setNavColors] = React.useState({ base: '#000000', pill: '#ffffff', pillText: '#000000', hoverText: '#ffffff' });
  
  // Auth state
  const [authView, setAuthView] = React.useState(null); // 'signup' | 'login' | null
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  // File encryption state
  const [fileName, setFileName] = React.useState('');
  const [fileText, setFileText] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [resultB64, setResultB64] = React.useState('');

  // Theme management
  React.useEffect(() => {
    const root = document.documentElement;
    const existing = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    if (existing.length) root.classList.remove(...existing);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    const cs = getComputedStyle(root);
    const accent = cs.getPropertyValue('--accent').trim() || '#121212';
    const text = cs.getPropertyValue('--text').trim() || '#ffffff';
    setNavColors({ base: accent, pill: text, pillText: accent, hoverText: text });
  }, [theme]);

  // Handle file selection
  function onFileChange(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const isTxt = /\.txt$/i.test(file.name);
    if (!isTxt) {
      alert('Please upload a .txt file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFileText(String(reader.result || ''));
    reader.readAsText(file);
  }

  // Handle encryption
  async function onEncrypt() {
    if (!fileText) {
      alert('Please select a .txt file');
      return;
    }
    if (!password || password.length < 6) {
      alert('Use a password with at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      const bytes = await encryptText(fileText, password);
      const b64 = bytesToBase64(bytes);
      setResultB64(b64);
    } catch (e) {
      console.error(e);
      alert('Encryption failed');
    } finally {
      setBusy(false);
    }
  }

  // Download encrypted file
  function downloadEncrypted() {
    if (!resultB64) return;
    const blob = new Blob([resultB64], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const base = fileName.replace(/\.txt$/i, '') || 'encrypted';
    a.download = base + '.enc.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Handle successful signup
  const handleSignupSuccess = async (signupData) => {
    console.log('Signup successful:', signupData);
    setIsAuthenticated(true);
    setAuthView(null);
    alert('Welcome to Cryptic Encryptor!');
  };

  // Handle successful login
  const handleLoginSuccess = async (loginData) => {
    console.log('Login successful:', loginData);
    setIsAuthenticated(true);
    setAuthView(null);
    alert('Welcome back!');
  };

  const [pillSize, setPillSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '16px Inter, sans-serif';
    let maxWidth = 0;
    themePresets.forEach(p => {
      const metrics = context.measureText(p.label);
      const w = metrics.width;
      if (w > maxWidth) maxWidth = w;
    });
    const paddedWidth = Math.ceil(maxWidth + 60);
    setPillSize({ width: paddedWidth, height: 40 });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <PillNav
        pills={themePresets.map(p => ({ value: p.value, label: p.label }))}
        value={theme}
        onChange={setTheme}
        colors={navColors}
        additionalPills={[
          {
            label: isAuthenticated ? 'Logout' : 'Login',
            value: 'login-btn',
            onClick: () => {
              if (isAuthenticated) {
                setIsAuthenticated(false);
                alert('Logged out');
              } else {
                setAuthView('login');
              }
            }
          }
        ]}
        pillSize={pillSize}
      />

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <ScrollStack>
          <ScrollStackItem>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <h1>
                <EncryptText
                  text="CRYPTIC ENCRYPTOR"
                  speed={50}
                  sequential
                  revealDirection="center"
                />
              </h1>

              <p style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '32px' }}>
                Military-grade AES-256-GCM encryption. Lightning fast. Completely private.
              </p>

              {!isAuthenticated ? (
                <button
                  onClick={() => setAuthView('signup')}
                  style={{
                    padding: '12px 32px',
                    background: 'var(--primary)',
                    color: 'var(--primary-contrast)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 600,
                    marginRight: '12px'
                  }}
                >
                  Get Started →
                </button>
              ) : (
                <p style={{ color: 'var(--primary)', fontSize: '14px' }}>✓ You are logged in</p>
              )}
            </div>
          </ScrollStackItem>

          <ScrollStackItem>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
              <h2>Encrypt a File</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Select Text File</label>
                <input
                  type="file"
                  accept=".txt"
                  onChange={onFileChange}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                {fileName && <p style={{ color: 'var(--primary)', fontSize: '14px', marginTop: '8px' }}>✓ {fileName}</p>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', boxSizing: 'border-box' }}
                />
              </div>

              <button
                onClick={onEncrypt}
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: busy ? 'var(--muted)' : 'var(--primary)',
                  color: 'var(--primary-contrast)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}
              >
                {busy ? 'Encrypting...' : 'Encrypt'}
              </button>

              {resultB64 && (
                <button
                  onClick={downloadEncrypted}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--accent)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Download Encrypted File
                </button>
              )}
            </div>
          </ScrollStackItem>
        </ScrollStack>
      </div>

      {/* Auth Modal */}
      <AuthModal
        type={authView}
        open={!!authView}
        onClose={() => setAuthView(null)}
        onSuccess={() => {
          if (authView === 'signup') handleSignupSuccess({});
          if (authView === 'login') handleLoginSuccess({});
        }}
      />
    </div>
  );
}

export default App;
