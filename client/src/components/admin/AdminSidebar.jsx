import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Scale, 
  History, 
  Settings,
  LogOut,
  Cpu
} from 'lucide-react'

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: BarChart3 },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Verify Queue', path: '/admin/verification-queue', icon: ShieldCheck },
  { name: 'Flagged Content', path: '/admin/flagged-content', icon: AlertTriangle },
  { name: 'Lawyer Review', path: '/admin/lawyers', icon: Scale },
  { name: 'Audit Log', path: '/admin/audit-log', icon: History },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ admin, onLogout }) {
  const location = useLocation()

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo"></div>
        <span>HECATE</span>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
              {isActive && <div className="nav-active-indicator"></div>}
            </Link>
          )
        })}
      </nav>

      <div className="system-node-status">
        <div className="status-header">
          <div className="status-label">
            <Cpu size={12} />
            <span>NODE_01_ACTIVE</span>
          </div>
          <div className="status-indicator"></div>
        </div>
        
        <div className="admin-id-label">
          ADMIN_ID: {admin?.id?.slice(0, 8).toUpperCase()}
        </div>

        <button 
          className="btn-terminate"
          onClick={onLogout} 
        >
          <LogOut size={14} />
          <span>TERMINATE_SESSION</span>
        </button>
      </div>
    </aside>
  )
}
