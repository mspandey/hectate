import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────
const FRAME_COUNT    = 30;   // total frames to capture
const FRAME_INTERVAL = 100;  // ms between frames  → 3 seconds total
const PRIMARY_FRAME  = 15;   // middle frame used as selfie

// ─── Phases ───────────────────────────────────────────────────────────────────
// idle → starting → instructions → recording → processing → done | failed

export default function FaceCapture({ userId, onVerified }) {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);          // FIX: track interval so we can clear on unmount

  const [phase,      setPhase]      = useState('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [progress,   setProgress]   = useState(0);   // FIX: show scan progress to user
  const [camStarting,setCamStarting]= useState(false); // FIX: prevent double-click spam

  // ── Cleanup helper (used on unmount AND on retry) ─────────────────────────
  const stopStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    // FIX: clear video srcObject so browser releases camera LED
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopStream(), [stopStream]);

  // ── Start camera ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    if (camStarting) return;               // FIX: guard against double-click
    setCamStarting(true);
    setErrorMsg('');

    try {
      // FIX: ask for exact constraints; fall back gracefully if not supported
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width:      { ideal: 640 },
          height:     { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      // FIX: wait for video to actually be playing before advancing phase
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = resolve;
          videoRef.current.onerror          = reject;
        });
        await videoRef.current.play();
      }

      setPhase('instructions');
    } catch (err) {
      // FIX: distinguish permission denial from hardware errors
      const msg =
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : err.name === 'NotFoundError'
          ? 'No camera detected on this device.'
          : 'Could not start camera. Please check your device and try again.';
      setErrorMsg(msg);
      stopStream();
    } finally {
      setCamStarting(false);
    }
  };

  // ── Capture frames ────────────────────────────────────────────────────────
  const captureFrames = useCallback(() => {
    // FIX: guard — video must be ready
    if (!videoRef.current || videoRef.current.readyState < 2) {
      setErrorMsg('Camera not ready. Please wait a moment and try again.');
      return;
    }

    setPhase('recording');
    setProgress(0);
    setErrorMsg('');

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    // FIX: read actual dimensions from video instead of hardcoding
    canvas.width  = videoRef.current.videoWidth  || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const captured = [];
    let count = 0;

    intervalRef.current = setInterval(() => {
      // FIX: safety check — video might have gone away mid-capture
      if (!videoRef.current || videoRef.current.readyState < 2) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPhase('failed');
        setErrorMsg('Camera feed lost during scan. Please retry.');
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      captured.push(canvas.toDataURL('image/jpeg', 0.7));
      count++;

      setProgress(Math.round((count / FRAME_COUNT) * 100));

      if (count >= FRAME_COUNT) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        sendForVerification(captured);
      }
    }, FRAME_INTERVAL);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send to backend ───────────────────────────────────────────────────────
  const sendForVerification = async (capturedFrames) => {
    setPhase('processing');

    // FIX: validate we actually have enough frames before hitting the API
    if (!capturedFrames || capturedFrames.length < FRAME_COUNT) {
      setPhase('failed');
      setErrorMsg('Insufficient frames captured. Please retry in better lighting.');
      return;
    }

    const selfieFrame = capturedFrames[PRIMARY_FRAME];

    try {
      const { data } = await axios.post(
        '/api/verify/face',
        {
          userId,
          livenessFrames: capturedFrames,
          selfieFrame,
          documentPhoto: null,
        },
        {
          timeout: 30_000,  // FIX: add timeout — AI inference can be slow
        }
      );

      // FIX: check data shape before calling onVerified
      if (data?.success) {
        setPhase('done');
        stopStream();       // FIX: release camera after success
        if (typeof onVerified === 'function') onVerified(data);
      } else {
        // Backend returned 200 but success=false
        setPhase('failed');
        setErrorMsg(data?.message || 'Verification could not be confirmed. Please retry.');
      }
    } catch (err) {
      setPhase('failed');

      // FIX: handle network vs server vs timeout errors distinctly
      const msg =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. The server is taking too long — please retry.'
          : err.response?.data?.message
          ? err.response.data.message
          : err.message === 'Network Error'
          ? 'Network error — check your connection and retry.'
          : 'Verification failed. Try better lighting or move closer to the camera.';

      setErrorMsg(msg);
    }
  };

  // ── Retry — full reset ────────────────────────────────────────────────────
  const handleRetry = () => {
    stopStream();
    setProgress(0);
    setErrorMsg('');
    setPhase('idle');
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        textAlign:    'center',
        background:   'var(--surface)',
        padding:      16,
        borderRadius: 16,
        border:       '1px solid var(--border)',
      }}
    >
      {/* ── Video viewport ── */}
      <div
        style={{
          position:     'relative',
          width:        '100%',
          maxWidth:     300,
          margin:       '0 auto 16px',
          borderRadius: '50%',
          overflow:     'hidden',
          aspectRatio:  '1 / 1',
          background:   '#000',
        }}
      >
        {/* FIX: video always rendered so ref is always valid */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width:      '100%',
            height:     '100%',
            objectFit:  'cover',
            // hide the element visually when camera hasn't started yet
            opacity: phase === 'idle' || phase === 'starting' ? 0 : 1,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Idle overlay */}
        {phase === 'idle' && (
          <div
            style={{
              position:   'absolute',
              inset:       0,
              display:    'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color:      'var(--muted)',
              fontSize:   32,
            }}
          >
            👤
          </div>
        )}

        {/* Recording pulse ring */}
        {phase === 'recording' && (
          <div
            style={{
              position:     'absolute',
              inset:         0,
              border:       '4px solid var(--rose)',
              borderRadius: '50%',
              animation:    'pulse 1s infinite',
              pointerEvents:'none',
            }}
          />
        )}

        {/* Processing overlay */}
        {phase === 'processing' && (
          <div
            style={{
              position:       'absolute',
              inset:           0,
              background:     'rgba(0,0,0,0.55)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       28,
            }}
          >
            🔍
          </div>
        )}
      </div>

      {/* Hidden canvas used for frame extraction */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Progress bar (recording phase) ── */}
      {phase === 'recording' && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              height:       6,
              borderRadius: 3,
              background:   'var(--border)',
              overflow:     'hidden',
              maxWidth:     240,
              margin:       '0 auto 6px',
            }}
          >
            <div
              style={{
                height:     '100%',
                width:      `${progress}%`,
                background: 'var(--rose)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            Scanning… {progress}%
          </p>
        </div>
      )}

      {/* ── Error message ── */}
      {errorMsg && (
        <div
          role="alert"
          style={{ color: 'var(--error)', marginBottom: 12, fontSize: 13 }}
        >
          {errorMsg}
        </div>
      )}

      {/* ── Phase-specific actions ── */}
      {phase === 'idle' && (
        <button
          type="button"
          className="auth-btn-primary"
          onClick={startCamera}
          disabled={camStarting}
        >
          {camStarting ? 'Starting camera…' : 'Start Camera'}
        </button>
      )}

      {phase === 'instructions' && (
        <div>
          <p style={{ fontSize: 14, marginBottom: 16, color: 'var(--muted)' }}>
            Position your face in the circle &amp; <strong>blink naturally</strong>
          </p>
          <button
            type="button"
            className="auth-btn-primary"
            onClick={captureFrames}
          >
            Begin Scan
          </button>
        </div>
      )}

      {phase === 'processing' && (
        <div style={{ color: 'var(--burgundy)', fontWeight: 600 }}>
          🔍 Analysing live feed…
        </div>
      )}

      {phase === 'done' && (
        <div style={{ color: 'var(--success)', fontWeight: 600 }}>
          ✅ Face Verified Successfully
        </div>
      )}

      {/* FIX: failed state now also shows error and retry */}
      {phase === 'failed' && (
        <div>
          <button
            type="button"
            className="auth-btn-primary"
            onClick={handleRetry}
          >
            Retry Scan
          </button>
        </div>
      )}
    </div>
  );
}
