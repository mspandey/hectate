import { NavLink } from 'react-router-dom'

export default function Navbar() {
  const navItems = [
    { name: 'Community', path: '/feed' },
    { name: 'Lawyers',   path: '/lawyers' },
    { name: 'Know Your Rights', path: '/know-your-rights' },
    { name: 'Profile',   path: '/profile' },
  ]

  return (
    <nav className="hectate-nav-links">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `hectate-nav-link ${isActive ? 'active' : ''}`
          }
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
  )
}

