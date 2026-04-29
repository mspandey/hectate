import { useState, useRef, useEffect, useCallback, useContext, useMemo } from 'react'
import { AuthContext } from '../store/AuthContext'
import { Shield, Upload, Check, X, Loader, FileText, Users, Camera, Lock, AlertCircle, Sun, ArrowRight, RefreshCw, Smartphone, Eye, EyeOff } from 'lucide-react'
import * as faceapi from 'face-api.js'

const API = '/api'

// ── Helpers ──────────────────────────────────────────────────────────────────

// Calculate average brightness from a canvas
const calculateBrightness = (canvas) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  let colorSum = 0;

  // Sample every 8th pixel for brightness (faster)
  for (let x = 0, len = data.length; x < len; x += 32) {
    const avg = (data[x] + data[x + 1] + data[x + 2]) / 3;
    colorSum += avg;
  }

  return Math.floor(colorSum / (data.length / 32));
};

// Robust fetch with retry
const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0 && response.status !== 403 && response.status !== 401) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    console.warn(`[RETRY] Fetch failed, retrying in ${backoff}ms...`, error.message);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 1.5);
  }
};

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
// STEP 1 — Live Selfie & Liveness
// ══════════════════════════════════════════════════════════════════════════════
function LivenessStep({ onPass, serviceStatus }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const framesRef = useRef([])
  const requestRef = useRef(null)
  const lastProcessedTime = useRef(0)

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraAccess, setCameraAccess] = useState(false)
  const [phase, setPhase] = useState('camera') // camera|capturing|processing|failed|passed
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ msg: 'Initializing camera...', type: 'info' })
  const [brightness, setBrightness] = useState(100)
  const [progress, setProgress] = useState(0)
  const [isStable, setIsStable] = useState(false)
  const [movementPassed, setMovementPassed] = useState(false)
  const [stabilityScore, setStabilityScore] = useState(0)
  
  const faceStartTimeRef = useRef(null)
  const stableFramesRef = useRef(0)
  const lastFaceBoxRef = useRef(null)
  const lastFaceDetectedTimeRef = useRef(Date.now())
  const initialFacePosRef = useRef(null)
  const movementHistoryRef = useRef([])
  const isStableRef = useRef(false)
  const movementPassedRef = useRef(false)
  const phaseRef = useRef('camera')



  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
  const TOTAL_FRAMES = 12

  // Keep refs in sync with state for rAF closure
  useEffect(() => { isStableRef.current = isStable }, [isStable])
  useEffect(() => { movementPassedRef.current = movementPassed }, [movementPassed])
  useEffect(() => { phaseRef.current = phase }, [phase])


  // 1. Load Models
  useEffect(() => {
    async function loadModels() {
      try {
        setFeedback({ msg: 'Loading AI models...', type: 'info' })
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        setModelsLoaded(true)
        console.log('[FACE_API] Models loaded successfully')
      } catch (err) {
        console.error('[FACE_API] Model load error:', err)
        setError('Failed to load face detection models. Please check your connection.')
      }
    }
    loadModels()
  }, [])

  // 2. Start Camera
  useEffect(() => {
    let stream
    async function startCamera() {
      if (!modelsLoaded) return
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        })
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraAccess(true)
        setFeedback({ msg: 'Ready for capture', type: 'success' })
      } catch (err) {
        setError(err.name === 'NotAllowedError' ? 'Camera access denied.' : `Camera error: ${err.message}`)
      }
    }
    startCamera()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [modelsLoaded])

  // 3. Real-time Detection Loop
  // 3. Real-time Detection Loop
  const runDetection = useCallback(async (time) => {
    const currentPhase = phaseRef.current
    if (!videoRef.current || !canvasRef.current) return
    if (currentPhase !== 'camera' && currentPhase !== 'capturing') return

    // Throttle to ~10 FPS for performance
    if (time - lastProcessedTime.current < 100) {
      requestRef.current = requestAnimationFrame(runDetection)
      return
    }
    lastProcessedTime.current = time

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video.videoWidth || !video.videoHeight) {
      requestRef.current = requestAnimationFrame(runDetection)
      return
    }

    // Draw current frame to hidden canvas
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0)

    // A. Brightness Check
    const b = calculateBrightness(canvas)
    setBrightness(b)

    let currentFeedback = { msg: 'Position your face', type: 'info' }

    if (b < 40) {
      currentFeedback = { msg: 'Too dark! Move to a brighter area', type: 'warning' }
    } else if (b > 220) {
      currentFeedback = { msg: 'Too bright! Reduce lighting', type: 'warning' }
    } else {
      // B. Face Detection
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()

      if (!detection) {
        if (Date.now() - lastFaceDetectedTimeRef.current > 1500) {
          faceStartTimeRef.current = null
          stableFramesRef.current = 0
          lastFaceBoxRef.current = null
          initialFacePosRef.current = null
          isStableRef.current = false
          movementPassedRef.current = false
          setIsStable(false)
          setMovementPassed(false)
          setStabilityScore(0)
        }
        currentFeedback = { msg: 'Face lost. Adjust your position...', type: 'warning' }
      } else {
        lastFaceDetectedTimeRef.current = Date.now()
        const { x, y, width, height } = detection.detection.box
        const centerX = x + width / 2
        const centerY = y + height / 2
        const videoCenterX = video.videoWidth / 2
        const videoCenterY = video.videoHeight / 2

        if (!faceStartTimeRef.current) {
          faceStartTimeRef.current = Date.now()
          initialFacePosRef.current = { centerX, centerY }
        }

        let jitter = 100
        if (lastFaceBoxRef.current) {
          const prev = lastFaceBoxRef.current
          const dx = Math.abs(centerX - prev.centerX)
          const dy = Math.abs(centerY - prev.centerY)
          jitter = (dx / video.videoWidth + dy / video.videoHeight) * 100
        }
        lastFaceBoxRef.current = { centerX, centerY }

        if (jitter < 8) {
          stableFramesRef.current++
        } else {
          stableFramesRef.current = Math.max(0, stableFramesRef.current - 1)
        }

        const newStabilityScore = Math.min(100, (stableFramesRef.current / 15) * 100)
        setStabilityScore(newStabilityScore)

        if (stableFramesRef.current > 15 && !isStableRef.current) {
          isStableRef.current = true
          setIsStable(true)
        }

        if (isStableRef.current && !movementPassedRef.current && initialFacePosRef.current) {
          const dx = Math.abs(centerX - initialFacePosRef.current.centerX)
          const dy = Math.abs(centerY - initialFacePosRef.current.centerY)
          const moveDist = (dx / video.videoWidth + dy / video.videoHeight) * 100
          movementHistoryRef.current.push(moveDist)
          if (movementHistoryRef.current.length > 20) movementHistoryRef.current.shift()
          const totalMove = movementHistoryRef.current.reduce((a, v) => a + v, 0)
          if (totalMove > 15) {
            movementPassedRef.current = true
            setMovementPassed(true)
          }
        }

        const isCentered =
          Math.abs(centerX - videoCenterX) < video.videoWidth * 0.18 &&
          Math.abs(centerY - videoCenterY) < video.videoHeight * 0.18
        const isCorrectSize = height > video.videoHeight * 0.35 && height < video.videoHeight * 0.85

        if (!isCentered) {
          currentFeedback = { msg: 'Center your face in the frame', type: 'warning' }
        } else if (!isCorrectSize) {
          currentFeedback = { msg: 'Adjust distance from camera', type: 'warning' }
        } else if (!isStableRef.current) {
          currentFeedback = { msg: 'Hold still for a moment...', type: 'info' }
        } else if (!movementPassedRef.current) {
          currentFeedback = { msg: 'Now, move your head slightly left or right', type: 'info' }
        } else {
          currentFeedback = { msg: 'Liveness Verified — Start Capture', type: 'success' }
        }

        if (overlayRef.current) {
          const overlayCtx = overlayRef.current.getContext('2d')
          overlayRef.current.width = video.videoWidth
          overlayRef.current.height = video.videoHeight
          overlayCtx.clearRect(0, 0, video.videoWidth, video.videoHeight)
          overlayCtx.strokeStyle =
            currentFeedback.type === 'success' ? '#10b981' :
            currentFeedback.type === 'warning' ? '#f59e0b' : '#3b82f6'
          overlayCtx.lineWidth = 4
          overlayCtx.setLineDash(currentFeedback.type === 'success' ? [] : [10, 5])
          overlayCtx.lineDashOffset = -(time / 20)
          overlayCtx.strokeRect(x, y, width, height)
          overlayCtx.setLineDash([])
          overlayCtx.lineWidth = 8
          const cLen = 40
          overlayCtx.beginPath(); overlayCtx.moveTo(x, y + cLen); overlayCtx.lineTo(x, y); overlayCtx.lineTo(x + cLen, y); overlayCtx.stroke()
          overlayCtx.beginPath(); overlayCtx.moveTo(x + width - cLen, y); overlayCtx.lineTo(x + width, y); overlayCtx.lineTo(x + width, y + cLen); overlayCtx.stroke()
          overlayCtx.beginPath(); overlayCtx.moveTo(x, y + height - cLen); overlayCtx.lineTo(x, y + height); overlayCtx.lineTo(x + cLen, y + height); overlayCtx.stroke()
          overlayCtx.beginPath(); overlayCtx.moveTo(x + width - cLen, y + height); overlayCtx.lineTo(x + width, y + height); overlayCtx.lineTo(x + width, y + height - cLen); overlayCtx.stroke()
        }
      }
    }

    if (currentPhase === 'capturing' && currentFeedback.type === 'success') {
      const frame = canvas.toDataURL('image/jpeg', 0.6).split(',')[1]
      framesRef.current.push(frame)
      const newProgress = Math.round((framesRef.current.length / TOTAL_FRAMES) * 100)
      setProgress(newProgress)
      if (framesRef.current.length >= TOTAL_FRAMES) {
        phaseRef.current = 'processing'
        setPhase('processing')
        submitFrames(framesRef.current)
        return
      }
    }

    setFeedback(currentFeedback)
    requestRef.current = requestAnimationFrame(runDetection)
  }, [TOTAL_FRAMES])

  useEffect(() => {
    if (cameraAccess && (phase === 'camera' || phase === 'capturing')) {
      requestRef.current = requestAnimationFrame(runDetection)
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [cameraAccess, phase, runDetection])

  const startCapture = () => {
    if (feedback.type !== 'success' || serviceStatus !== 'online') return
    framesRef.current = []
    setProgress(0)
    phaseRef.current = 'capturing'
    setPhase('capturing')
  }

  const submitFrames = async (frames) => {
    setFeedback({ msg: 'Analyzing liveness & security...', type: 'info' })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000) // 20s hard timeout
    try {
      const csrf = await getCsrf()
      const res = await fetch(`${API}/verify/selfie`, {
        method: 'POST', credentials: 'include', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
        body: JSON.stringify({ livenessFrames: frames })
      })
      clearTimeout(timeout)

      const data = await res.json()
      if (data.success || data.liveness === true) {
        phaseRef.current = 'passed'
        setPhase('passed')
        setFeedback({ msg: 'Verification successful!', type: 'success' })
        setTimeout(() => onPass(data.selfie_b64), 1500)
      } else {
        phaseRef.current = 'failed'
        setPhase('failed')
        setError(data.error || 'Liveness check failed. Please try again in better lighting.')
      }
    } catch (e) {
      clearTimeout(timeout)
      phaseRef.current = 'failed'
      setPhase('failed')
      if (e.name === 'AbortError') {
        setError('Request timed out (20s). The vision service may be busy. Please try again.')
      } else {
        setError('Connection issue. The AI service is currently unreachable. Please try again.')
      }
    }
  }

  const reset = () => {
    phaseRef.current = 'camera'
    setPhase('camera')
    setError(null)
    framesRef.current = []
    setProgress(0)
    setIsStable(false)
    setMovementPassed(false)
    setStabilityScore(0)
    faceStartTimeRef.current = null
    stableFramesRef.current = 0
    lastFaceBoxRef.current = null
    initialFacePosRef.current = null
    movementHistoryRef.current = []
    isStableRef.current = false
    movementPassedRef.current = false
  }

  if (!modelsLoaded && !error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Loader size={48} color="var(--hectate-pink)" style={{ animation: 'spin 1s linear infinite', marginBottom: 20 }} />
        <p style={{ fontWeight: 600, color: 'var(--slate-600)' }}>Initializing AI Guard...</p>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--hectate-soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={16} color="var(--hectate-pink)" />
          </div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--slate-800)' }}>Step 1: Face Match</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--slate-50)', borderRadius: 20 }}>
          <Sun size={14} color={brightness < 40 ? '#ef4444' : brightness > 220 ? '#f59e0b' : '#10b981'} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate-500)' }}>{Math.round(brightness / 255 * 100)}% Light</span>
        </div>
      </div>

      <div style={{ 
        position: 'relative', width: '100%', aspectRatio: '4/3', 
        background: '#000', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', marginBottom: 24,
        border: `4px solid ${feedback.type === 'warning' ? '#f59e0b' : feedback.type === 'success' ? '#10b981' : '#e2e8f0'}`,
        animation: faceStartTimeRef.current && !isStable ? 'pulseScanner 2s infinite' : 'none'
      }}>
        {/* Stability Progress Bar */}
        {(faceStartTimeRef.current || stabilityScore > 0) && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, height: 6, 
            background: 'rgba(255,255,255,0.1)', zIndex: 40, overflow: 'hidden'
          }}>
            <div style={{ 
              height: '100%', 
              background: movementPassed ? '#10b981' : 'var(--hectate-pink)', 
              width: `${isStable ? (movementPassed ? 100 : 75) : stabilityScore * 0.75}%`,
              transition: 'all 0.3s ease-out',
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)'
            }} />
          </div>
        )}
        <video ref={videoRef} autoPlay playsInline muted 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
        
        <canvas ref={overlayRef} 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10, transform: 'scaleX(-1)' }} />
        
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Status Overlay */}
        <div style={{ 
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: 12, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)', color: '#fff', zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 10, minWidth: 200, justifyContent: 'center'
        }}>
          {feedback.type === 'warning' ? <AlertCircle size={18} color="#f59e0b" /> : 
           feedback.type === 'success' ? <Check size={18} color="#10b981" /> : 
           <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />}
          <span style={{ fontSize: 13, fontWeight: 600 }}>{feedback.msg}</span>
        </div>

        {phase === 'processing' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Loader size={40} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#fff', fontWeight: 700, margin: 0 }}>Processing Security...</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>This may take up to 20 seconds</p>
            <button
              onClick={reset}
              style={{
                marginTop: 8, padding: '8px 20px', background: 'rgba(255,255,255,0.15)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
            >
              Cancel & Retry
            </button>
          </div>
        )}
      </div>

      {/* ── CTA Button — always visible below the video ── */}
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        {error ? (
          <div>
            <div style={{ padding: 14, background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca', marginBottom: 12 }}>
              <p style={{ color: '#991b1b', fontSize: 13, fontWeight: 600, margin: 0 }}>{error}</p>
            </div>
            <button onClick={reset} style={{
              width: '100%', padding: 14, background: '#ef4444', color: '#fff',
              border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer'
            }}>↩ Retry Verification</button>
          </div>
        ) : phase === 'capturing' ? (
          <div style={{ padding: '0 4px' }}>
            <div style={{ height: 6, width: '100%', background: 'var(--slate-100)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', background: 'var(--gradient-main)', width: `${progress}%`, transition: 'width 0.2s' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--slate-400)', textAlign: 'center', fontWeight: 600 }}>Capturing biometric data... {progress}%</p>
          </div>
        ) : (
          <>
            <button
              onClick={startCapture}
              disabled={feedback.type !== 'success'}
              style={{
                width: '100%', padding: 16,
                background: feedback.type === 'success'
                  ? 'linear-gradient(135deg,#7c3aed,#ec4899)'
                  : '#e2e8f0',
                color: feedback.type === 'success' ? '#fff' : '#94a3b8',
                border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 15,
                cursor: feedback.type === 'success' ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.3s',
                boxShadow: feedback.type === 'success' ? '0 8px 24px rgba(124,58,237,0.35)' : 'none'
              }}
            >
              <Camera size={20} />
              {feedback.type === 'success' ? '▶  START LIVE CAPTURE' : 'Waiting for face detection...'}
            </button>
            {serviceStatus !== 'online' && (
              <p style={{ fontSize: 11, color: '#f59e0b', textAlign: 'center', margin: '8px 0 0', fontWeight: 600 }}>
                ⚠ Vision service offline — demo mode active
              </p>
            )}
          </>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
        Hectate uses edge AI for real-time security.<br/>Data is encrypted and never stored without your consent.
      </p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Aadhaar OCR (Gender Validation)
// ══════════════════════════════════════════════════════════════════════════════
function AadhaarStep({ onPass, selfieB64 }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError]             = useState(null)
  const [aadhaarFile, setAadhaarFile] = useState(null)
  const [aadhaarPreview, setAadhaarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setAadhaarFile(selected)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => { setAadhaarPreview(reader.result) }
    reader.readAsDataURL(selected)
  }

  const verifyAadhaar = async () => {
    if (!aadhaarFile) return
    setIsVerifying(true)
    setError(null)
    try {
      const csrf = await getCsrf()
      const formData = new FormData()
      formData.append('aadhaar', aadhaarFile)
      if (selfieB64) formData.append('selfie_b64', selfieB64)
      const res  = await fetch(`${API}/verify/aadhaar-match`, {
        method: 'POST', credentials: 'include',
        headers: { ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
        body: formData
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.reason || data.error || 'Aadhaar verification failed.')
      setTimeout(() => onPass(data), 1500)
    } catch (err) {
      console.error('[AADHAAR_MATCH]', err)
      setError(err.message)
      setIsVerifying(false)
    }
  }

  const resetImage = () => { setAadhaarPreview(null); setAadhaarFile(null); setError(null) }

  return (
    <div style={{ animation: 'fadeIn 0.4s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--hectate-soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FileText size={18} color="var(--hectate-pink)" />
        </div>
        <div>
          <h2 style={{ fontSize: 20, margin: 0, color: 'var(--slate-800)' }}>Step 2: Aadhaar Card</h2>
          <p style={{ fontSize: 13, color: 'var(--slate-500)', margin: 0 }}>Extracting OCR &amp; Identity Data</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />

      {/* Image zone */}
      {!aadhaarPreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', minHeight: 180, borderRadius: 16,
            border: '2px dashed var(--slate-200)', background: 'var(--slate-50)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'border 0.2s', marginBottom: 16
          }}
        >
          <Upload size={32} color="var(--slate-300)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 14, color: 'var(--slate-500)', margin: 0, fontWeight: 500 }}>Upload Front of Aadhaar Card</p>
          <p style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>Required for Gender &amp; Identity Check</p>
        </div>
      ) : (
        <div style={{
          width: '100%', borderRadius: 16, border: '2px solid var(--slate-100)',
          background: 'var(--slate-50)', padding: 16, marginBottom: 16, position: 'relative'
        }}>
          <img src={aadhaarPreview} alt="Aadhaar" style={{ width: '100%', height: 160, objectFit: 'contain', borderRadius: 8, display: 'block' }} />
          {isVerifying && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader size={28} color="var(--hectate-pink)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>
      )}

      {/* ── ACTION BUTTONS — outside image container, always visible ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Error banner */}
        {error && !isVerifying && (
          <div style={{ padding: 12, background: '#fef2f2', borderRadius: 10, border: '1px solid #fecaca', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#991b1b', margin: 0, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {/* Primary button */}
        {isVerifying ? (
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--hectate-pink)', textAlign: 'center', margin: 0, textTransform: 'uppercase' }}>
            Extracting Data...
          </p>
        ) : !aadhaarPreview ? (
          <button onClick={() => fileInputRef.current?.click()} style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff',
            fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.3)'
          }}>
            SELECT AADHAAR IMAGE
          </button>
        ) : (
          <button onClick={verifyAadhaar} style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#7c3aed,#ec4899)', color: '#fff',
            fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.3)'
          }}>
            {error ? 'RETRY OCR' : 'PROCEED TO VERIFY AADHAAR'}
          </button>
        )}

        {/* Change image */}
        {aadhaarPreview && !isVerifying && (
          <button onClick={resetImage} style={{
            width: '100%', padding: '11px', borderRadius: 12,
            border: '1.5px solid var(--slate-200)', background: '#fff',
            color: 'var(--slate-600)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
          }}>
            Upload Different Image
          </button>
        )}
      </div>
    </div>
  )
}

// STEP 3 — Biometric Face Match
// ══════════════════════════════════════════════════════════════════════════════
function MatchingStep({ selfieB64, aadhaarFaceB64, onPass }) {
  const [status, setStatus] = useState('initializing') // initializing|matching|failed|passed
  const [error, setError] = useState(null)
  const [confidence, setConfidence] = useState(0)

  useEffect(() => {
    const performMatch = async () => {
      setStatus('matching')
      try {
        const csrf = await getCsrf()
        const res = await fetch(`${API}/verify/match`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
          body: JSON.stringify({ selfie_b64: selfieB64, aadhaar_face_b64: aadhaarFaceB64 })
        })
        const data = await res.json()

        if (data.success && data.match) {
          setConfidence(Math.round(data.confidence * 100))
          setStatus('passed')
          setTimeout(onPass, 2000)
        } else {
          setStatus('failed')
          setError(data.error || 'Identity mismatch. The selfie does not match the Aadhaar photo.')
        }
      } catch (err) {
        setStatus('failed')
        setError('Verification service unavailable. Please try again later.')
      }
    }
    performMatch()
  }, [selfieB64, aadhaarFaceB64, onPass])

  return (
    <div style={{ animation: 'fadeIn 0.4s', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30, justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--hectate-soft-pink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={18} color="var(--hectate-pink)" />
        </div>
        <h2 style={{ fontSize: 20, margin: 0, color: 'var(--slate-800)' }}>Step 3: Biometric Match</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 40, position: 'relative' }}>
        <div style={{ width: 120, height: 120, borderRadius: 20, overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <img src={`data:image/jpeg;base64,${selfieB64}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Selfie" />
          <div style={{ position: 'absolute', bottom: -10, left: 40, background: '#10b981', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>LIVE</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {status === 'matching' ? (
            <div style={{ position: 'relative', width: 60, height: 2, background: 'var(--slate-100)' }}>
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                <RefreshCw size={20} color="var(--hectate-pink)" style={{ animation: 'spin 2s linear infinite' }} />
              </div>
            </div>
          ) : status === 'passed' ? (
            <Check size={32} color="#10b981" />
          ) : status === 'failed' ? (
            <X size={32} color="#ef4444" />
          ) : null}
        </div>

        <div style={{ width: 120, height: 120, borderRadius: 20, overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <img src={`data:image/jpeg;base64,${aadhaarFaceB64}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Aadhaar Face" />
          <div style={{ position: 'absolute', bottom: -10, right: 40, background: 'var(--hectate-pink)', color: '#fff', fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 800 }}>DOCUMENT</div>
        </div>
        
        {status === 'matching' && (
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'linear-gradient(rgba(124, 58, 237, 0.1), rgba(124, 58, 237, 0.1))',
            zIndex: 5, pointerEvents: 'none',
            borderTop: '2px solid var(--hectate-pink)',
            animation: 'scanLine 2s infinite ease-in-out'
          }} />
        )}
      </div>

      {status === 'matching' && (
        <div>
          <p style={{ fontWeight: 700, color: 'var(--slate-600)', marginBottom: 8 }}>Matching Biometrics...</p>
          <div style={{ width: 200, height: 6, background: 'var(--slate-100)', borderRadius: 3, margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--hectate-pink)', width: '60%', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      )}

      {status === 'passed' && (
        <div style={{ animation: 'slideIn 0.5s' }}>
          <div style={{ background: '#ecfdf5', padding: '12px 20px', borderRadius: 16, display: 'inline-block', border: '1px solid #10b981' }}>
            <p style={{ margin: 0, color: '#065f46', fontWeight: 800, fontSize: 14 }}>IDENTITY MATCHED: {confidence}% CONFIDENCE</p>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div style={{ animation: 'shake 0.5s' }}>
          <div style={{ background: '#fef2f2', padding: '20px', borderRadius: 16, border: '1px solid #fee2e2' }}>
            <p style={{ margin: '0 0 15px', color: '#991b1b', fontWeight: 600, fontSize: 14 }}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
            >
              Restart Verification
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Profile Setup
// ══════════════════════════════════════════════════════════════════════════════
// ── ProfileField: DEFINED OUTSIDE ProfileSetupStep to prevent unmount-on-rerender ──
const psFieldStyle = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }
const psLabelStyle = { fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: 0.3 }
const psHintStyle  = { fontSize: 10, color: '#94a3b8', marginTop: 3 }
const psErrStyle   = { fontSize: 11, color: '#dc2626', marginTop: 2 }

function ProfileField({ id, label, hint, err, children }) {
  return (
    <div style={psFieldStyle}>
      <label htmlFor={id} style={psLabelStyle}>{label}</label>
      {children}
      {hint && <span style={psHintStyle}>{hint}</span>}
      {err  && <span style={psErrStyle}>{err}</span>}
    </div>
  )
}

const psInputBase = {
  width: '100%', padding: '13px 14px', borderRadius: 10,
  border: '1.5px solid #d1d5db', background: '#f9f9fb',
  fontSize: 14, color: '#1e293b', outline: 'none',
  fontFamily: 'Outfit, sans-serif',
  transition: 'border 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
}
const psInputErr  = { ...psInputBase, border: '1.5px solid #dc2626', background: '#fff5f5' }
const psInputPr   = (pr) => ({ ...psInputBase, paddingRight: pr })
const psInputErrPr = (pr) => ({ ...psInputErr, paddingRight: pr })

// ── ─────────────────────────────────────────────────────────────────────── ──

function ProfileSetupStep({ onPass, formData, setFormData, loading }) {
  const [errors,  setErrors]     = useState({})
  const [preview, setPreview]    = useState(formData.avatarUrl || null)
  const [showPw,  setShowPw]     = useState(false)
  const [showCpw, setShowCpw]    = useState(false)
  const [confirmPw, setConfirmPw] = useState('')
  const fileInputRef = useRef(null)

  const validate = () => {
    const e = {}
    if (!formData.name)  e.name = 'Full name is required'
    if (!formData.alias) e.alias = 'Safety alias is required'
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
                         e.email = 'Valid email is required'
    const cleanPhone = (formData.mobileNumber || '').replace(/\D/g, '')
    if (cleanPhone.length !== 10) e.mobileNumber = 'Must be exactly 10 digits'
    const pwRe = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
    if (!formData.password || !pwRe.test(formData.password))
      e.password = 'Use 8+ chars, with a number & symbol'
    if (!confirmPw)
      e.confirmPw = 'Please confirm your password'
    else if (formData.password !== confirmPw)
      e.confirmPw = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFile = (f) => {
    if (!f) return
    if (f.size > 2 * 1024 * 1024) { alert('Photo must be under 2 MB'); return }
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
      setFormData(prev => ({ ...prev, avatarUrl: reader.result }))
    }
    reader.readAsDataURL(f)
  }

  const relWrap  = { position: 'relative' }
  const pwToggle = {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8',
    display: 'flex', alignItems: 'center'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f2f3f5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px 60px' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', padding: '36px 32px 32px', display: 'flex', flexDirection: 'column' }}>

        {/* Title */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', textAlign: 'center', marginBottom: 4, fontFamily: 'Playfair Display, serif' }}>
          Setup Your Profile
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 28, margin: '0 0 28px' }}>
          Identity verified. Now, create your digital self.
        </p>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div
            style={{ width: 96, height: 96, borderRadius: '50%', background: '#f1f5f9', border: '3px solid #fff', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: 'transform 0.2s' }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseOut={e  => e.currentTarget.style.transform = 'scale(1)'}
          >
            {preview
              ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Camera size={28} color="#EC1C6E" opacity={0.7} />
            }
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#EC1C6E', marginTop: 8, letterSpacing: 0.5 }}>ADD PHOTO</span>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>

        {/* Full Name */}
        <ProfileField id="ps-name" label="Full Name" err={errors.name}>
          <input
            id="ps-name"
            style={errors.name ? psInputErr : psInputBase}
            placeholder="Legal Name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </ProfileField>

        {/* Safety Alias */}
        <ProfileField id="ps-alias" label="Safety Alias" err={errors.alias}>
          <input
            id="ps-alias"
            style={errors.alias ? psInputErr : psInputBase}
            placeholder="@your_alias"
            value={formData.alias}
            onChange={e => setFormData(prev => ({ ...prev, alias: e.target.value }))}
          />
        </ProfileField>

        {/* Email */}
        <ProfileField id="ps-email" label="Email Address" err={errors.email}>
          <input
            id="ps-email"
            type="email"
            style={errors.email ? psInputErr : psInputBase}
            placeholder="your@email.com"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </ProfileField>

        {/* Mobile */}
        <ProfileField id="ps-mobile" label="Mobile Number" err={errors.mobileNumber}>
          <div style={relWrap}>
            <input
              id="ps-mobile"
              style={errors.mobileNumber ? psInputErrPr(40) : psInputPr(40)}
              placeholder="10-digit number"
              value={formData.mobileNumber}
              maxLength={10}
              onChange={e => setFormData(prev => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '') }))}
            />
            {(formData.mobileNumber || '').length === 10 && (
              <Check size={14} color="#16a34a" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
            )}
          </div>
        </ProfileField>

        {/* Password */}
        <ProfileField id="ps-pw" label="Password" hint="8+ chars, 1 number, 1 symbol" err={errors.password}>
          <div style={relWrap}>
            <input
              id="ps-pw"
              type={showPw ? 'text' : 'password'}
              style={errors.password ? psInputErrPr(40) : psInputPr(40)}
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
            <button style={pwToggle} tabIndex={-1} onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </ProfileField>

        {/* Confirm Password */}
        <ProfileField id="ps-cpw" label="Confirm Password" err={errors.confirmPw}>
          <div style={relWrap}>
            <input
              id="ps-cpw"
              type={showCpw ? 'text' : 'password'}
              style={errors.confirmPw ? psInputErrPr(40) : psInputPr(40)}
              placeholder="Re-enter password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
            />
            <button style={pwToggle} tabIndex={-1} onClick={() => setShowCpw(v => !v)} aria-label="Toggle confirm password">
              {showCpw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {/* Live match indicator */}
          {confirmPw && formData.password && confirmPw === formData.password && (
            <span style={{ fontSize: 11, color: '#16a34a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={11} /> Passwords match
            </span>
          )}
        </ProfileField>

        {/* CTA */}
        <button
          style={{
            width: '100%', padding: '15px', borderRadius: 14, border: 'none',
            background: loading ? '#f1a1bd' : 'linear-gradient(135deg,#EC1C6E,#ff4d94)',
            color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 10,
            boxShadow: '0 8px 24px rgba(236,28,110,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
          disabled={loading}
          onClick={() => validate() && onPass()}
        >
          {loading
            ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> CREATING ACCOUNT...</>
            : 'COMPLETE VERIFICATION'
          }
        </button>

        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 14 }}>
          🔒 Strict Safety Policy: One Aadhaar, One Person.
        </p>
      </div>
    </div>
  )
}

// MAIN VERIFICATION PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Verification() {
  const { login } = useContext(AuthContext)
  const [step, setStep] = useState(1);
  const [aadhaarFaceB64, setAadhaarFaceB64] = useState(null);
  const [selfieB64, setSelfieB64] = useState(null);
  const [serviceStatus, setServiceStatus] = useState('checking') // checking|online|offline
  
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

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API}/verify/health`);
        const data = await res.json();
        setServiceStatus(data.python === 'offline' ? 'offline' : 'online');
      } catch (err) {
        setServiceStatus('offline');
      }
    }
    checkHealth();
  }, []);

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
    <div className="verify-page" style={{ alignItems: 'flex-start', overflowY: 'auto', paddingTop: 40, paddingBottom: 40 }}>
      <div className="verify-card" style={{ animation: 'fadeUp 0.5s ease', maxWidth: 520, width: '100%', borderRadius: 24, marginLeft: 'auto', marginRight: 'auto' }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -20, paddingRight: 10 }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', 
              borderRadius: 20, 
              background: serviceStatus === 'online' ? '#ecfdf5' : serviceStatus === 'checking' ? '#f0f9ff' : '#fef2f2',
              border: `1px solid ${serviceStatus === 'online' ? '#10b981' : serviceStatus === 'checking' ? '#0ea5e9' : '#ef4444'}`,
              transition: 'all 0.3s'
            }}>
              <div style={{ 
                width: 6, height: 6, borderRadius: '50%', 
                background: serviceStatus === 'online' ? '#10b981' : serviceStatus === 'checking' ? '#0ea5e9' : '#ef4444',
                animation: serviceStatus === 'checking' ? 'pulse 1s infinite' : 'none'
              }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: serviceStatus === 'online' ? '#065f46' : serviceStatus === 'checking' ? '#0369a1' : '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Vision {serviceStatus}
              </span>
            </div>
          </div>

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
        {step === 1 && <LivenessStep serviceStatus={serviceStatus} onPass={(selfie) => {
          setSelfieB64(selfie)
          setStep(2)
        }} />}

        {step === 2 && <AadhaarStep serviceStatus={serviceStatus} selfieB64={selfieB64} onPass={(data) => {
          setFormData(prev => ({ 
            ...prev, 
            aadhaarHash: data.aadhaarHash,
            name: data.ocr_data?.name || prev.name,
            gender: data.ocr_data?.gender
          }))
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

