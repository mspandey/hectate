import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import '../../styles/admin.css'

export default function AdminLayout() {
  const [admin, setAdmin] = useState(null)
  const [error, setError] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isEntering, setIsEntering] = useState(true)
  const [hasNotifications, setHasNotifications] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Clear entering state after animation completes
    const timer = setTimeout(() => setIsEntering(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/api/admin/auth/me')
        setAdmin(data.user)
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
          navigate('/admin/login')
        } else {
          setError(err.message)
        }
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [navigate])

  useEffect(() => {
    if (!admin) return

    const checkNotifications = async () => {
      try {
        const { data } = await axios.get('/api/admin/alerts')
        if (data && data.length > 0) {
          const currentCount = data.length
          const lastAlertCount = parseInt(localStorage.getItem('lastAlertCount') || '0')
          
          if (currentCount > lastAlertCount) {
            setHasNotifications(true)
          }
          setAlertCount(currentCount)
        } else {
          setHasNotifications(false)
          setAlertCount(0)
        }
      } catch (err) {
        console.error('Failed to check notifications:', err)
      }
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 10000)
    return () => clearInterval(interval)
  }, [admin, location.pathname])

  const handleMarkRead = () => {
    localStorage.setItem('lastAlertCount', alertCount.toString())
    setHasNotifications(false)
  }

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/auth/logout')
      navigate('/admin/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (error) return (
    <div className="admin-body" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#030712',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ color: '#ef4444', letterSpacing: '2px', fontSize: '12px' }}>SYSTEM_ERROR: {error}</div>
      <button onClick={() => navigate('/admin/login')} style={{ background: 'transparent', border: '1px solid var(--admin-accent)', color: 'var(--admin-accent)', padding: '8px 16px', cursor: 'pointer', fontSize: '11px', letterSpacing: '2px' }}>RETURN_TO_LOGIN</button>
    </div>
  )

  if (isCheckingAuth) return (
    <div className="admin-body" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#030712'
    }}>
      <div className="admin-loading" style={{ color: 'var(--admin-accent)', letterSpacing: '4px', fontSize: '12px' }}>
        ESTABLISHING_SECURE_TUNNEL...
      </div>
    </div>
  )

  if (!admin) return null;

  return (
    <div className="admin-body">
      <AdminSidebar admin={admin} onLogout={handleLogout} />
      
      <div className={`admin-layout-main ${isEntering ? 'entering' : ''}`}>
        <AdminTopBar 
          admin={admin} 
          hasNotifications={hasNotifications} 
          onMarkRead={handleMarkRead}
        />

        <main className="admin-content-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
