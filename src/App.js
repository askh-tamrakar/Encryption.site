import React from 'react';
import './App.css';
// logo replaced by video in topbar brand
import { encryptText, bytesToBase64 } from './crypto';
import themePresets from './themes/presets';
import ScrollStack, { ScrollStackItem } from './components/ScrollStack';
import PillNav from './components/PillNav';
import { a, label, link } from 'motion/react-client';
import { gsap } from 'gsap';

function App() {

    const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'theme-violet');
    const [navColors, setNavColors] = React.useState({ base:'#000000', pill:'#ffffff', pillText:'#000000', hoverText:'#ffffff' });
    const [fileName, setFileName] = React.useState('');
    const [fileText, setFileText] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [resultB64, setResultB64] = React.useState('');
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = React.useState(false);
    
    // Pill behavior for dropdown items
    const dropdownCircleRefs = React.useRef([]);
    const dropdownTlRefs = React.useRef([]);
    const dropdownActiveTweenRefs = React.useRef([]);

    React.useEffect(() => {
    const root = document.documentElement;
    const existing = Array.from(root.classList).filter(c => c.startsWith('theme-'));
    if (existing.length) root.classList.remove(...existing);
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    const cs = getComputedStyle(root);
    const accent = cs.getPropertyValue('--accent').trim() || '#121212';
    const text = cs.getPropertyValue('--text').trim() || '#ffffff';
    setNavColors({ base:accent, pill:text, pillText:accent, hoverText:text });
    }, [theme]);

    // Setup dropdown pill behavior
    React.useEffect(() => {
        const setupDropdownPills = () => {
            // Wait for ScrollStack to finish its layout
            requestAnimationFrame(() => {
                dropdownCircleRefs.current.forEach((circle, i) => {
                    if (!circle?.parentElement) return;

                    const pill = circle.parentElement;
                    const rect = pill.getBoundingClientRect();
                    
                    // Skip if element is not visible or has no dimensions
                    if (rect.width === 0 || rect.height === 0) return;
                    
                    const { width: w, height: h } = rect;
                    const R = ((w * w) / 4 + h * h) / (2 * h);
                    const D = Math.ceil(2 * R) + 2;
                    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                    const originY = D - delta;

                    circle.style.width = `${D}px`;
                    circle.style.height = `${D}px`;
                    circle.style.bottom = `-${delta}px`;

                    gsap.set(circle, {
                        xPercent: -50,
                        scale: 0,
                        transformOrigin: `50% ${originY}px`
                    });

                    const label = pill.querySelector('.pill-label');
                    const white = pill.querySelector('.pill-label-hover');

                    if (label) gsap.set(label, { y: 0 });
                    if (white) gsap.set(white, { y: h + 12, opacity: 0 });

                    dropdownTlRefs.current[i]?.kill();
                    const tl = gsap.timeline({ paused: true });

                    tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: 'power2.easeOut', overwrite: 'auto' }, 0);

                    if (label) {
                        tl.to(label, { y: -(h + 8), duration: 2, ease: 'power2.easeOut', overwrite: 'auto' }, 0);
                    }

                    if (white) {
                        gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
                        tl.to(white, { y: 0, opacity: 1, duration: 2, ease: 'power2.easeOut', overwrite: 'auto' }, 0);
                    }

                    dropdownTlRefs.current[i] = tl;
                });
            });
        };

        // Setup pills with multiple attempts to ensure DOM is ready
        const timer1 = setTimeout(setupDropdownPills, 100);
        const timer2 = setTimeout(setupDropdownPills, 300);
        
        // Also setup on window resize
        const handleResize = () => {
            setTimeout(setupDropdownPills, 50);
        };
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener('resize', handleResize);
            dropdownTlRefs.current.forEach(tl => tl?.kill());
            dropdownActiveTweenRefs.current.forEach(tween => tween?.kill());
        };
    }, [themePresets, isThemeDropdownOpen]);

    const handleDropdownEnter = (i) => {
        const tl = dropdownTlRefs.current[i];
        if (!tl) return;
        dropdownActiveTweenRefs.current[i]?.kill();
        dropdownActiveTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
            duration: 0.5,
            ease: 'power2.easeOut',
            overwrite: 'auto'
        });
    };

    const handleDropdownLeave = (i) => {
        const tl = dropdownTlRefs.current[i];
        if (!tl) return;
        dropdownActiveTweenRefs.current[i]?.kill();
        dropdownActiveTweenRefs.current[i] = tl.tweenTo(0, {
            duration: 0.35,
            ease: 'power2.easeOut',
            overwrite: 'auto'
        });
    };

    const toggleThemeDropdown = () => {
        console.log('Theme dropdown toggled:', !isThemeDropdownOpen);
        setIsThemeDropdownOpen(!isThemeDropdownOpen);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isThemeDropdownOpen && !event.target.closest('.nav')) {
                setIsThemeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isThemeDropdownOpen]);


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
                  { label: 'Theme',
                    href: '#',
                    onClick: (e) => {
                      e.preventDefault();
                      console.log('Theme pill clicked!');
                      toggleThemeDropdown();
                    }
                  },
                  // Theme Dropdown as Sixth Pill
                  ...(isThemeDropdownOpen ? [{
                    type: 'component',
                    key: 'theme-dropdown',
                    component: (
                      <div className="theme-dropdown-pill" style={{
                        '--base': navColors.base,
                        '--pill-bg': navColors.pill,
                        '--hover-text': navColors.hoverText,
                        '--pill-text': navColors.pillText
                      }}>
                        <ScrollStack
                          itemDistance={0}
                          itemScale={0}
                          itemStackDistance={80}
                          stackPosition="0%"
                          scaleEndPosition="0%"
                          baseScale={1}
                          rotationAmount={0}
                          blurAmount={0}
                          useWindowScroll={false}
                        >
                          {themePresets.map((p, idx) => (
                            <ScrollStackItem key={p.value}>
                              <div className="dropdown-pill-item">
                                <a
                                  href="#"
                                  className="pill dropdown-pill"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    console.log('Theme clicked:', p.value);
                                    setTheme(p.value);
                                    setIsThemeDropdownOpen(false);
                                  }}
                                  onMouseDown={e => e.preventDefault()}
                                  onMouseEnter={() => handleDropdownEnter(idx)}
                                  onMouseLeave={() => handleDropdownLeave(idx)}
                                >
                                  <span 
                                    className="hover-circle" 
                                    aria-hidden="true"
                                    ref={el => {
                                      dropdownCircleRefs.current[idx] = el;
                                    }}
                                  />
                                  <span className="label-stack">
                                    <span className="pill-label">{p.label}</span>
                                    <span className="pill-label-hover" aria-hidden="true">{p.label}</span>
                                  </span>
                                </a>
                              </div>
                            </ScrollStackItem>
                          ))}
                        </ScrollStack>
                      </div>
                    )
                  }] : [])
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