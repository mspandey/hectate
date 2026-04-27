import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import '../../styles/Landing.css';
import LandingNavbar from '../../components/layout/LandingNavbar';
import LandingFooter from '../../components/layout/LandingFooter';

const TermsOfService = () => {
  return (
    <div className="landing-container">
      <LandingNavbar />

      <section className="hero-v2" style={{minHeight: '40vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
        <div className="hero-text-content" style={{maxWidth: 800, margin: '0 auto'}}>
          <div className="hero-badge" style={{margin: '0 auto 20px'}}>
            <FileText size={16} /> <span>Community Contract</span>
          </div>
          <h1 className="hero-title-v2" style={{fontSize: 64}}>
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="hero-description-v2">
            By joining hectate, you enter into a covenant of sisterhood, safety, and mutual respect.
          </p>
        </div>
      </section>

      <section className="section-v2" style={{backgroundColor: 'transparent'}}>
        <div className="content-centered" style={{maxWidth: 900, textAlign: 'left'}}>
          <div className="policy-block" style={{marginBottom: 60, padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'}}>
            <h2 style={{color: 'white', marginBottom: 20, fontFamily: 'Playfair Display', display: 'flex', alignItems: 'center', gap: 15}}>
              <CheckCircle className="gradient-text" size={28} /> 1. Eligibility
            </h2>
            <p style={{color: 'var(--text-gray)', lineHeight: 1.8, fontSize: 16}}>
              hectate is exclusively for women. Verification of gender via our AI-powered Aadhaar analysis is mandatory for access to all community features.
            </p>
          </div>

          <div className="policy-block" style={{marginBottom: 60, padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'}}>
            <h2 style={{color: 'white', marginBottom: 20, fontFamily: 'Playfair Display', display: 'flex', alignItems: 'center', gap: 15}}>
              <AlertTriangle className="gradient-text" size={28} /> 2. Prohibited Conduct
            </h2>
            <p style={{color: 'var(--text-gray)', lineHeight: 1.8, fontSize: 16}}>
              Harassment, stalking, commercial solicitation, or sharing of personal data belonging to other members is strictly prohibited and will result in immediate and permanent expulsion.
            </p>
          </div>



          <div className="policy-block" style={{marginBottom: 60, padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)'}}>
            <h2 style={{color: 'white', marginBottom: 20, fontFamily: 'Playfair Display', display: 'flex', alignItems: 'center', gap: 15}}>
              <FileText className="gradient-text" size={28} /> 3. Content Ownership
            </h2>
            <p style={{color: 'var(--text-gray)', lineHeight: 1.8, fontSize: 16}}>
              You retain ownership of the content you post in the Community Feed. However, by posting, you grant hectate a license to display that content within our protected ecosystem.
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default TermsOfService;
