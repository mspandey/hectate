import React from 'react';
import { useTheme } from '../../store/ThemeContext';
import '../../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-wrapper">
      <label id="theme-toggle-button" htmlFor="toggle">
        <input 
          type="checkbox" 
          id="toggle" 
          checked={isDark} 
          onChange={toggleTheme} 
        />
        <div id="container">
          <div id="button">
            <div id="sun"></div>
            <div id="moon"></div>
          </div>
          <div id="cloud"></div>
          <div id="stars">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;
