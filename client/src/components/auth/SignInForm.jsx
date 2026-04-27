import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function SignInForm({ onSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/login', { identifier, password });
      // 2FA bypassed as per user request
      onSuccess(data.user
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2 style={{ fontSize: 28, marginBottom: 32 }}>Welcome back 💜</h2>
      
      {error && <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, color: 'var(--error)', marginBottom: 20, fontSize: 14 }}>{error}</div>}

      <div className="auth-form-group">
        <label className="auth-label">Email or phone *</label>
        <input 
          type="text" 
          className="auth-input" 
          value={identifier} 
          onChange={e => setIdentifier(e.target.value)} 
          required 
          placeholder="e.g. priya@example.com"
        />
      </div>

      <div className="auth-form-group">
        <label className="auth-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Password *</span>
          <a href="#" style={{ color: 'var(--rose)', fontWeight: 500 }}>Forgot?</a>
        </label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            className="auth-input" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            style={{ paddingRight: '44px' }}
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}
