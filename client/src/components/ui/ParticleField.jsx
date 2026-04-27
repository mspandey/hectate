import { useEffect, useRef } from 'react'

/**
 * Floating particle field that responds to cursor proximity.
 * Renders on a canvas overlay with pointer-events: none.
 */
export default function ParticleField({ count = 14 }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const particlesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      baseX: 0,
      baseY: 0,
      radius: 2 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      hue: Math.random() > 0.5 ? 330 : 270, // pink or purple
    }))
    particlesRef.current.forEach(p => { p.baseX = p.x; p.baseY = p.y })

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })

    let animId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      particlesRef.current.forEach(p => {
        // Drift
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // Cursor repulsion
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repelRadius = 80

        let drawX = p.x
        let drawY = p.y

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * 20
          drawX += (dx / dist) * force
          drawY += (dy / dist) * force
        }

        // Draw
        ctx.beginPath()
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.radius)
        if (p.hue === 330) {
          gradient.addColorStop(0, `rgba(236, 72, 153, ${p.opacity})`)
          gradient.addColorStop(1, `rgba(236, 72, 153, 0)`)
        } else {
          gradient.addColorStop(0, `rgba(168, 85, 247, ${p.opacity})`)
          gradient.addColorStop(1, `rgba(168, 85, 247, 0)`)
        }
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animId)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
