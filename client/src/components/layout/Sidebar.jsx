import { NavLink, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { Home, Scale, ShieldAlert, User, LogOut, Shield, MessageCircle } from 'lucide-react'
import { AuthContext } from '../../store/AuthContext'

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/feed', icon: MessageCircle, label: 'Community' },
    { to: '/lawyers', icon: Scale, label: 'Lawyers' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <aside className="sidebar" id="main-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Shield size={20} />
        </div>
        <span className="sidebar-name">hectate</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.alias?.[0]?.toUpperCase() || 'H'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-handle">@{user?.alias || 'anon'}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}
