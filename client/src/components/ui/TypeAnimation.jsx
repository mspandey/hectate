import { useState, useEffect } from 'react'

export default function TypeAnimation({ text, speed = 50, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index])
        setIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      const timeout = setTimeout(onComplete, 1000) // Wait 1 second after typing
      return () => clearTimeout(timeout)
    }
  }, [index, text, speed, onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--bg-main, #050505)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5vw, 42px)',
        fontWeight: 300, color: 'var(--slate-800)', letterSpacing: '0.05em'
      }}>
        {displayedText}<span style={{ borderRight: '2px solid var(--purple-500)', marginLeft: '2px', animation: 'blink 0.7s infinite' }} />
      </h1>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  )
}
