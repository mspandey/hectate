import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

export default function StickyHeader() {
  const navigate = useNavigate()

  return (
    <header className="hectate-navbar">
      <div className="hectate-brand" onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
        <div className="hectate-brand-dot" />
        HECTATE
      </div>

      <div className="nav-center">
        <Navbar />
      </div>

      <div className="navbar-right-placeholder" />
    </header>
  )
}

