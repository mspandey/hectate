import { useState, useEffect } from 'react'
import axios from 'axios'
import { Flag, Trash2, CheckCheck, RefreshCw, AlertTriangle, User, MessageSquare, ShieldAlert } from 'lucide-react'

function FlagBadge({ count, type = 'flags' }) {
  const color = count >= 10 ? '#ef4444' : count >= 5 ? '#f59e0b' : '#f97316'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px',
      background: `${color}18`, border: `1px solid ${color}44`,
      color, fontSize: '11px', fontWeight: 700
    }}>
      {type === 'flags' ? <Flag size={11} /> : <AlertTriangle size={11} />} {count} {type.toUpperCase()}
    </span>
  )
}

function PostCard({ post, onDismiss, onRemove, isCommunity = false }) {
  const [expanded, setExpanded]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const handleDismiss = async () => {
    setLoading(true)
    await onDismiss(post.id, isCommunity)
    setLoading(false)
  }

  const handleRemove = async () => {
    setLoading(true)
    await onRemove(post.id, isCommunity)
    setLoading(false)
    setConfirmRemove(false)
  }

  const truncated = post.content.length > 180 && !expanded
  const authorName = isCommunity ? post.authorName : (post.user?.name || 'Unknown')
  const authorHandle = isCommunity ? post.authorHandle : `@${post.user?.alias || 'deleted_user'}`
  const timestamp = isCommunity ? post.timestamp : post.createdAt
  const flagCount = isCommunity ? (post.isFlagged ? 'AI_FLAGGED' : 'REPORTED') : post.flagCount

  return (
    <div style={{
      background: 'rgba(17,24,39,0.7)',
      border: `1px solid ${(!isCommunity && post.flagCount >= 10) || (isCommunity && post.isFlagged) ? 'rgba(239,68,68,0.3)' : 'var(--admin-border)'}`,
      borderRadius: '12px',
      marginBottom: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: isCommunity ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'linear-gradient(135deg, #f97316, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0
        }}>
          {(authorName || '?')[0].toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
            {authorHandle}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--admin-text-dim)', marginTop: 2 }}>
            {authorName} · {new Date(timestamp).toLocaleString()}
          </div>
        </div>

        {isCommunity ? (
           <span style={{
             fontSize: '10px', padding: '3px 10px', borderRadius: '20px',
             background: post.isFlagged ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
             border: `1px solid ${post.isFlagged ? '#ef4444' : '#f59e0b'}44`,
             color: post.isFlagged ? '#ef4444' : '#f59e0b', fontWeight: 700
           }}>
             {post.isFlagged ? 'AI_TOXICITY_DETECTED' : 'COMMUNITY_REPORT'}
           </span>
        ) : (
          <FlagBadge count={post.flagCount} />
        )}

        <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--admin-text-dim)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
          {post.id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 24px' }}>
        {!isCommunity && post.cwTags && (
          <div style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {post.cwTags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
              <span key={tag} style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                color: '#fbbf24', textTransform: 'uppercase'
              }}>CW: {tag}</span>
            ))}
          </div>
        )}
        <p style={{
          fontSize: '14px', color: 'var(--admin-text)',
          lineHeight: 1.6, margin: 0,
          display: '-webkit-box', WebkitLineClamp: truncated ? 3 : 'unset',
          WebkitBoxOrient: 'vertical', overflow: truncated ? 'hidden' : 'visible'
        }}>
          {post.content}
        </p>
        {post.content.length > 180 && (
          <button onClick={() => setExpanded(v => !v)} style={{
            background: 'none', border: 'none', color: 'var(--admin-accent)',
            cursor: 'pointer', fontSize: '12px', padding: '4px 0', marginTop: '6px'
          }}>
            {expanded ? '▲ Show less' : '▼ Read more'}
          </button>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {confirmRemove ? (
          <>
            <span style={{ fontSize: '12px', color: '#ef4444', flex: 1 }}>
              ⚠ Permanently delete this {isCommunity ? 'story' : 'post'}?
            </span>
            <button onClick={handleRemove} disabled={loading} style={{
              background: '#ef4444', border: 'none', color: '#fff',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700
            }}>
              YES, DELETE
            </button>
            <button onClick={() => setConfirmRemove(false)} style={{
              background: 'none', border: '1px solid var(--admin-border)',
              color: 'var(--admin-text-dim)', padding: '8px 12px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px'
            }}>
              CANCEL
            </button>
          </>
        ) : (
          <>
            <button onClick={handleDismiss} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', padding: '8px 16px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600
            }}>
              <CheckCheck size={14} /> DISMISS {isCommunity ? 'REPORT' : 'FLAGS'}
            </button>
            <button onClick={() => setConfirmRemove(true)} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', padding: '8px 16px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600
            }}>
              <Trash2 size={14} /> REMOVE {isCommunity ? 'STORY' : 'POST'}
            </button>
            {loading && <span style={{ fontSize: '12px', color: 'var(--admin-text-dim)' }}>Processing...</span>}
          </>
        )}
      </div>
    </div>
  )
}

