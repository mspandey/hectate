import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Camera, MessageCircle } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3 className="footer-logo">HECTATE</h3>
          <p className="footer-tagline">
            Hectate — Where your safety isn't optional. 
            The first 100% verified space designed for women.
          </p>
          <div className="footer-socials">
            <Camera size={20} className="social-icon" />
            <MessageCircle size={20} className="social-icon" />
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/about/feed">Community Feed</Link></li>
              <li><Link to="/about/lawyers">Lawyer Directory</Link></li>
              <li><Link to="/about/verification">Verification Guide</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Trust</h4>
            <ul>
              <li><Link to="/about/privacy">Privacy Policy</Link></li>
              <li><Link to="/about/terms">Terms of Service</Link></li>
              <li><Link to="/about/safety">Safety Standards</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hectate2026@gmail.com"><Mail size={14} /> hectate2026@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 HECTATE INDIA. ALL RIGHTS RESERVED. BUILT FOR SAFETY.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;
