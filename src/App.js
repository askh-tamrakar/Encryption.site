import React from 'react';
import './App.css';
// logo replaced by video in topbar brand
import { encryptText, bytesToBase64 } from './crypto';
import themePresets from './themes/presets';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';
import PillNav from './components/PillNav';

function App() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'theme-violet');
  // Dropdown state now managed within PillNav
  const [navColors, setNavColors] = React.useState({ base:'#000000', pill:'#ffffff', pillText:'#000000', hoverText:'#ffffff' });
  const [fileName, setFileName] = React.useState('');
  const [fileText, setFileText] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [resultB64, setResultB64] = React.useState('');

  React.useEffect(() => {
    const root = document.documentElement;
    const existing = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    if (existing.length) root.classList.remove(...existing);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    const cs = getComputedStyle(root);
    const bg = cs.getPropertyValue('--bg').trim() || '#000000';
    const accent = cs.getPropertyValue('--accent').trim() || '#121212';
    const text = cs.getPropertyValue('--text').trim() || '#ffffff';
    const primary = cs.getPropertyValue('--primary').trim() || '#61dafb';
    setNavColors({ base:accent, pill:text, pillText:accent, hoverText:text });
  }, [theme]);

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

  async function onEncrypt() {
    if (!fileText) { alert('Please select a .txt file'); return; }
    if (!password || password.length < 6) { alert('Use a password with at least 6 characters'); return; }
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

  return (
    <div className="app-root">
      <div className="topbar">
        <div className="topbar-inner container">
          <div className="brand">
            <video muted autoPlay loop playsInline preload="auto" aria-label="logo animation">
              <source src="/Encryption.mp4" type="video/mp4"/>
            </video>
            <div className="title"> Encrypt <br /> Your Data </div>
          </div>
          <nav className="nav">
            <div className="pill-nav" style={{background:'transparent', border:'none', boxShadow:'none', padding:0}}>
              <PillNav
                items={[
                  { label: 'Home', href: '#top' },
                  { label: 'About', href: '#about' },
                  { label: 'How it Works', href: '#how' },
                  { label: 'Login', href: '#login' },
                  {
                    type: 'dropdown',
                    label: 'Theme',
                    key: 'theme-dropdown',
                    menu: ({ close }) => (
                      <ScrollStack>
                        {themePresets.map(p => (
                          <ScrollStackItem key={p.value}>
                            <button
                              className="dropdown-item"
                              onClick={() => { setTheme(p.value); close?.(); }}
                              style={{
                                background: `linear-gradient(180deg, ${p.palette?.[0] || 'var(--primary)'} 0%, ${(p.palette?.[1] || 'var(--accent)')} 50%, ${(p.palette?.[2] || 'var(--surface)')} 75%, ${(p.palette?.[3] || 'var(--bg)')} 100%)`,
                                color: '#fff'
                              }}
                            > 
                              {p.label}
                            </button>
                          </ScrollStackItem>
                        ))}
                      </ScrollStack>
                    )
                  }
                ]}
                activeHref={typeof window !== 'undefined' ? window.location.hash || '#top' : '#top'}
                className="custom-nav"
                ease="power2.easeOut"
                baseColor={navColors.base}
                pillColor={navColors.pill}
                hoveredPillTextColor={navColors.hoverText}
                pillTextColor={navColors.pillText}
              />
            </div>
          </nav>
          <button className="btn" onClick={() => document.getElementById('encrypt-card')?.scrollIntoView({ behavior: 'smooth' })}>Start Encrypting</button>
        </div>
      </div>

      <main className="container" style={{flex: 1}}>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-grid">
            <div>
              <h1 className="headline">
                CRYPTIC
                <br/>
                <span className="accent">ENCRYPTOR</span>
              </h1>
              <p className="lede">
                Step into the Shadows where Secrets Burn. <br />
                With Encryption Born from the Abyss, <br />
                your Data becomes Untouchable.  <br />
                Dare to Hide… If you Can. </p>
              <div className="cta">
                <button className="btn btn-primary" onClick={() => document.getElementById('encrypt-card')?.scrollIntoView({ behavior: 'smooth' })}>Get Started →</button>
                <a className="btn btn-secondary" href="#encrypt-card">Experience Generator</a>
              </div>
            </div>
            <div>
              <div className="mosaic">
                <div className="mosaic-item"> <video src="/Encryption.svg" alt="preview"/> </div>
                <div className="mosaic-item"> <video src="/lock.mp4" muted autoPlay loop playsInline/> </div>
                <div className="mosaic-item"> <img src="/encryption-file.png" alt="file"/> </div>
                <div className="mosaic-item"> <video src="/door.mp4" muted autoPlay loop playsInline/> </div>
                <div className="mosaic-item"> <img src="/encryption-file.png" alt="file 2"/> </div>
                <div className="mosaic-item"> <img src="/encryption.png" alt="preview 2"/> </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid">
          <div className="card" id="encrypt-card">
            <div className="row two">
              <div>
                <label className="muted">Upload .txt file</label>
                <div className="file-drop">
                  <input type="file" accept=".txt" onChange={onFileChange} style={{display:'none'}} id="fileInput"/>
                  <label htmlFor="fileInput" className="btn" style={{cursor:'pointer'}}>Choose File</label>
                  <div style={{marginTop:12}} className="file-name">{fileName || 'No file selected'}</div>
                </div>
              </div>
              <div>
                <label className="muted">Password</label>
                <input className="input" placeholder="Enter password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                <div className="muted" style={{marginTop:8, fontSize:13}}>AES‑256 GCM with PBKDF2(SHA-256, 100k)</div>
              </div>
            </div>

            <div className="actions" style={{marginTop:20}}>
              <button className="btn" onClick={onEncrypt} disabled={busy}>Encrypt</button>
              <button className="btn" onClick={downloadEncrypted} disabled={!resultB64}>Download .enc.txt</button>
            </div>

            {!!resultB64 && (
              <div style={{marginTop:20}}>
                <label className="muted">Preview (base64, truncated)</label>
                <div className="input" style={{height:120, overflow:'auto', whiteSpace:'pre-wrap'}}>{resultB64.slice(0, 512)}{resultB64.length>512?'...':''}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="footer">
        Built with Web Crypto API • <a className="muted" href="https://github.com/askh-tamrakar/" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </div>
  );
}

export default App;