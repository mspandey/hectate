import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="hectate-navbar">
      <div className="hectate-brand">
        <div className="hectate-brand-dot"></div>
        hectate
      </div>
      
      <div className="hectate-nav-links">
        <NavLink to="/feed" className={({isActive}) => `hectate-nav-link ${isActive ? 'active' : ''}`}>
          Feed
        </NavLink>
        <NavLink to="/lawyers" className={({isActive}) => `hectate-nav-link ${isActive ? 'active' : ''}`}>
          Directory
        </NavLink>

        <NavLink to="/profile" className={({isActive}) => `hectate-nav-link ${isActive ? 'active' : ''}`}>
          Profile
        </NavLink>
      </div>

      <div className="navbar-right-placeholder" />
    </nav>
  );
}
