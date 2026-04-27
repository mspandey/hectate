import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Community Feed', path: '/about/feed' },
    { name: 'Lawyer Directory', path: '/about/lawyers' }
  ]

  return (
    <nav className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate('/')} style={{fontFamily: "'Playfair Display', serif", fontSize: 28, cursor: 'pointer', fontWeight: 800, letterSpacing: '2px'}}>
          HECTATE
        </div>

        {/* Desktop Menu */}
        <div className="nav-links desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`nav-item ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          {/* Theme Toggle */}
          <ThemeToggle />

          <button className="btn btn-primary desktop-only" style={{padding: '10px 24px'}} onClick={() => navigate('/join')}>
            JOIN
          </button>
          
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className="mobile-nav-item"
            onClick={() => setIsOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        <div style={{padding: '20px'}}>
          <button className="btn btn-primary w-full" style={{width: '100%', padding: '12px'}} onClick={() => { navigate('/join'); setIsOpen(false); }}>
            JOIN
          </button>
        </div>
      </div>
    </nav>
  )
}
