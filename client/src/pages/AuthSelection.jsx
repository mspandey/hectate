import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Shield, Lock, Users, ArrowRight, Sparkles } from 'lucide-react';
import '../styles/AuthSelection.css';

export default function AuthSelection() {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.selection-card', 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out'
        }
      );
      gsap.fromTo('.selection-header', 
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out'
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="auth-selection-wrapper" ref={containerRef}>
      <div className="selection-background">
        <div className="glow-sphere sphere-1"></div>
        <div className="glow-sphere sphere-2"></div>
      </div>

      <div className="selection-content">
        <header className="selection-header">
          <div className="auth-logo" onClick={() => navigate('/welcome')} style={{ cursor: 'pointer' }}>
            Hectate
          </div>
          <h1>Welcome to our safe haven.</h1>
          <p>Join the 100% verified community of women across India.</p>
        </header>

        <div className="selection-grid">
          <div className="selection-card login-card" onClick={() => navigate('/auth')}>
            <div className="card-icon">
              <Lock size={32} />
            </div>
            <div className="card-info">
              <h2>I have an account</h2>
              <p>Welcome back, sister. Log in to your community.</p>
              <span className="card-action">Sign In <ArrowRight size={16} /></span>
            </div>
          </div>

          <div className="selection-card signup-card" onClick={() => navigate('/verify')}>
            <div className="card-icon">
              <Shield size={32} />
            </div>
            <div className="card-info">
              <h2>I am new here</h2>
              <p>Explore our tools and start your verification to join our network.</p>
              <span className="card-action">Join Now <Sparkles size={16} /></span>
            </div>
          </div>
        </div>

        <footer className="selection-footer">
          <p onClick={() => navigate('/welcome')}>Learn more about Hectate</p>
          <div className="footer-badges">
            <span><Users size={14} /> Women-Only</span>
            <span><Shield size={14} /> AI Verified</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
