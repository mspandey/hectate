import { useEffect, useRef, useMemo } from 'react'

/**
 * Text that "swims" — words shift perpendicular to cursor direction
 * when cursor approaches within 120px. Preserves readability.
 */
export default function SwimText({ children, className = '', as: Tag = 'p', style = {} }) {
  const containerRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef(null)

  // Split text into words
  const words = useMemo(() => {
    if (typeof children !== 'string') return null
    return children.split(/(\s+)/)
  }, [children])

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !words) return

    const handleMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMove, { passive: true })

    const update = () => {
      if (!containerRef.current) {
        rafRef.current = requestAnimationFrame(update)
        return
      }
      const spans = containerRef.current.querySelectorAll('.swim-word')
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      spans.forEach(span => {
        const rect = span.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = cx - mx
        const dy = cy - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const threshold = 120

        if (dist < threshold && dist > 0) {
          const factor = (1 - dist / threshold) * 5
          // Perpendicular offset
          const nx = -dy / dist
          const ny = dx / dist
          span.style.transform = `translate(${nx * factor}px, ${ny * factor}px)`
        } else {
          span.style.transform = 'translate(0, 0)'
        }
      })

      rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [words])

  if (!words) {
    return <Tag className={className} style={style}>{children}</Tag>
  }

  return (
    <Tag ref={containerRef} className={`swim-text ${className}`} style={{ letterSpacing: '0.5px', ...style }}>
      {words.map((word, i) =>
        word.match(/^\s+$/) ? (
          <span key={i}>{word}</span>
        ) : (
          <span
            key={i}
            className="swim-word"
            style={{
              display: 'inline-block',
              transition: 'transform 0.15s ease-out',
              willChange: 'transform',
            }}
          >
            {word}
          </span>
        )
      )}
    </Tag>
  )
}
