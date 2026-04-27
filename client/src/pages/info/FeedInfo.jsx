import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Lock, EyeOff, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import '../../styles/Landing.css';
import LandingNavbar from '../../components/layout/LandingNavbar';

const FeedInfo = () => {
  return (
    <div className="landing-container">
      <LandingNavbar />

      <section className="hero-v2">
        <div className="hero-text-content">
          <div className="hero-badge">
            <Sparkles size={16} /> <span>Unfiltered & Protected</span>
          </div>
          <h1 className="hero-title-v2">
            The <span className="gradient-text">Sanctuary</span> <br />
            Feed.
          </h1>
          <p className="hero-description-v2">
            A secure digital space where every participant is a verified woman. No trolls, no bots, no harassment. Just pure community.
          </p>
          <div style={{display:'flex', gap:20, marginTop:20}}>
            <Link to="/join" className="btn-primary">Enter the Sanctuary</Link>
          </div>
        </div>

        <div className="hero-visual-v2">
          <div className="hero-images">
            <img src="/images/feed/hero_clean.png" alt="Community Feed" className="main-img" />
          </div>
        </div>
      </section>

      <section className="section-v2" style={{backgroundColor: 'transparent'}}>
        <div className="content-centered">
          <h2 className="section-title">Pure <span className="gradient-text">Communication</span></h2>
          <p className="section-sub">Free expression protected by advanced identity protocols.</p>
          
          <div className="feature-list-centered">
            <div className="feature-item">
              <div className="social-icon" style={{background: 'var(--maroon-light)', marginBottom: 20}}>
                <ShieldCheck size={24} />
              </div>
              <h3>100% Verified</h3>
              <p>Every profile is verified via Aadhaar and AI facial recognition before entry.</p>
            </div>
            <div className="feature-item">
              <div className="social-icon" style={{background: 'var(--maroon-light)', marginBottom: 20}}>
                <EyeOff size={24} />
              </div>
              <h3>Anonymity Options</h3>
              <p>Post sensitive stories or seek advice with complete pseudonymous protection.</p>
            </div>
            <div className="feature-item">
              <div className="social-icon" style={{background: 'var(--maroon-light)', marginBottom: 20}}>
                <Lock size={24} />
              </div>
              <h3>Zero External Access</h3>
              <p>Content cannot be shared, screenshotted, or indexed by search engines.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-v2" style={{background: 'transparent'}}>
        <div className="verify-banner-v2">
          <div className="verify-bg-glow"></div>
          <h2 className="gradient-text" style={{fontFamily:'Playfair Display', fontSize:48, marginBottom:20}}>More than just a Feed.</h2>
          <p style={{color:'var(--text-secondary)', maxWidth:600, margin:'0 auto 40px'}}>
            Join thousands of women across India sharing opportunities, health advice, and mutual support in a space built exclusively for them.
          </p>
          <Link to="/join" className="btn-pink">Start Connecting</Link>
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

export default FeedInfo;
