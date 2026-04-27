import { useRef, useCallback } from 'react'

/**
 * 3D tilt card with perspective(1000px).
 * Tilts based on mouse position within card bounds on hover.
 * Bouncy spring-feel transition.
 */
export default function TiltCard({ children, className = '', style = {}, onClick, id }) {
  const cardRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateY = ((x - centerX) / centerX) * 8
    const rotateX = ((centerY - y) / centerY) * 6
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
  }, [])

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      id={id}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
