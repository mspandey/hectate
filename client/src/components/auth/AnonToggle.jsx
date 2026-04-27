import { useState } from 'react';

export default function AnonToggle({ isAnon, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="anon-toggle-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="toggle-icon">👁</span>
      <div 
        className={`toggle-track ${isAnon ? 'anon' : ''}`}
        onClick={() => onChange(!isAnon)}
      >
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-icon">🎭</span>
      <span className="toggle-label">{isAnon ? 'Anon' : 'Public'}</span>
      
      {showTooltip && (
        <div className="auth-tooltip">
          {isAnon 
            ? "Your activity shows as 'Anonymous Member'" 
            : "Your alias is visible to verified members"}
        </div>
      )}
    </div>
  );
}
