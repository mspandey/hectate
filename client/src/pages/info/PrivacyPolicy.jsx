import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import '../../styles/Landing.css';
import LandingNavbar from '../../components/layout/LandingNavbar';
import LandingFooter from '../../components/layout/LandingFooter';

const PrivacyPolicy = () => {
  return (
    <div className="landing-container">
      <LandingNavbar />

      <section className="hero-v2" style={{minHeight: '40vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div className="hero-text-content" style={{maxWidth: 800, margin: '0 auto'}}>
          <div className="hero-badge" style={{margin: '0 auto 20px'}}>
            <Lock size={16} /> <span>Security First</span>
          </div>
          <h1 className="hero-title-v2" style={{fontSize: 64}}>
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="hero-description-v2">
            Your data is your sanctuary. We protect it with the highest standards of encryption and anonymity.
          </p>
        </div>
      </section>

      <section className="section-v2" style={{backgroundColor: 'transparent'}}>
        <div className="content-centered" style={{maxWidth: 900, textAlign: 'left'}}>
          <div className="policy-block" style={{marginBottom: 60}}>
            <h2 style={{color: 'white', marginBottom: 20, fontFamily: 'Playfair Display'}}>1. Data Minimization</h2>
            <p style={{color: 'var(--text-gray)', lineHeight: 1.8, fontSize: 16}}>
              At hectate, we only collect what is strictly necessary for your safety. Your Aadhaar details are processed via an encrypted gateway and never stored on our central servers after verification.
            </p>
          </div>

          <div className="policy-block" style={{marginBottom: 60}}>
            <h2 style={{color: 'white', marginBottom: 20, fontFamily: 'Playfair Display'}}>2. Zero-Knowledge Identity</h2>
            <p style={{color: 'var(--text-gray)', lineHeight: 1.8, fontSize: 16}}>
              Our community feed utilizes alias-based identities. While you are verified, your public presence is entirely anonymous to prevent digital stalking and harassment.
            </p>
          </div>



          <div className="policy-block" style={{marginBottom: 60}}>
            <h2 style={{color: 'white', marginBottom: 20, fontFamily: 'Playfair Display'}}>3. No Third-Party Selling</h2>
            <p style={{color: 'var(--text-gray)', lineHeight: 1.8, fontSize: 16}}>
              hectate is a sanctuary, not a marketplace. We do not sell your personal information or behavioral data to advertisers or third-party data brokers.
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;
