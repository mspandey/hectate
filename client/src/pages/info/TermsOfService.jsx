import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertTriangle, Scale, Users, ShieldCheck } from 'lucide-react';
import '../../styles/Landing.css';
import LandingNavbar from '../../components/layout/LandingNavbar';
import LandingFooter from '../../components/layout/LandingFooter';

const TermsOfService = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="landing-container terms-page" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <LandingNavbar />
      
      {/* Ultra Premium Ambient Background */}
      <div className="ambient-bg" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 60%)', filter: 'blur(80px)', animation: 'float 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, transparent 60%)', filter: 'blur(100px)', animation: 'float 25s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '40%', left: '-20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)', filter: 'blur(90px)', animation: 'float 22s ease-in-out infinite 2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 0, opacity: 0.5 }}></div>

      <section className="hero-v2" style={{ 
        minHeight: '60vh', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center', 
        position: 'relative', 
        zIndex: 1, 
        paddingTop: '180px',
        paddingBottom: '80px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div className="hero-text-content" style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="premium-badge" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', borderRadius: '100px', 
            background: 'linear-gradient(90deg, rgba(236, 72, 153, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#EC4899', fontSize: '13px', fontWeight: '600', letterSpacing: '1px',
            marginBottom: '32px',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.2), inset 0 0 10px rgba(236, 72, 153, 0.1)'
          }}>
            <ShieldCheck size={16} /> <span>LEGAL AGREEMENT</span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(56px, 8vw, 84px)', 
            marginBottom: '24px',
            fontFamily: 'Playfair Display, serif',
            fontWeight: '800',
            lineHeight: '1.1',
            letterSpacing: '-1px',
            textAlign: 'center',
            color: 'var(--theme-text-primary)'
          }}>
            Terms of <span style={{ 
              background: 'linear-gradient(135deg, #F9A8D4 0%, #D8B4FE 50%, #93C5FD 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>Service</span>
          </h1>
          
          <p style={{ 
            fontSize: '22px', 
            color: 'var(--theme-text-secondary)', 
            margin: '0 auto 40px',
            maxWidth: '600px',
            lineHeight: '1.6',
            fontWeight: '300',
            textAlign: 'center'
          }}>
            By joining Hectate, you enter into a covenant of sisterhood, safety, and mutual respect. Please read these terms carefully.
          </p>
          
          <div style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'var(--glass-panel-bg)',
            borderRadius: '16px',
            border: '1px solid var(--glass-panel-border)',
            fontSize: '14px', color: 'var(--theme-text-secondary)', 
            letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            Last Updated: <span style={{ color: 'var(--theme-text-primary)', marginLeft: '8px', fontWeight: '600' }}>October 12, 2026</span>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 5% 120px', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          display: 'flex',
          flexDirection: 'column', 
          gap: '60px', 
          alignItems: 'stretch',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
        }}>
          
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }} className="terms-content">
            
            {[
              {
                id: 'eligibility',
                icon: CheckCircle,
                title: '1. Eligibility & Verification',
                color: '#EC4899',
                bgGlow: 'rgba(236, 72, 153, 0.15)',
                content: (
                  <>
                    <p style={{ marginBottom: '24px' }}>
                      Hectate is exclusively built for women. To maintain the integrity and safety of our community, verification of gender via our AI-powered Aadhaar analysis is mandatory for access to all community features.
                    </p>
                    <ul className="premium-list">
                      <li>You must be at least 18 years of age to register.</li>
                      <li>You agree to provide accurate and authentic identification documents during the verification process.</li>
                      <li>Any attempt to circumvent or forge verification will result in a permanent network-wide ban.</li>
                    </ul>
                  </>
                )
              },
              {
                id: 'conduct',
                icon: Users,
                title: '2. Community Conduct',
                color: '#3B82F6',
                bgGlow: 'rgba(59, 130, 246, 0.15)',
                content: (
                  <>
                    <p style={{ marginBottom: '24px' }}>
                      We hold our members to the highest standards of empathy and respect. The following conduct is strictly prohibited:
                    </p>
                    <ul className="premium-list">
                      <li><strong>Harassment & Bullying:</strong> Any form of abuse, targeted harassment, or stalking.</li>
                      <li><strong>Doxxing:</strong> Sharing personal data, locations, or private information of other members.</li>
                      <li><strong>Commercial Solicitation:</strong> Spamming or unauthorized advertising within community spaces.</li>
                      <li><strong>Hate Speech:</strong> Discriminatory language based on race, religion, sexual orientation, or disability.</li>
                    </ul>
                  </>
                )
              },
              {
                id: 'content',
                icon: FileText,
                title: '3. Content Ownership',
                color: '#A78BFA',
                bgGlow: 'rgba(167, 139, 250, 0.15)',
                content: (
                  <>
                    <p style={{ marginBottom: '24px' }}>
                      Your voice belongs to you. You retain full ownership of any original content, stories, or advice you post in the Community Feed.
                    </p>
                    <p>
                      However, by posting on Hectate, you grant us a non-exclusive, worldwide, royalty-free license to display, distribute, and protect that content within our secure ecosystem. We will never sell your content to third-party data brokers.
                    </p>
                  </>
                )
              },
              {
                id: 'enforcement',
                icon: AlertTriangle,
                title: '4. Enforcement & Termination',
                color: '#F43F5E',
                bgGlow: 'rgba(244, 63, 94, 0.15)',
                content: (
                  <>
                    <p style={{ marginBottom: '24px' }}>
                      Hectate reserves the right to suspend or permanently terminate any account that violates these terms, with or without prior notice. 
                    </p>
                    <p>
                      In cases of severe violations, particularly those involving physical threats or severe doxxing, we reserve the right to cooperate with local law enforcement agencies to ensure the physical safety of our members.
                    </p>
                  </>
                )
              }
            ].map((section) => (
              <div key={section.id} id={section.id} className="premium-policy-block" style={{ 
                padding: '56px', 
                background: 'var(--policy-card-bg)', 
                borderRadius: '32px', 
                border: '1px solid var(--policy-card-border)', 
                position: 'relative', 
                overflow: 'hidden', 
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--policy-card-shadow)'
              }}>
                {/* Subtle top gradient line */}
                <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `radial-gradient(ellipse at center, ${section.color}80 0%, transparent 70%)` }}></div>
                
                {/* Glowing orb behind icon */}
                <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '120px', background: section.bgGlow, filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '20px', 
                    background: 'var(--glass-panel-bg)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: section.color, 
                    border: '1px solid var(--glass-panel-border)',
                    boxShadow: 'var(--glass-panel-shadow)'
                  }}>
                    <section.icon size={32} strokeWidth={1.5} />
                  </div>
                  <h2 style={{ color: 'var(--theme-text-primary)', margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: '700', letterSpacing: '-0.5px' }}>
                    {section.title}
                  </h2>
                </div>
                <div className="policy-text-content" style={{ textAlign: 'left', color: 'var(--theme-text-secondary)', lineHeight: 1.8, fontSize: '18px', fontWeight: '400', position: 'relative', zIndex: 2 }}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingFooter />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        
        .premium-policy-block {
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .premium-policy-block:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: var(--glass-panel-shadow-hover, 0 20px 40px rgba(0,0,0,0.1));
        }

        .premium-list {
          padding-left: 0;
          list-style: none;
          display: block;
          text-align: left;
        }

        .premium-list li {
          position: relative;
          padding-left: 36px;
          margin-bottom: 16px;
        }

        .premium-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          top: 0;
          color: #9CA3AF;
          font-family: monospace;
          font-size: 20px;
          line-height: 1.5;
          opacity: 0.5;
        }

        .premium-list li strong {
          color: var(--theme-text-primary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default TermsOfService;


