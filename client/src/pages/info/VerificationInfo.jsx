import React from 'react';
import { Link } from 'react-router-dom';
import { Fingerprint, Cpu, ShieldCheck, UserCheck, Eye, Smartphone } from 'lucide-react';
import '../../styles/Landing.css';
import LandingNavbar from '../../components/layout/LandingNavbar';

const VerificationInfo = () => {
  return (
    <div className="landing-container">
      <LandingNavbar />

      <section className="hero-v2">
        <div className="hero-text-content">
          <div className="hero-badge">
            <Cpu size={16} /> <span>Advanced AI Security</span>
          </div>
          <h1 className="hero-title-v2">
            The <span className="gradient-text">Identity</span> <br />
            Gate.
          </h1>
          <p className="hero-description-v2">
            Our multi-stage verification system combines Aadhaar OCR with real-time AI facial recognition to ensure 100% of our members are women.
          </p>
          <div className="hero-cta-v2">
            <Link to="/join" className="btn-primary">Verify Your Identity</Link>
          </div>
        </div>

        <div className="hero-visual-v2">
          <div className="hero-images">
            <img src="/images/verification/hero.png" alt="Biometric Verification" className="main-img" />
          </div>
        </div>
      </section>

      <section className="section-v2">
        <div className="content-centered">
          <h2 className="section-title">The <span className="gradient-text">Hectate Standard</span></h2>
          <p className="section-sub">Why we verify every single member.</p>
          
          <div className="feature-list-centered">
            <div className="feature-item">
              <div className="social-icon">
                <Smartphone size={24} />
              </div>
              <h3>Aadhaar OCR</h3>
              <p>Instant data extraction from official IDs to verify name, age, and gender markers.</p>
            </div>
            <div className="feature-item">
              <div className="social-icon">
                <Eye size={24} />
              </div>
              <h3>Face Recognition</h3>
              <p>Real-time AI analysis compares your live selfie with your ID document to prevent fraud.</p>
            </div>
            <div className="feature-item">
              <div className="social-icon">
                <ShieldCheck size={24} />
              </div>
              <h3>Privacy Vault</h3>
              <p>All sensitive documents are deleted immediately after verification. We only store a 'Verified' status.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-v2">
        <div className="verify-banner-v2">
          <div className="verify-bg-glow"></div>
          <h2 className="banner-title gradient-text">Zero Compromise.</h2>
          <p className="banner-text">
            A verified community is a safe community. By ensuring every member is exactly who they say they are, we eliminate the primary source of online threats.
          </p>
          <Link to="/join" className="btn-secondary">Get Verified</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3 className="footer-logo">HECTATE</h3>
            <p className="footer-tagline">
              Hectate — Where your safety isn't optional. 
              The first 100% verified space for women.
            </p>
          </div>
          <div className="footer-links">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/about/feed">Community Feed</Link></li>
              <li><Link to="/about/lawyers">Lawyer Directory</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Trust</h4>
            <ul>
              <li><Link to="/about/verification">Verification Guide</Link></li>
              <li><Link to="/about/privacy">Privacy Policy</Link></li>
              <li><Link to="/about/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Contact</h4>
            <ul>
              <li>hectate2026@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          © 2024 HECTATE INDIA. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default VerificationInfo;
