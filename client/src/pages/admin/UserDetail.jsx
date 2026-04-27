import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UserDetail() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockReason, setBlockReason] = useState('')
  const [blockDuration, setBlockDuration] = useState('permanent')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`/api/admin/users/${id}`)
        setUser(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch user:', err)
      }
    }
    fetchUser()
  }, [id])

  const handleBlock = async () => {
    try {
      await axios.post(`/api/admin/users/${id}/block`, {
        reason: blockReason,
        duration: blockDuration,
        notify: true
      })
      setShowBlockModal(false)
      // Refresh user data
      const { data } = await axios.get(`/api/admin/users/${id}`)
      setUser(data)
    } catch (err) {
      alert('Block failed: ' + (err.response?.data?.error || 'Unknown error'))
    }
  }

  const handleUnblock = async () => {
    try {
      await axios.post(`/api/admin/users/${id}/unblock`)
      // Refresh user data
      const { data } = await axios.get(`/api/admin/users/${id}`)
      setUser(data)
    } catch (err) {
      alert('Unblock failed')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you absolutely sure you want to delete this user? This action cannot be undone and will permanently erase their data.')) {
      try {
        await axios.delete(`/api/admin/users/${id}`)
        alert('User deleted successfully')
        navigate('/admin/users')
      } catch (err) {
        alert('Failed to delete user: ' + (err.response?.data?.error || 'Unknown error'))
      }
    }
  }

  if (loading) return <div className="admin-loading">🛡️ Loading User Data...</div>

  return (
    <div className="user-detail">
      <div className="detail-nav">
        <Link to="/admin/users" className="back-link">← Back to Users</Link>
        <span className="user-title">User #{user.id.slice(0, 4)}</span>
        {user.status === 'active' ? (
          <button className="block-btn" onClick={() => setShowBlockModal(true)}>Block User</button>
        ) : (
          <button className="unblock-btn" onClick={handleUnblock}>Unblock User</button>
        )}
      </div>

      <div className="detail-grid">
        <div className="detail-section profile">
          <h3>PROFILE</h3>
          <div className="info-card">
            <p><strong>@alias:</strong> {user.alias || 'Anonymous'}</p>
            <p><strong>Real Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.mobileNumber || '—'}</p>
            <p><strong>Gender:</strong> <span style={{ textTransform: 'capitalize' }}>{user.gender || '—'}</span></p>
            <p><strong>DOB:</strong> {user.dob ? new Date(user.dob).toLocaleDateString() : '—'}</p>
            <p><strong>City/State:</strong> {user.cityState || '—'}</p>
            <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role || 'User'}</span></p>
            <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className={`status-pill ${user.status}`}>{user.status.toUpperCase()}</span></p>
          </div>
        </div>

        <div className="detail-section verify">
          <h3>VERIFICATION</h3>
          <div className="info-card">
            <p><strong>Method:</strong> {user.verificationMethod || 'None'}</p>
            <p><strong>Status:</strong> {user.verified ? '✅ Verified' : '⏳ Pending'}</p>
            <p><strong>Aadhaar hash:</strong> {user.aadhaarHash ? user.aadhaarHash.slice(0, 8) + '...' : '—'}</p>
            <p><strong>Gender check:</strong> {user.gender === 'female' ? 'F ✅' : (user.gender ? `${user.gender.toUpperCase()} ⚠️` : '—')}</p>
            <button className="link-btn">[View S3 ↗]</button>
          </div>
        </div>

        <div className="detail-section security">
          <h3>SECURITY</h3>
          <div className="info-card">
            <p><strong>2FA:</strong> {user.totpSecret ? '✅ Enabled' : '❌ Disabled'}</p>
            <p><strong>Failed logins:</strong> {user.failedLoginAttempts || 0}</p>
          </div>
        </div>
      </div>

      <div className="user-history">
        <h3>POSTS ({user.posts?.length || 0} total)</h3>
        <div className="history-list">
          {user.posts?.map(post => (
            <div key={post.id} className="history-item">
              <span className="post-id">#{post.id.slice(0, 4)}</span>
              <span className="post-content">"{post.content.slice(0, 30)}..."</span>
              <span className="post-stat">💜{post.flagCount || 0}</span>
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-actions-bar">
        <button className="reset-pwd-btn">Reset Password</button>
        <button className="delete-acc-btn" onClick={handleDelete} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>Delete Account</button>
        <button className="export-data-btn">Download Full Data Export</button>
      </div>

      {showBlockModal && (
        <div className="modal-overlay">
          <div className="block-modal">
            <h3>Block User #{user.id.slice(0, 4)}</h3>
            <div className="form-group">
              <label>Reason (required):</label>
              <select value={blockReason} onChange={(e) => setBlockReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option value="Fraudulent verification">Fraudulent verification</option>
                <option value="Harassment">Harassment</option>
                <option value="Spam">Spam</option>
                <option value="Violating terms">Violating platform terms</option>
              </select>
            </div>
            <div className="form-group">
              <label>Block duration:</label>
              <select value={blockDuration} onChange={(e) => setBlockDuration(e.target.value)}>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowBlockModal(false)}>Cancel</button>
              <button className="confirm-block-btn" onClick={handleBlock}>Confirm Block 🔴</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
