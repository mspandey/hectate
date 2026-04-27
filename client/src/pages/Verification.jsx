import { useState, useRef, useEffect, useCallback, useContext } from 'react'
import { AuthContext } from '../store/AuthContext'
import { Shield, Upload, Check, X, Loader, FileText, Users, Camera, Lock, AlertCircle, Sun, ArrowRight } from 'lucide-react'

const API = '/api'

// ── Helper: fetch CSRF token with caching ─────────────────────────────────────
let cachedCsrf = null;

async function getCsrf(forceRefresh = false) {
  if (cachedCsrf && !forceRefresh) return cachedCsrf;
  
  try {
    const r = await fetch('/api/csrf-token', { credentials: 'include' });
    if (!r.ok) {
      console.warn(`[CSRF] Failed to fetch token: ${r.status}`);
      return null;
    }
    const d = await r.json();
    cachedCsrf = d.csrfToken;
    console.log('[CSRF] Token acquired');
    return cachedCsrf;
  } catch (err) { 
    console.error('[CSRF] Error fetching token:', err);
    return null; 
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Aadhaar OCR Upload
// ══════════════════════════════════════════════════════════════════════════════
function AadhaarStep({ onPass }) {
  const [file, setFile]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setResult(null)
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else if (f.type === 'application/pdf') {
      setPreview('pdf-icon') 
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const submit = async () => {
    if (!file) return
    setLoading(true)
    console.log('[FRONTEND] Starting Aadhaar upload...', file.name);
    try {
      const csrf    = await getCsrf()
      const formData = new FormData()
      formData.append('aadhaar', file)
      console.log('[FRONTEND] Fetching /api/verify/aadhaar-ocr...');
      const res = await fetch(`${API}/verify/aadhaar-ocr`, {
        method: 'POST', credentials: 'include',
        headers: csrf ? { 'X-CSRF-Token': csrf } : {},
        body: formData
      })
      console.log('[FRONTEND] Response received:', res.status);
      const data = await res.json()
      console.log('[FRONTEND] Data parsed:', data);
      setResult(data)
    } catch (e) {
      console.error('[FRONTEND] Upload error:', e);
      setResult({ passed: false, reason: 'Upload failed — check your connection.' })
    } finally { setLoading(false) }
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--hectate-soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={18} color="var(--hectate-pink)" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, color: 'var(--slate-800)' }}>Step 2: ID Verification</h2>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}>Securely verify your identity via Aadhaar</p>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          marginTop: 16, border: `2px dashed ${dragging ? 'var(--hectate-pink)' : 'var(--slate-200)'}`,
          borderRadius: 4, padding: 32, textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'var(--hectate-soft-pink)' : preview ? '#f8f8ff' : 'var(--slate-50)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: dragging ? '0 8px 24px rgba(236, 28, 110, 0.1)' : 'none'
        }}>
        <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        {preview === 'pdf-icon' ? (
          <div style={{ padding: '20px 0' }}>
            <FileText size={64} color="var(--hectate-pink)" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, color: 'var(--hectate-burgundy)', fontWeight: 600 }}>PDF Document Detected</p>
          </div>
        ) : preview ? (
          <img src={preview} alt="Aadhaar preview" style={{ maxHeight: 200, borderRadius: 4, marginBottom: 12, objectFit: 'contain', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        ) : (
          <div style={{ padding: '20px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Upload size={28} color="var(--hectate-pink)" />
            </div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'var(--slate-700)' }}>
              {file ? file.name : 'Click or Drag Aadhaar Card'}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--slate-400)' }}>Front side of card preferred</p>
          </div>
        )}
      </div>

      {result && (
        <div style={{
          marginTop: 20, padding: 18, borderRadius: 16,
          background: result.passed ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${result.passed ? '#bbf7d0' : '#fecaca'}`,
          animation: 'slideIn 0.3s ease'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ 
              width: 24, height: 24, borderRadius: '50%', 
              background: result.passed ? '#22c55e' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {result.passed ? <Check size={14} color="white" /> : <X size={14} color="white" />}
            </div>
            <strong style={{ color: result.passed ? '#166534' : '#991b1b', fontSize: 16 }}>
              {result.passed ? 'Aadhaar Card Verified' : 'Unable to Verify'}
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: result.passed ? '#15803d' : '#b91c1c', lineHeight: 1.5 }}>
            {result.reason || result.error || 'The document could not be processed.'}
          </p>
          
          {result.aadhaar_number && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--slate-600)' }}>
              <span>ID: <strong>{result.aadhaar_number.replace(/\d(?=\d{4})/g, '•')}</strong></span>
              <span>GENDER: <strong>{result.gender?.toUpperCase()}</strong></span>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" style={{ flex: 1, height: 48, borderRadius: 12 }} disabled={!file || loading} onClick={submit}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> 
              <span>VERIFYING...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Shield size={18} />
              <span>SCAN DOCUMENT</span>
            </div>
          )}
        </button>
        {result?.passed && (
          <button className="btn btn-primary" style={{ flex: 1, height: 48, borderRadius: 12, background: '#16a34a' }} onClick={() => onPass(result.aadhaarHash)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>NEXT STEP</span>
              <Check size={18} />
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Gender Verification (Face Match)
// ══════════════════════════════════════════════════════════════════════════════
function GenderVerificationStep({ onPass }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [votes, setVotes] = useState([])
  const [error, setError] = useState(null)
  const [uncertain, setUncertain] = useState(false)
  const [message, setMessage] = useState('')
  const [cameraAccess, setCameraAccess] = useState(false)
  const [systemStatus, setSystemStatus] = useState('checking')
  
  // 1. Check system status once
  useEffect(() => {
    const checkSystem = async () => {
      try {
        const token = await getCsrf(true); // Force refresh on mount
        if (token) setSystemStatus('online');
        else setSystemStatus('offline');
      } catch (e) {
        setSystemStatus('offline');
      }
    };
    checkSystem();
  }, []);

  // 2. Start camera
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Your browser does not support camera access or is in an insecure context (HTTP).');
      return;
    }

    let stream;
    async function startCamera(retryCount = 0) {
      console.log(`[Camera] Requesting access (Attempt ${retryCount + 1})...`);
      setError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        console.log("[Camera] Stream acquired:", stream.id);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraAccess(true);
      } catch (e) {
        console.error('[Camera] Access Error:', e.name, e.message);
        if ((e.name === 'NotReadableError' || e.name === 'TrackStartError') && retryCount < 2) {
          setTimeout(() => startCamera(retryCount + 1), 1000);
          return;
        }
        
        if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
          setError('Camera is busy. Please close other apps using the camera.');
        } else if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please enable it in browser settings.');
        } else {
          setError(`Camera Error: ${e.message || 'Unavailable'}`);
        }
      }
    }
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [])
  
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }
  
  const verifyGender = useCallback(async () => {
    if (loading || votes.length >= 12 || !cameraAccess || systemStatus !== 'online') return;
    
    const frame = captureFrame();
    if (!frame) return;
    
    console.log(`[FRONTEND] Sending frame ${votes.length + 1} for verification...`);
    setLoading(true);
    setUncertain(false);
    try {
      const csrf = await getCsrf();
      const res = await fetch(`${API}/verify/gender-check`, {
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRF-Token': csrf } : {})
        },
        body: JSON.stringify({ frame, votes })
      });
      
      const data = await res.json();
      console.log('[FRONTEND] Verification response:', data);

      if (res.status === 403 && data.error === 'CSRF token validation failed') {
        console.warn('[FRONTEND] CSRF Failure, retrying with new token...');
        await getCsrf(true); // Refresh cache
        return;
      }

      setMessage(data.message || '');

      if (data.status === 'success') {
        console.log('[FRONTEND] Verification SUCCESS! Navigating to Aadhaar step...');
        onPass();
      } else if (data.status === 'gathering') {
        setVotes(data.votes);
      } else if (data.status === 'uncertain') {
        setVotes(data.votes);
        setUncertain(true);
        setMessage(data.message || 'Detection inconclusive due to lighting.');
      } else if (data.status === 'failed') {
        setError(data.message || 'Verification failed. Hectate is a women-only platform.');
      } else if (data.error) {
        setError(`System Error: ${data.error}`);
      }
    } catch (e) {
      console.error('Service error', e);
      // Don't set hard error here, just let the next cycle try if backend blips
    } finally {
      setLoading(false);
    }
  }, [votes, loading, cameraAccess, systemStatus, onPass]);
  
  // 3. Trigger verification cycle
  useEffect(() => {
    if (!cameraAccess || error || systemStatus !== 'online' || loading || votes.length >= 12) return;
    
    const timer = setTimeout(() => {
      verifyGender();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [cameraAccess, error, systemStatus, loading, votes.length, verifyGender]);

  const progress = Math.min((votes.length / 12) * 100, 100);


  return (
    <div style={{ animation: 'fadeIn 0.4s', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--hectate-soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={18} color="var(--hectate-pink)" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, margin: 0, color: 'var(--slate-800)' }}>Step 1: Face Liveness</h2>
            <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}>Ensuring a safe, women-only environment</p>
          </div>
        </div>
        

      </div>

      <div style={{ 
        position: 'relative', width: '100%', maxWidth: 480, height: 320, 
        margin: '0 auto 24px', borderRadius: 2, overflow: 'hidden', 
        border: `3px solid ${error ? '#ef4444' : 'var(--purple-500)'}`, 
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)', background: '#000' 
      }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
        />
        
        {/* Scanning Rectangle Overlay */}
        <div style={{ 
          position: 'absolute', top: '10%', left: '15%', right: '15%', bottom: '10%',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          borderRadius: 0,
          pointerEvents: 'none',
          zIndex: 5
        }}>
          {/* Corner accents */}
          <div style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTop: '4px solid var(--hectate-pink)', borderLeft: '4px solid var(--hectate-pink)' }} />
          <div style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTop: '4px solid var(--hectate-pink)', borderRight: '4px solid var(--hectate-pink)' }} />
          <div style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottom: '4px solid var(--hectate-pink)', borderLeft: '4px solid var(--hectate-pink)' }} />
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottom: '4px solid var(--hectate-pink)', borderRight: '4px solid var(--hectate-pink)' }} />
          
          {/* Scanning Line */}
          {!error && !loading && votes.length > 0 && (
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, height: 2, 
              background: 'var(--hectate-pink)', 
              boxShadow: '0 0 15px var(--hectate-pink)',
              animation: 'scanLine 3s ease-in-out infinite',
              zIndex: 6
            }} />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {loading && !error && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <Loader size={32} color="#fff" style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0 }}>Processing...</p>
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div style={{ padding: 24, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', color: '#991b1b', fontSize: 14 }}>
          <p style={{ margin: '0 0 16px', fontWeight: 600 }}>{error}</p>
          {systemStatus === 'offline' && (
            <p style={{ fontSize: 12, opacity: 0.8, marginBottom: 16 }}>
              The Hectate verification bridge appears to be offline. 
              Please ensure the backend servers are running.
            </p>
          )}
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            {systemStatus === 'offline' ? 'Check Again' : 'Retry Access'}
          </button>
        </div>
      ) : uncertain ? (
        <div style={{ padding: 20, background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <AlertCircle size={24} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#92400e' }}>Verification Inconclusive</p>
              <p style={{ margin: 0, fontSize: 13, color: '#b45309', lineHeight: 1.4 }}>
                {message || "We couldn't verify your identity with high confidence. This can happen due to low lighting or glasses."}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => { setVotes([]); setUncertain(false); }}
              style={{ flex: 1, padding: '10px', background: '#fff', border: '1px solid #fcd34d', borderRadius: 8, color: '#92400e', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Sun size={16} /> Try Again
            </button>
            <button 
              onClick={onPass}
              style={{ flex: 1.5, padding: '10px', background: 'var(--hectate-pink)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              Continue to Aadhaar <ArrowRight size={16} />
            </button>
          </div>
          <p style={{ marginTop: 12, fontSize: 11, color: '#d97706', textAlign: 'center', opacity: 0.8 }}>
            Manual Aadhaar verification will be stricter if face liveness is inconclusive.
          </p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            {message.includes('light') && <Sun size={16} color="#d97706" style={{ animation: 'pulse 2s infinite' }} />}
            <p style={{ fontSize: 14, color: (message.toLowerCase().includes('light') || message.toLowerCase().includes('fuzzy')) ? '#d97706' : 'var(--slate-600)', margin: 0, fontWeight: 500 }}>
              {votes.length === 0 ? "Position your face in the frame..." : message || `Analyzing frame ${votes.length} of 12...`}
            </p>
          </div>
          <div style={{ width: '100%', height: 8, background: 'var(--slate-100)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: message.includes('light') ? '#fbbf24' : 'var(--gradient-main)', 
              width: `${(votes.length / 12) * 100}%`, 
              transition: 'all 0.3s ease' 
            }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Profile Setup
// ══════════════════════════════════════════════════════════════════════════════
function ProfileSetupStep({ onPass, formData, setFormData, loading }) {
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(formData.avatarUrl || null);
  const inputRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!formData.name) e.name = 'Full name is required';
    if (!formData.alias) e.alias = 'Safety alias is required';
    if (!formData.email) e.email = 'Valid email is required';
    
    const cleanPhone = formData.mobileNumber.replace(/[^\d]/g, '');
    if (!formData.mobileNumber) {
      e.mobileNumber = 'Mobile number is required';
    } else if (cleanPhone.length !== 10) {
      e.mobileNumber = 'Must be exactly 10 digits';
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!formData.password) {
      e.password = 'Security password is required';
    } else if (!passwordRegex.test(formData.password)) {
      e.password = 'Use 8+ chars, with a number & symbol';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      alert('Photo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setFormData({ ...formData, avatarUrl: reader.result });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="profile-setup-container" style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'var(--hectate-soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={22} color="var(--hectate-pink)" />
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--slate-800)' }}>Setup Your Profile</h2>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}>Identity verified. Now, create your digital self.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div 
          onClick={() => inputRef.current?.click()}
          style={{ 
            width: 120, height: 120, borderRadius: '50%', border: '4px solid white', 
            margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', background: 'var(--slate-50)', position: 'relative',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {preview ? (
            <img src={preview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Camera size={32} color="var(--hectate-pink)" opacity={0.6} />
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--hectate-pink)', letterSpacing: 0.5 }}>ADD PHOTO</span>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Full Name</label>
          <input 
            className="form-input" 
            placeholder="Legal Name" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={{ borderColor: errors.name ? '#dc2626' : 'var(--slate-200)', borderRadius: 10 }}
          />
          {errors.name && <span style={{fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block'}}>{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Safety Alias</label>
          <input 
            className="form-input" 
            placeholder="@alias" 
            value={formData.alias} 
            onChange={e => setFormData({...formData, alias: e.target.value})} 
            style={{ borderColor: errors.alias ? '#dc2626' : 'var(--slate-200)', borderRadius: 10 }}
          />
          {errors.alias && <span style={{fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block'}}>{errors.alias}</span>}
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Email Address</label>
        <input 
          className="form-input" 
          type="email" 
          placeholder="your@email.com"
          value={formData.email} 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          style={{ borderColor: errors.email ? '#dc2626' : 'var(--slate-200)', borderRadius: 10 }}
        />
        {errors.email && <span style={{fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block'}}>{errors.email}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Mobile Number</label>
          <div style={{ position: 'relative' }}>
            <input 
              className="form-input" 
              placeholder="10 Digits" 
              value={formData.mobileNumber} 
              maxLength={10}
              onChange={e => setFormData({...formData, mobileNumber: e.target.value.replace(/\D/g, '')})} 
              style={{ borderColor: errors.mobileNumber ? '#dc2626' : 'var(--slate-200)', borderRadius: 10, paddingRight: 32 }}
            />
            {formData.mobileNumber.length === 10 && <Check size={14} color="#16a34a" style={{ position: 'absolute', right: 10, top: 13 }} />}
          </div>
          {errors.mobileNumber && <span style={{fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block'}}>{errors.mobileNumber}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Secure Password</label>
          <div style={{ position: 'relative' }}>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              style={{ borderColor: errors.password ? '#dc2626' : 'var(--slate-200)', borderRadius: 10, paddingRight: 32 }}
            />
            <Lock size={14} color="var(--slate-400)" style={{ position: 'absolute', right: 10, top: 13 }} />
          </div>
          <span style={{ fontSize: 10, color: 'var(--slate-400)', marginTop: 4, display: 'block' }}>
            8+ chars, 1 number, 1 symbol
          </span>
          {errors.password && <span style={{fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block'}}>{errors.password}</span>}
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: 32, height: 52, fontWeight: 700, fontSize: 16, borderRadius: 14 }} 
        disabled={loading}
        onClick={() => validate() && onPass()}
      >
        {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> CREATING ACCOUNT...</> : 'COMPLETE VERIFICATION'}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN VERIFICATION PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Verification() {
  const { login } = useContext(AuthContext)
  const [step, setStep]   = useState(1) // 1=aadhaar, 2=details
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    alias: '',
    bio: '',
    avatarUrl: '',
    aadhaarHash: null,
    dob: '2000-01-01'
  });

  const [regLoading, setRegLoading] = useState(false);

  const handleDetailsPass = async () => {
    setRegLoading(true);
    try {
      const csrf = await getCsrf();
      const res = await fetch(`${API}/auth/register-step1`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
        body: JSON.stringify({ ...formData })
      });
      const data = await res.json();
      if (data.success) {
        const res2 = await fetch(`${API}/auth/verify-phone-finalize`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
          body: JSON.stringify({ userId: data.userId, mobileNumber: formData.mobileNumber, consent: true })
        });
        const data2 = await res2.json();
        if (data2.success) {
          login({
            ...data2.user,
            verified_woman: true,
            joined: new Date().toISOString()
          });
        } else {
          alert(data2.error || 'Finalization failed');
        }
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (e) {
      alert('Network error during registration');
    } finally {
      setRegLoading(false);
    }
  };

  const stepLabels = ['Face Match', 'Aadhaar', 'Profile']

  return (
    <div className="verify-page">
      <div className="verify-card" style={{ animation: 'fadeUp 0.5s ease', maxWidth: 520, borderRadius: 24 }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="avatar-lg" onClick={() => window.location.href='/welcome'} style={{ margin: '0 auto 16px', background: 'var(--gradient-main)', color: 'white', cursor: 'pointer', boxShadow: '0 8px 32px rgba(124, 58, 237, 0.2)' }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, letterSpacing: -0.5 }}>Join Hectate</h1>
          <p className="subtitle" style={{ fontSize: 14, opacity: 0.8 }}>Identity verification required for access</p>
          
          <div style={{ 
            marginTop: 16, display: 'inline-block', padding: '6px 16px', 
            borderRadius: 24, background: '#FFFFFF', 
            border: '1px solid #FFFFFF',
            color: '#000000', fontSize: 11, fontWeight: 900, letterSpacing: 1.5,
            textTransform: 'uppercase',
            boxShadow: '0 4px 15px rgba(255,255,255,0.2)'
          }}>
            BUILT FOR ZERO FAILURE
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, padding: '0 40px' }}>
          {stepLabels.map((label, i) => {
            const n = i + 1
            const done    = step > n
            const active  = step === n
            return (
              <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                {i < stepLabels.length - 1 && <div style={{ position: 'absolute', top: 15, left: '50%', right: '-50%', height: 2, background: done ? 'var(--purple-500)' : 'var(--slate-200)', zIndex: 0 }} />}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', zIndex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800,
                  background: done ? 'var(--purple-500)' : active ? 'var(--purple-600)' : 'var(--slate-200)',
                  color: done || active ? 'white' : 'var(--slate-500)',
                  border: active ? '4px solid white' : 'none',
                  boxShadow: active ? '0 0 0 2px var(--purple-600)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {done ? <Check size={16} /> : n}
                </div>
                <span style={{ fontSize: 10, marginTop: 8, color: active ? 'var(--purple-600)' : 'var(--slate-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
              </div>
            )
          })}
        </div>

        {/* Step content */}
        {step === 1 && <GenderVerificationStep onPass={() => setStep(2)} />}

        {step === 2 && <AadhaarStep onPass={(hash) => {
          setFormData({ ...formData, aadhaarHash: hash })
          setStep(3)
        }} />}

        {step === 3 && <ProfileSetupStep formData={formData} setFormData={setFormData} onPass={handleDetailsPass} loading={regLoading} />}
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.5; transform: scale(1); } }
        @keyframes scanLine { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
      `}</style>
    </div>
  )
}

