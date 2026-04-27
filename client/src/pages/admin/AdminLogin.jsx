import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../styles/admin.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEnteringPortal, setIsEnteringPortal] = useState(false)
  const [portalStatus, setPortalStatus] = useState('INITIALIZING_SECURE_LINK...')
  const [isOpening, setIsOpening] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post('/api/admin/auth/login', { email, password })
      
      // TRIGGER REVERTED SHUTTER PORTAL REVEAL
      setIsEnteringPortal(true)
      setPortalStatus('AUTHENTICATING_SYSTEM_ACCESS...')
      
      setTimeout(() => setPortalStatus('STABILIZING_ACCESS_PORTAL...'), 700)
      setTimeout(() => {
        setPortalStatus('ACCESS_GRANTED. OPENING_PORTAL...')
        setIsOpening(true)
      }, 1500)
      
      setTimeout(() => {
        navigate('/admin')
      }, 2600)
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed')
      setLoading(false)
    }
  }

  if (isEnteringPortal) {
    return (
      <div className={`portal-entry-overlay ${isOpening ? 'opening' : ''}`}>
        <div className="portal-shutter-left">
          <div className="shutter-detail"></div>
        </div>
        <div className="portal-shutter-right">
          <div className="shutter-detail"></div>
        </div>
        
        <div className="portal-load-status" style={{ opacity: isOpening ? 0 : 1 }}>
          <div className="status-glitch-text" data-text="HECATE">HECATE</div>
          <div className="portal-status-progress">{portalStatus}</div>
        </div>
      </div>
    )
  }



  return (
    <div className="admin-body">
      <div className="admin-login-page">
        <div className="cyber-login-box">
          <div className="admin-login-header">
            <h1>HECATE</h1>
            <p>Admin Access Portal</p>
          </div>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {error && <div style={{ color: '#ef4444', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
            
            <div className="cyber-field">
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--admin-accent)', marginBottom: '8px', letterSpacing: '1px' }}>IDENTIFY (EMAIL)</label>
              <input 
                type="email" 
                className="cyber-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hectate.app"
                required
              />
            </div>

            <div className="cyber-field">
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--admin-accent)', marginBottom: '8px', letterSpacing: '1px' }}>SECURE KEY (PASSWORD)</label>
              <input 
                type="password" 
                className="cyber-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button type="submit" className="cyber-btn" disabled={loading}>
              {loading ? 'AUTHENTICATING...' : 'ESTABLISH_CONNECTION'}
            </button>
          </form>
          
          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>
            BYPASS_2FA_ENABLED // DEV_MODE
          </div>
        </div>
      </div>
    </div>
  )
}
