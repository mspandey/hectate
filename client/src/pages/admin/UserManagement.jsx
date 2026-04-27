import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Search, Filter, Download, Eye, ShieldOff, MoreHorizontal, UserCheck, GraduationCap, Camera } from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/admin/users')
        setUsers(data.users)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch users:', err)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      user.alias?.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term) ||
      user.name?.toLowerCase().includes(term) ||
      user.id?.toLowerCase().includes(term)
      
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--admin-accent)', letterSpacing: '2px', fontSize: '12px' }}>
      DECRYPTING_USER_DATABASE...
    </div>
  )

  return (
    <div className="user-management">
      <header style={{ marginBottom: '32px' }}>
        <h2 className="cyber-title" style={{ fontSize: '24px' }}>USER_REGISTRY</h2>
        <p style={{ color: 'var(--admin-text-dim)', fontSize: '12px', letterSpacing: '1px' }}>MANAGING {users.length} ACTIVE_CENTRAL_IDENTITIES</p>
      </header>

      <div className="management-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        gap: '20px'
      }}>
        <div className="search-bar" style={{ 
          position: 'relative', 
          flex: 1, 
          maxWidth: '400px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--admin-border)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px'
        }}>
          <Search size={16} style={{ color: 'var(--admin-text-dim)' }} />
          <input 
            type="text" 
            placeholder="FILTER_IDENTITIES..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              padding: '12px',
              fontSize: '13px',
              width: '100%',
              outline: 'none',
              fontFamily: 'monospace'
            }}
          />
        </div>
        
        <div className="filter-actions" style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={14} style={{ position: 'absolute', left: '12px', color: 'var(--admin-accent)' }} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                color: '#fff',
                padding: '10px 12px 10px 36px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none'
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Blocked">Blocked</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          
          <button className="cyber-btn" style={{ padding: '10px 20px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={14} /> EXPORT_DATA
          </button>
        </div>
      </div>

      <div className="glass-metric-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>ID</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>IDENTITY</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>REAL_NAME</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>EMAIL_ADDR</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>GENDER</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>DATE_JOINED</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>V_VECTOR</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>STATUS</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '10px', color: 'var(--admin-text-dim)', letterSpacing: '1px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 24px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--admin-accent)' }}>{user.id.slice(0, 8).toUpperCase()}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>@{user.alias || 'anonymous'}</div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--admin-text-dim)' }}>{user.name || '—'}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--admin-text-dim)' }}>{user.email}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--admin-text-dim)', textTransform: 'capitalize' }}>{user.gender || '—'}</td>
                <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--admin-text-dim)' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--admin-accent)' }}>
                    {user.verificationMethod === 'aadhaar' ? <UserCheck size={16} /> : 
                     user.verificationMethod === 'college_id' ? <GraduationCap size={16} /> : 
                     <Camera size={16} />}
                    <span style={{ fontSize: '11px', textTransform: 'uppercase' }}>{user.verificationMethod}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span className={`status-pill ${user.status}`} style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Link to={`/admin/users/${user.id}`} title="View Dossier" style={{ color: 'var(--admin-text-dim)', padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)' }}>
                      <Eye size={16} />
                    </Link>
                    <button title="Neutralize Access" onClick={() => {}} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}>
                      <ShieldOff size={16} />
                    </button>
                    <button title="More Actions" style={{ background: 'none', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer' }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-dim)' }}>
            <div style={{ fontSize: '14px', letterSpacing: '2px' }}>NO_IDENTITIES_MATCH_QUERY</div>
          </div>
        )}
      </div>

      <div className="pagination" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--admin-text-dim)' }}>
        <div>RECORD_SET: {filteredUsers.length} of {users.length}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="cyber-btn" style={{ padding: '6px 12px', fontSize: '10px' }} disabled>PREV</button>
          <button className="cyber-btn" style={{ padding: '6px 12px', fontSize: '10px' }}>NEXT</button>
        </div>
      </div>
    </div>
  )
}