export default function FlaggedContent() {
  const [sosPosts, setSosPosts]             = useState([])
  const [communityPosts, setCommunityPosts] = useState([])
  const [activeTab, setActiveTab]           = useState('sos')
  const [loading, setLoading]               = useState(true)
  const [refreshing, setRefreshing]         = useState(false)
  const [toast, setToast]                   = useState(null)
  const [sortBy, setSortBy]                 = useState('newest')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await axios.get('/api/admin/flagged-content')
      setSosPosts(data.posts || [])
      setCommunityPosts(data.communityPosts || [])
    } catch (err) {
      console.error('Failed to load flagged content:', err)
      showToast('Failed to load content', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDismiss = async (id, isCommunity) => {
    try {
      const url = isCommunity 
        ? `/api/admin/flagged-content/${id}/community/dismiss`
        : `/api/admin/flagged-content/${id}/dismiss`
      
      await axios.post(url)
      
      if (isCommunity) {
        setCommunityPosts(prev => prev.filter(p => p.id !== id))
      } else {
        setSosPosts(prev => prev.filter(p => p.id !== id))
      }
      showToast('Report dismissed. Content cleared.')
    } catch (err) {
      console.error('Dismiss error:', err)
      showToast('Failed to dismiss. Please retry.', 'error')
    }
  }

  const handleRemove = async (id, isCommunity) => {
    try {
      const url = isCommunity 
        ? `/api/admin/flagged-content/${id}/community/remove`
        : `/api/admin/flagged-content/${id}/remove`

      await axios.post(url, { reason: 'Community guidelines violation' })
      
      if (isCommunity) {
        setCommunityPosts(prev => prev.filter(p => p.id !== id))
      } else {
        setSosPosts(prev => prev.filter(p => p.id !== id))
      }
      showToast('Content permanently removed.')
    } catch (err) {
      console.error('Remove error:', err)
      showToast('Failed to remove content. Please retry.', 'error')
    }
  }

  const currentList = activeTab === 'sos' ? sosPosts : communityPosts

  const sorted = [...currentList].sort((a, b) => {
    if (sortBy === 'newest') {
      const dateA = new Date(activeTab === 'sos' ? a.createdAt : a.timestamp)
      const dateB = new Date(activeTab === 'sos' ? b.createdAt : b.timestamp)
      return dateB - dateA
    }
    if (sortBy === 'flagCount' && activeTab === 'sos') {
      return b.flagCount - a.flagCount
    }
    return 0
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--admin-accent)', letterSpacing: '2px', fontSize: '12px' }}>
      SCANNING_FLAGGED_CONTENT...
    </div>
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
          color: toast.type === 'error' ? '#ef4444' : '#10b981',
          padding: '12px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
          backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 className="cyber-title" style={{ fontSize: '24px', marginBottom: '8px' }}>FLAGGED_CONTENT</h2>
            <p style={{ color: 'var(--admin-text-dim)', fontSize: '12px', letterSpacing: '1px' }}>
              MODERATION QUEUE FOR PLATFORM SAFETY
            </p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,245,255,0.07)', border: '1px solid var(--admin-border)',
            color: 'var(--admin-accent)', padding: '10px 16px', borderRadius: '8px',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600
          }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'REFRESHING...' : 'REFRESH'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
            <button 
              onClick={() => setActiveTab('sos')}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                background: activeTab === 'sos' ? 'var(--admin-accent)' : 'transparent',
                color: activeTab === 'sos' ? '#000' : 'var(--admin-text-dim)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <ShieldAlert size={14} /> SOS_POSTS ({sosPosts.length})
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              style={{
                padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                background: activeTab === 'community' ? 'var(--admin-accent)' : 'transparent',
                color: activeTab === 'community' ? '#000' : 'var(--admin-text-dim)',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <MessageSquare size={14} /> COMMUNITY_STORIES ({communityPosts.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px', color: '#fff',
                padding: '8px 12px', fontSize: '12px',
                outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="newest">Sort: Newest First</option>
              {activeTab === 'sos' && <option value="flagCount">Sort: Most Flagged</option>}
            </select>
          </div>
        </div>
      </header>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {sorted.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'rgba(17,24,39,0.7)', border: '1px solid var(--admin-border)',
          borderRadius: '16px'
        }}>
          <CheckCheck size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>CONTENT_CLEAR</div>
          <div style={{ fontSize: '13px', color: 'var(--admin-text-dim)' }}>
            No flagged {activeTab === 'sos' ? 'SOS posts' : 'community stories'} in the queue.
          </div>
        </div>
      ) : (
        sorted.map(post => (
          <PostCard
            key={post.id}
            post={post}
            isCommunity={activeTab === 'community'}
            onDismiss={handleDismiss}
            onRemove={handleRemove}
          />
        ))
      )}
    </div>
  )
}
