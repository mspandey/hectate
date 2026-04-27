import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../components/auth/SignInForm';
import { Shield, Lock, Users } from 'lucide-react';
import { AuthContext } from '../store/AuthContext';
import '../styles/auth.css';

export default function Auth() {
  const nav = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSuccess = (user) => {
    login(user);
    nav('/feed');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* LEFT PANEL: Branding & Trust (Desktop mostly) */}
        <div className="auth-left">
          <div>
            <div className="auth-logo" onClick={() => nav('/welcome')} style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
              <div style={{ background: 'var(--rose)', color: 'white', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>H</div>
              Hectate
            </div>
            
            <h1>A safe space built <i>for you, by you.</i></h1>
            
            <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 40, maxWidth: 320 }}>
              Join the largest network of verified women in India. Connect, find trusted legal aid, and keep each other safe.
            </p>

            <div className="trust-badges">
              <div className="trust-badge"><Lock size={20} /> Encrypted & secure storage</div>
              <div className="trust-badge"><Shield size={20} /> Anonymous alias options</div>
              <div className="trust-badge" style={{ color: 'var(--success)' }}><Users size={20} color="var(--success)" /> Strictly women-only</div>
            </div>
          </div>
          
          <div style={{ color: 'var(--muted)', fontSize: 13, display: 'flex', gap: 16 }}>
            <a href="#" style={{ textDecoration: 'underline' }}>Privacy Promise</a>
            <a href="#" style={{ textDecoration: 'underline' }}>Terms of Use</a>
          </div>
        </div>

        {/* RIGHT PANEL: The Active Form */}
        <div className="auth-right">
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            <div style={{ animation: 'fadeIn 0.4s' }}>
              <SignInForm onSuccess={handleSuccess} />
              <div style={{ textAlign: 'center', marginTop: 32, padding: '24px 0', borderTop: '1px solid var(--slate-100)' }}>
                <p style={{ color: 'var(--slate-500)', fontSize: 14, marginBottom: 16 }}>
                  New to Hectate? You must pass verification.
                </p>
                <button 
                  onClick={() => nav('/join')} 
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Shield size={18} /> Join via Verification
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
