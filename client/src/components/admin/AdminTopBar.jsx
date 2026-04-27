import { Search, Bell, Shield, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminTopBar({ admin, hasNotifications, onMarkRead }) {
  const navigate = useNavigate()

  const handleNotificationClick = () => {
    onMarkRead()
    navigate('/admin/alerts')
  }
  return (
    <header style={{
      height: '64px',
      background: 'rgba(3, 7, 18, 0.5)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--admin-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div className="search-command" style={{ position: 'relative', width: '320px' }}>
        <Search 
          size={16} 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-dim)' }} 
        />
        <input 
          type="text" 
          placeholder="RUN_COMMAND (ALT+K)"
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '6px',
            padding: '8px 12px 8px 36px',
            color: '#fff',
            fontSize: '11px',
            letterSpacing: '1px',
            fontFamily: 'monospace'
          }}
        />
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={handleNotificationClick}
            title={hasNotifications ? "View new activity" : "Nothing to see yet"}
            style={{ background: 'none', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer', position: 'relative' }}
          >
            <Bell size={18} />
            {hasNotifications && (
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }}></div>
            )}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer' }}>
            <Shield size={18} />
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--admin-border)' }}></div>

        <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{admin?.name?.toUpperCase() || 'OFFICER'}</div>
            <div style={{ fontSize: '10px', color: 'var(--admin-accent)', letterSpacing: '1px' }}>
              LEVEL_4_{admin?.role?.toUpperCase()}
            </div>
          </div>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--admin-purple), var(--admin-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <User size={18} color="#030712" />
          </div>
        </div>
      </div>
    </header>
  )
}
