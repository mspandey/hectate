import { useEffect, useRef } from 'react'

/**
 * Cursor-following radial ripple effect.
 * A soft expanding wave emanates from cursor position.
 */
export default function CursorRipple() {
  const containerRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (containerRef.current) {
        containerRef.current.style.setProperty('--ripple-x', `${e.clientX}px`)
        containerRef.current.style.setProperty('--ripple-y', `${e.clientY}px`)
      }
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div
      ref={containerRef}
      className="cursor-ripple-container"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        className="cursor-ripple"
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(168,85,247,0.04) 40%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          left: 'var(--ripple-x, -1000px)',
          top: 'var(--ripple-y, -1000px)',
          transition: 'left 0.08s ease-out, top 0.08s ease-out',
        }}
      />
    </div>
  )
}
