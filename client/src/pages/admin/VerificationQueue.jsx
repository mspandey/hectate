import { useState, useEffect } from 'react'
import axios from 'axios'
import { CheckCircle, XCircle, Eye, Clock, UserCheck, GraduationCap, Camera, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

const METHOD_ICONS = {
  aadhaar:    <UserCheck size={14} />,
  college_id: <GraduationCap size={14} />,
  face:       <Camera size={14} />,
}

function AttemptRow({ attempt, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason]     = useState('')
  const [loading, setLoading]   = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    await onApprove(attempt.id)
    setLoading(false)
  }

  const handleReject = async () => {
    if (!reason.trim()) { setRejecting(true); return }
    setLoading(true)
    await onReject(attempt.id, reason)
    setLoading(false)
    setRejecting(false)
  }

  return (
    <div style={{
      background: 'rgba(17,24,39,0.7)',
      border: '1px solid var(--admin-border)',
      borderRadius: '12px',
      marginBottom: '16px',
      overflow: 'hidden',
      transition: 'border-color 0.2s'
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px' }}>
        {/* Avatar placeholder */}
        <div style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', fontWeight: 700, color: '#030712', flexShrink: 0
        }}>
          {(attempt.user?.alias || '?')[0].toUpperCase()}
        </div>

        {/* Identity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            @{attempt.user?.alias || 'unknown'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--admin-text-dim)', marginTop: 2 }}>
            {attempt.user?.name || '—'} · {attempt.user?.email || '—'}
          </div>
        </div>

        {/* Method badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px', borderRadius: '20px',
          background: 'rgba(0,245,255,0.07)',
          border: '1px solid rgba(0,245,255,0.2)',
          color: 'var(--admin-accent)', fontSize: '11px', textTransform: 'uppercase'
        }}>
          {METHOD_ICONS[attempt.method] || <Clock size={14} />}
          {attempt.method}
        </div>

        {/* Timestamp */}
        <div style={{ fontSize: '11px', color: 'var(--admin-text-dim)', flexShrink: 0 }}>
          <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
          {new Date(attempt.createdAt).toLocaleString()}
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(v => !v)} style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid var(--admin-border)',
          color: 'var(--admin-text-dim)', padding: '6px 10px', borderRadius: '8px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px'
        }}>
          <Eye size={14} />
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expanded OCR Preview */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--admin-border)',
          padding: '20px 24px',
          background: 'rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: '11px', color: 'var(--admin-text-dim)', letterSpacing: '1px', marginBottom: '12px' }}>
            OCR_RESULT_PREVIEW
          </div>
          <pre style={{
            fontFamily: 'Courier New, monospace', fontSize: '12px',
            color: '#10b981', background: '#000', padding: '16px',
            borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)',
            maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap',
            wordBreak: 'break-word', margin: 0
          }}>
            {attempt.ocrResult || '// No OCR data captured for this attempt.'}
          </pre>

          {attempt.imageUrl && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--admin-text-dim)', letterSpacing: '1px', marginBottom: '8px' }}>
                DOCUMENT_IMAGE
              </div>
              <img
                src={attempt.imageUrl}
                alt="Submitted document"
                style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}
              />
            </div>
          )}

          <div style={{ marginTop: '8px', display: 'flex', gap: '24px', fontSize: '12px', color: 'var(--admin-text-dim)' }}>
            {attempt.matchScore != null && (
              <span>Match Score: <span style={{ color: 'var(--admin-accent)' }}>{(attempt.matchScore * 100).toFixed(1)}%</span></span>
            )}
            {attempt.liveness != null && (
              <span>Liveness: <span style={{ color: attempt.liveness ? '#10b981' : '#ef4444' }}>{attempt.liveness ? 'PASS' : 'FAIL'}</span></span>
            )}
            {attempt.ipAddress && <span>IP: {attempt.ipAddress}</span>}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 24px', borderTop: '1px solid var(--admin-border)',
        background: 'rgba(255,255,255,0.01)'
      }}>
        {rejecting ? (
          <>
            <input
              autoFocus
              type="text"
              placeholder="Reason for rejection..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReject()}
              style={{
                flex: 1, background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(239,68,68,0.4)',
                borderRadius: '8px', color: '#fff', padding: '8px 14px',
                fontSize: '13px', outline: 'none', fontFamily: 'inherit'
              }}
            />
            <button onClick={handleReject} disabled={loading} style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#ef4444', padding: '8px 16px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600
            }}>
              CONFIRM_REJECT
            </button>
            <button onClick={() => setRejecting(false)} style={{
              background: 'none', border: '1px solid var(--admin-border)',
              color: 'var(--admin-text-dim)', padding: '8px 12px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px'
            }}>
              CANCEL
            </button>
          </>
        ) : (
          <>
            <button onClick={handleApprove} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)',
              color: '#10b981', padding: '9px 20px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px', fontWeight: 700,
              transition: 'all 0.2s', letterSpacing: '0.5px'
            }}>
              <CheckCircle size={15} /> APPROVE
            </button>
            <button onClick={() => setRejecting(true)} disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', padding: '9px 20px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '12px', fontWeight: 700,
              transition: 'all 0.2s', letterSpacing: '0.5px'
            }}>
              <XCircle size={15} /> REJECT
            </button>
            {loading && <span style={{ fontSize: '12px', color: 'var(--admin-text-dim)' }}>Processing...</span>}
          </>
        )}
      </div>
    </div>
  )
}

export default function VerificationQueue() {
  const [attempts, setAttempts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast]         = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await axios.get('/api/admin/verification-queue')
      setAttempts(data.attempts || [])
    } catch (err) {
      console.error('Failed to fetch queue:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/admin/verification-queue/${id}/approve`)
      setAttempts(prev => prev.filter(a => a.id !== id))
      showToast('Verification approved. User is now verified.')
    } catch {
      showToast('Failed to approve. Please retry.', 'error')
    }
  }

  const handleReject = async (id, reason) => {
    try {
      await axios.post(`/api/admin/verification-queue/${id}/reject`, { reason })
      setAttempts(prev => prev.filter(a => a.id !== id))
      showToast('Verification rejected and logged.')
    } catch {
      showToast('Failed to reject. Please retry.', 'error')
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--admin-accent)', letterSpacing: '2px', fontSize: '12px' }}>
      LOADING_VERIFICATION_QUEUE...
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

      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="cyber-title" style={{ fontSize: '24px', marginBottom: '8px' }}>VERIFICATION_QUEUE</h2>
          <p style={{ color: 'var(--admin-text-dim)', fontSize: '12px', letterSpacing: '1px' }}>
            {attempts.length} PENDING IDENTITY VERIFICATIONS AWAITING REVIEW
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
      </header>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {attempts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 40px',
          background: 'rgba(17,24,39,0.7)', border: '1px solid var(--admin-border)',
          borderRadius: '16px'
        }}>
          <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>ALL_CLEAR</div>
          <div style={{ fontSize: '13px', color: 'var(--admin-text-dim)' }}>No pending verifications. Queue is empty.</div>
        </div>
      ) : (
        attempts.map(attempt => (
          <AttemptRow
            key={attempt.id}
            attempt={attempt}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ))
      )}
    </div>
  )
}
