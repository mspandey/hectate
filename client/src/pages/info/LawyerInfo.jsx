import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Gavel, FileText, Bookmark, ArrowRight, Shield } from 'lucide-react';
import '../../styles/Landing.css';
import LandingNavbar from '../../components/layout/LandingNavbar';

const LawyerInfo = () => {
  return (
    <div className="landing-container">
      <LandingNavbar />

      <section className="hero-v2">
        <div className="hero-text-content">
          <div className="hero-badge">
            <Scale size={16} /> <span>Legal Advocacy</span>
          </div>
          <h1 className="hero-title-v2">
            The <span className="gradient-text">Justice</span> <br />
            Advocates.
          </h1>
          <p className="hero-description-v2">
            Direct access to pro-bono and professional female legal experts specializing in women's rights, workplace harassment, and domestic law.
          </p>
          <div style={{display:'flex', gap:20, marginTop:20}}>
            <Link to="/join" className="btn-primary">Get Legal Support</Link>
          </div>
        </div>

        <div className="hero-visual-v2">
          <div className="hero-images">
            <img src="/images/lawyer/hero.png" alt="Legal Support" className="main-img" />
          </div>
        </div>
      </section>

      <section className="section-v2" style={{backgroundColor: 'transparent'}}>
        <div className="content-centered">
          <h2 className="section-title">Bridging the <span className="gradient-text">Justice Gap</span></h2>
          <p className="section-sub">Empowering women with knowledge and professional representation.</p>
          
          <div className="feature-list-centered">
            <div className="feature-item">
              <div className="social-icon" style={{background: 'var(--maroon-light)', marginBottom: 20}}>
                <Gavel size={24} />
              </div>
              <h3>Expert Directory</h3>
              <p>Filter by specialization, location, and language to find the right advocate for you.</p>
            </div>
            <div className="feature-item">
              <div className="social-icon" style={{background: 'var(--maroon-light)', marginBottom: 20}}>
                <FileText size={24} />
              </div>
              <h3>Know Your Rights</h3>
              <p>Curated legal libraries explaining your rights in simple, actionable terms.</p>
            </div>
            <div className="feature-item">
              <div className="social-icon" style={{background: 'var(--maroon-light)', marginBottom: 20}}>
                <Shield size={24} />
              </div>
              <h3>Secure Consults</h3>
              <p>End-to-end encrypted messaging for initial consultations and document sharing.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-v2" style={{background: 'transparent'}}>
        <div className="verify-banner-v2">
          <div className="verify-bg-glow"></div>
          <h2 className="gradient-text" style={{fontFamily:'Playfair Display', fontSize:48, marginBottom:20}}>Justice shouldn't be a privilege.</h2>
          <p style={{color:'var(--text-secondary)', maxWidth:600, margin:'0 auto 40px'}}>
            Hectate partners with leading NGOs and legal firms to provide free initial counseling and sliding-scale representation for those in need.
          </p>
          <Link to="/join" className="btn-secondary">View the Directory</Link>
        </div>
      </section>

      <footer style={{padding:'80px 5%', background:'transparent', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:60}}>
          <div>
            <h3 style={{fontFamily:'Playfair Display', fontSize:24, marginBottom:20}}>HECTATE</h3>
            <p style={{color:'var(--text-gray)', fontSize:14, lineHeight:1.6, maxWidth:300}}>
              Hectate — Where your safety isn't optional. 
              The first 100% verified space designed for women.
            </p>
          </div>
          <div>
            <h4 style={{marginBottom:20}}>Platform</h4>
            <ul style={{listStyle:'none', color:'var(--text-secondary)', fontSize:14, display:'flex', flexDirection:'column', gap:12}}>
              <li><Link to="/about/feed" style={{color:'inherit', textDecoration:'none'}}>Community Feed</Link></li>
              <li><Link to="/about/lawyers" style={{color:'inherit', textDecoration:'none'}}>Lawyer Directory</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{marginBottom:20}}>Trust</h4>
            <ul style={{listStyle:'none', color:'var(--text-secondary)', fontSize:14, display:'flex', flexDirection:'column', gap:12}}>
              <li><Link to="/about/verification" style={{color:'inherit', textDecoration:'none'}}>Verification Guide</Link></li>
              <li><Link to="/about/privacy" style={{color:'inherit', textDecoration:'none'}}>Privacy Policy</Link></li>
              <li><Link to="/about/terms" style={{color:'inherit', textDecoration:'none'}}>Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{marginBottom:20}}>Contact</h4>
            <ul style={{listStyle:'none', color:'var(--text-secondary)', fontSize:14, display:'flex', flexDirection:'column', gap:12}}>
              <li>hectate2026@gmail.com</li>
            </ul>
          </div>
        </div>
        <div style={{marginTop:80, paddingTop:40, borderTop:'1px solid rgba(255,255,255,0.05)', textAlign:'center', color:'var(--text-gray)', fontSize:12, letterSpacing:2}}>
          © 2024 HECTATE INDIA. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

export default LawyerInfo;
