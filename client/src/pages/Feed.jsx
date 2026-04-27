import { useState, useContext, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../store/AuthContext'
import {
  MessageCircle, Send, Bookmark, BookmarkCheck,
  TrendingUp, User, HelpCircle, Heart, Share2,
  PlusCircle, X, AlertCircle, Flag, Eye, EyeOff
} from 'lucide-react'
import '../styles/community.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(ts) {
  if (!ts) return ''
  try {
    const date = new Date(ts)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 0) return 'Just now' // Handle future dates
    if (diffInSeconds < 60) return 'Just now'
    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`

    return date.toLocaleString('en-IN', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return '' }
}

function safeParseReplies(raw) {
  if (!raw) return []
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

function mapPost(p) {
  const replies = p.replies
    ? (Array.isArray(p.replies) ? p.replies : safeParseReplies(p.repliesJson))
    : safeParseReplies(p.repliesJson)

  return {
    id:            p.id,
    authorId:      p.authorId || '',
    author_name:   p.authorName   || p.author_name   || 'Anonymous',
    author_handle: p.authorHandle || p.author_handle || '@member',
    authorAvatar:  p.authorAvatar || null,
    content:       p.content,
    category:      p.category  || 'Sharing',
    tags:          p.tags      || '',
    time:          formatRelativeTime(p.timestamp || p.createdAt),
    likes:         Number(p.likes)      || 0,
    replyCount:    Number(p.replyCount) || 0,
    replies,                         // parsed comment array
    userLiked:      !!p.userLiked,
    userSaved:      !!p.userSaved,
    sentimentLabel: p.sentimentLabel || null,
    sentimentScore: p.sentimentScore || 0,
    isFlagged:      !!p.isFlagged,
  }
}

const API = '/api'

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="skeleton-card glass-card" aria-hidden="true">
      <div className="skel-row">
        <div className="skel skel-avatar" />
        <div className="skel-info">
          <div className="skel skel-line short" />
          <div className="skel skel-line xshort" />
        </div>
      </div>
      <div className="skel skel-line" />
      <div className="skel skel-line medium" />
      <div className="skel skel-line short" />
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Feed() {
  const { user } = useContext(AuthContext)

  const [posts,        setPosts]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [posting,      setPosting]      = useState(false)
  const [text,         setText]         = useState('')
  const [category,     setCategory]     = useState('Sharing')
  const [toast,        setToast]        = useState(null)   // { msg, type }
  const [activeTab,    setActiveTab]    = useState('trending')
  const [openComments, setOpenComments] = useState({})
  const [drafts,       setDrafts]       = useState({})    // postId → comment text
  const [activeTag,    setActiveTag]    = useState(null)

  const CATEGORIES = ['Sharing', 'Support Needed', 'Legal Advice', 'Emergency']

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Fetch (with optional tab) ──────────────────────────────────────────────
  const fetchPosts = useCallback(async (tab = 'trending') => {
    setLoading(true)
    try {
      let url = `${API}/posts`
      if (tab === 'saved') url = `${API}/posts/saved`
      else if (tab === 'trending') url = `${API}/posts?sort=trending`

      const res  = await fetch(url, { credentials: 'include' })
      const data = await res.json()

      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
      setPosts(data.posts.map(mapPost))
    } catch (err) {
      console.error('[Feed] fetchPosts error:', err)
      showToast('Could not load posts — check your connection.', 'error')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchPosts(activeTab) }, [activeTab]) // eslint-disable-line

  // ── Computed list (My Stories + tag filter client-side) ────────────────────
  const visiblePosts = (() => {
    let list = posts
    if (activeTab === 'my-stories' && user) {
      list = list.filter(p => String(p.authorId) === String(user.id))
    }
    if (activeTag) {
      list = list.filter(p =>
        (p.tags || '').toLowerCase().includes(activeTag.toLowerCase()) ||
        (p.content || '').toLowerCase().includes(activeTag.toLowerCase())
      )
    }
    return list
  })()

  // ── Create post ────────────────────────────────────────────────────────────
  const handlePost = async () => {
    if (!text.trim()) return
    if (!user) { showToast('Sign in to share your story.', 'warn'); return }
    setPosting(true)
    try {
      const payload = {
        content:  text.trim(),
        category,
        tags: (text.match(/#\w+/g) || []).map(t => t.slice(1))
      }
      console.log('[Feed] POST /api/posts payload:', payload)

      const res  = await fetch(`${API}/posts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify(payload)
      })
      const data = await res.json()
      console.log('[Feed] createPost response:', res.status, data)

      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)

      // Optimistic prepend
      setPosts(prev => [mapPost(data.post), ...prev])
      setText('')
      showToast('✨ Story shared with the community!', 'success')
    } catch (err) {
      console.error('[Feed] createPost error:', err)
      showToast(`Failed to post: ${err.message}`, 'error')
    } finally {
      setPosting(false)
    }
  }

  // ── Like (toggle) ──────────────────────────────────────────────────────────
  const handleLike = async (postId) => {
    if (!user) { showToast('Sign in to support posts.', 'warn'); return }

    // Optimistic update immediately
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      userLiked: !p.userLiked,
      likes: p.userLiked ? Math.max(0, p.likes - 1) : p.likes + 1
    }))

    try {
      const res  = await fetch(`${API}/posts/${postId}/like`, { 
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      // Reconcile with server truth
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p, likes: data.likes, userLiked: data.liked
      }))
    } catch (err) {
      console.error('[Feed] like error:', err)
      // Revert optimistic update
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p,
        userLiked: !p.userLiked,
        likes: p.userLiked ? Math.max(0, p.likes - 1) : p.likes + 1
      }))
    }
  }

  // ── Save (toggle) ──────────────────────────────────────────────────────────
  const handleSave = async (postId) => {
    if (!user) { showToast('Sign in to save posts.', 'warn'); return }

    // Optimistic
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p, userSaved: !p.userSaved
    }))

    try {
      const res  = await fetch(`${API}/posts/${postId}/save`, { 
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p, userSaved: data.saved
      }))
      showToast(data.saved ? '🔖 Saved!' : 'Removed from saved.', 'info')
    } catch (err) {
      console.error('[Feed] save error:', err)
      // Revert
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p, userSaved: !p.userSaved
      }))
    }
  }

  // ── Comment ────────────────────────────────────────────────────────────────
  const handleComment = async (postId) => {
    const content = (drafts[postId] || '').trim()
    if (!content) return
    if (!user) { showToast('Sign in to comment.', 'warn'); return }

    // Optimistic
    const tempReply = {
      id:         `tmp_${Date.now()}`,
      user_id:    user.id,
      user_name:  user.name || 'Member',
      content,
      created_at: new Date().toISOString(),
      time:       'Just now'
    }
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p,
      replyCount: p.replyCount + 1,
      replies:    [...p.replies, tempReply]
    }))
    setDrafts(prev => ({ ...prev, [postId]: '' }))

    try {
      const res  = await fetch(`${API}/posts/${postId}/comment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:    JSON.stringify({ content })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      // Replace temp with real
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        const filtered = p.replies.filter(r => r.id !== tempReply.id)
        return { ...p, replyCount: data.replyCount, replies: [...filtered, data.reply] }
      }))
    } catch (err) {
      console.error('[Feed] comment error:', err)
      showToast(`Comment failed: ${err.message}`, 'error')
      // Revert
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p,
        replyCount: Math.max(0, p.replyCount - 1),
        replies:    p.replies.filter(r => r.id !== tempReply.id)
      }))
    }
  }

  // ── Support Comment (toggle) ───────────────────────────────────────────────
  const handleSupportComment = async (postId, commentId) => {
    if (!user) { showToast('Sign in to support comments.', 'warn'); return }

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      return {
        ...p,
        replies: (p.replies || []).map(r => {
          if (r.id !== commentId) return r
          const active = !!r.userSupported
          return {
            ...r,
            userSupported: !active,
            supports: active ? Math.max(0, (r.supports || 0) - 1) : (r.supports || 0) + 1
          }
        })
      }
    }))

    try {
      const res = await fetch(`${API}/posts/comment/${commentId}/support`, { 
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      // Reconcile
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          replies: (p.replies || []).map(r => {
            if (r.id !== commentId) return r
            return { ...r, supports: data.supports, userSupported: data.supported }
          })
        }
      }))
    } catch (err) {
      console.error('[Feed] support comment error:', err)
      // Revert
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p
        return {
          ...p,
          replies: (p.replies || []).map(r => {
            if (r.id !== commentId) return r
            const active = !!r.userSupported
            return {
              ...r,
              userSupported: !active,
              supports: active ? Math.max(0, (r.supports || 0) - 1) : (r.supports || 0) + 1
            }
          })
        }
      }))
    }
  }

  // ── Report Post ────────────────────────────────────────────────────────────
  const handleReport = async (postId) => {
    if (!user) { showToast('Sign in to report content.', 'warn'); return }
    
    // Optimistic
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, isFlagged: true }))

    try {
      const res = await fetch(`${API}/posts/${postId}/report`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Inappropriate content' })
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || `HTTP ${res.status}`)
      
      showToast('Post reported successfully', 'success')
    } catch (err) {
      console.error('[Feed] report error:', err)
      showToast(err.message || 'Failed to report post.', 'error')
      // Revert optimistic update on failure
      setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, isFlagged: false }))
    }
  }

  const toggleComments = (postId) =>
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }))

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = async (post) => {
    const url = `${window.location.origin}/feed`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'HECTATE Community', text: post.content.slice(0, 80), url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast('Link copied to clipboard!', 'info')
      }
    } catch { /* user cancelled */ }
  }

  // ── Switch tab ─────────────────────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab)
    setActiveTag(null)
    // fetchPosts is triggered by useEffect on activeTab change
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="community-container">

      {/* Toast */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'error' && <AlertCircle size={16} />}
          {toast.msg}
          <X size={14} style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => setToast(null)} />
        </div>
      )}

      <div className="community-grid">

        {/* ── Left Sidebar ── */}
        <aside className="community-left">
          <div className="side-nav glass-card">
            {[
              { id: 'trending',   icon: <TrendingUp size={18} />, label: 'Trending'    },
              { id: 'my-stories', icon: <User       size={18} />, label: 'My Stories'  },
              { id: 'saved',      icon: <Bookmark   size={18} />, label: 'Saved Posts' },
            ].map(({ id, icon, label }) => (
              <div
                key={id}
                className={`side-nav-item${activeTab === id ? ' active' : ''}`}
                onClick={() => switchTab(id)}
              >
                {icon} {label}
              </div>
            ))}
            {/* Support FAQ — link to real page instead of popup */}
            <Link
              to="/faq"
              className="side-nav-item"
            >
              <HelpCircle size={18} /> Support FAQ
            </Link>
          </div>

          <div className="trending-tags glass-card">
            <h4>Trending Tags</h4>
            <div className="tag-list">
              {['safety', 'legal', 'verified', 'help', 'emergency'].map(tag => (
                <span
                  key={tag}
                  className={activeTag === tag ? 'active' : ''}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Feed ── */}
        <main className="community-center">
          <div className="welcome-banner">
            <h1>
              {activeTab === 'trending'   && `How are you today${user?.name ? `, ${user.name.split(' ')[0]}` : ''}?`}
              {activeTab === 'my-stories' && 'My Stories'}
              {activeTab === 'saved'      && 'Saved Posts'}
            </h1>
            {activeTab === 'trending' && (
              <p>Your voice is your strength. Share it in this safe space.</p>
            )}
          </div>

          {/* Composer — only on trending */}
          {activeTab === 'trending' && (
            <div className="composer glass-card">
              <textarea
                placeholder="Share your thoughts, experiences, or words of support..."
                value={text}
                maxLength={500}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handlePost() }}
              />
              <div className="category-selector">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    className={`cat-chip${category === c ? ' active' : ''}`}
                    onClick={() => setCategory(c)}
                    type="button"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="composer-actions">
                <span className="char-limit">{text.length}/500</span>
                <button
                  className="btn-post"
                  onClick={handlePost}
                  disabled={!text.trim() || posting}
                  type="button"
                >
                  <PlusCircle size={18} />
                  {posting ? 'Sharing…' : 'Post Story'}
                </button>
              </div>
            </div>
          )}

          {/* Feed list */}
          <div className="feed-list">
            {loading ? (
              <>{[1, 2, 3].map(n => <Skeleton key={n} />)}</>
            ) : visiblePosts.length === 0 ? (
              <div className="empty-state glass-card">
                <Bookmark size={36} style={{ opacity: 0.3, margin: '0 auto 16px', display: 'block' }} />
                <p>
                  {activeTab === 'my-stories' && 'You haven\'t shared any stories yet.'}
                  {activeTab === 'saved'       && 'No saved posts yet. Bookmark stories you love.'}
                  {activeTab === 'trending'    && 'No stories yet. Be the first to share!'}
                </p>
              </div>
            ) : (
              visiblePosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  open={!!openComments[post.id]}
                  draft={drafts[post.id] || ''}
                  onLike={() => handleLike(post.id)}
                  onSave={() => handleSave(post.id)}
                  onShare={() => handleShare(post)}
                  onToggleComments={() => toggleComments(post.id)}
                  onDraftChange={v => setDrafts(prev => ({ ...prev, [post.id]: v }))}
                  onComment={() => handleComment(post.id)}
                  onSupportComment={(cId) => handleSupportComment(post.id, cId)}
                  onReport={() => handleReport(post.id)}
                />
              ))
            )}
          </div>
        </main>

      </div>
    </div>
  )
}

// ─── PostCard (extracted for clarity) ────────────────────────────────────────

function PostCard({
  post, open, draft,
  onLike, onSave, onShare, onToggleComments, onDraftChange, onComment, onSupportComment, onReport
}) {
  const [showSensitive, setShowSensitive] = useState(false)
  const initials = post.author_name ? post.author_name[0].toUpperCase() : '?'

  return (
    <article className="post-card glass-card">
      <div className="post-header">
        <div className="post-avatar" style={post.authorAvatar ? { overflow: 'hidden', padding: 0 } : {}}>
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt={post.author_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
        <div className="post-info">
          <span className="post-author">{post.author_name}</span>
          <span className="post-meta">{post.author_handle} · {post.time}</span>
        </div>
        <div className="post-meta-group">
          <div className="post-category-tag">{post.category}</div>
          {post.sentimentLabel && (
            <div className={`sentiment-badge sentiment-${post.sentimentLabel.toLowerCase()}`}>
              {post.sentimentLabel}
            </div>
          )}
        </div>
      </div>

      {post.isFlagged && !showSensitive ? (
        <div className="sensitive-overlay">
          <div className="sensitive-message">
            <AlertCircle size={24} />
            <h4>Sensitive Content</h4>
            <p>This post has been flagged as potentially harmful or sensitive.</p>
            <button className="btn-show" onClick={() => setShowSensitive(true)}>
              Show Content
            </button>
          </div>
        </div>
      ) : (
        <p className={`post-content ${post.isFlagged ? 'content-warning' : ''}`}>
          {post.content}
          {post.isFlagged && (
            <button className="btn-hide-sensitive" onClick={() => setShowSensitive(false)}>
              <EyeOff size={12} /> Hide
            </button>
          )}
        </p>
      )}

      <div className="post-footer">
        <button
          className={`post-action${post.userLiked ? ' active liked' : ''}`}
          onClick={onLike}
          type="button"
          aria-label="Support this post"
        >
          <Heart size={17} fill={post.userLiked ? 'currentColor' : 'none'} />
          <span>Support {post.likes > 0 ? post.likes : ''}</span>
        </button>

        <button
          className={`post-action${open ? ' active' : ''}`}
          onClick={onToggleComments}
          type="button"
          aria-label="Toggle comments"
        >
          <MessageCircle size={17} />
          <span>Comment {post.replyCount > 0 ? post.replyCount : ''}</span>
        </button>

        <button
          className={`post-action${post.userSaved ? ' active saved' : ''}`}
          onClick={onSave}
          type="button"
          aria-label={post.userSaved ? 'Remove from saved' : 'Save post'}
        >
          {post.userSaved
            ? <BookmarkCheck size={17} />
            : <Bookmark size={17} />}
          <span>{post.userSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button className="post-action" onClick={onShare} type="button" aria-label="Share">
          <Share2 size={17} />
          <span>Share</span>
        </button>

        <button className="post-action report-action" onClick={onReport} type="button" aria-label="Report">
          <Flag size={17} />
          <span>Report</span>
        </button>
      </div>

      {/* Comments section — show when toggled OR when there are comments already */}
      {(open || post.replyCount > 0) && (
        <div className="comment-section">

          {/* All comments */}
          {post.replies.length > 0 ? (
            <div className="comment-list">
              {post.replies.map((r, idx) => (
                <div className="comment-item" key={r.id || idx}>
                  <div className="comment-header">
                    <span className="comment-user">{r.user_name || 'Member'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        className={`comment-support-btn ${r.userSupported ? 'active' : ''}`}
                        onClick={() => onSupportComment(r.id)}
                        type="button"
                        aria-label="Support comment"
                      >
                        <Heart size={12} fill={r.userSupported ? 'currentColor' : 'none'} />
                        {r.supports > 0 && <span>{r.supports}</span>}
                      </button>
                      <span className="comment-time">{r.time || formatRelativeTime(r.created_at)}</span>
                    </div>
                  </div>
                  <span className="comment-text">{r.content}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments">No comments yet. Be the first to respond.</p>
          )}

          {/* New comment input — shown when section is open */}
          {open && (
            <div className="comment-input-area">
              <input
                type="text"
                placeholder="Write a supportive comment…"
                value={draft}
                onChange={e => onDraftChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onComment()}
                maxLength={300}
                autoFocus
              />
              <button
                onClick={onComment}
                disabled={!draft.trim()}
                type="button"
                aria-label="Send comment"
              >
                <Send size={15} />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          {!open && post.replyCount > 0 && (
            <button
              className="view-comments-btn"
              onClick={onToggleComments}
              type="button"
            >
              + Add a comment
            </button>
          )}
        </div>
      )}
    </article>
  )
}
