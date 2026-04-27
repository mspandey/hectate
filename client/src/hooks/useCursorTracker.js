import { useEffect, useRef, useCallback } from 'react'

/**
 * Global cursor tracking hook with performance-optimized RAF loop.
 * Updates CSS custom properties on :root for cursor position.
 * Returns a ref callback to attach to any element for local tracking.
 */
export default function useCursorTracker() {
  const rafId = useRef(null)
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    const updateCSS = () => {
      const { x, y } = mousePos.current
      document.documentElement.style.setProperty('--cursor-x', `${x}px`)
      document.documentElement.style.setProperty('--cursor-y', `${y}px`)
      rafId.current = requestAnimationFrame(updateCSS)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    rafId.current = requestAnimationFrame(updateCSS)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  return mousePos
}
