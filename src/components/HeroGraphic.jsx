import { useState, useEffect } from 'react';
import './HeroGraphic.css';

function HeroGraphic() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate distance from center (0 at center, 1 at corners)
  const distX = (mousePos.x - 0.5) * 2;
  const distY = (mousePos.y - 0.5) * 2;
  const distFromCenter = Math.sqrt(distX * distX + distY * distY) / Math.sqrt(2);

  // Blur increases with distance from center (60px at center, 160px at edges)
  const blur = 60 + (distFromCenter * 100);

  // Deformation based on mouse position
  const scaleX = 1 + (distX * 0.15);
  const scaleY = 1 + (distY * 0.15);
  const offsetX = distX * 100;
  const offsetY = distY * 100;

  return (
    <div className="hero-section">
      {/* Interactive gradient orb */}
      <div
        className="hero-orb"
        style={{
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
          filter: `blur(${blur}px)`
        }}
      >
        <div
          className="hero-orb-inner"
          style={{
            transform: `scaleX(${scaleX}) scaleY(${scaleY})`
          }}
        />
      </div>

      {/* Main flow: Photo → Logo → Playlist */}
      <div className="hero-flow">
        {/* Photo card */}
        <div className="flow-item">
          <div className="preview-card">
            <div className="card-image">
              <div className="image-placeholder sunset"></div>
            </div>
          </div>
          <span className="flow-label">Photo</span>
        </div>

        {/* Arrow */}
        <div className="flow-arrow">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path d="M0 8H28M28 8L20 2M28 8L20 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Logo */}
        <div className="flow-item">
          <div className="app-icon">
            <svg width="48" height="48" viewBox="0 0 56 56" fill="none">
              <rect x="8" y="14" width="40" height="28" rx="4" fill="url(#iconGradient)"/>
              <circle cx="20" cy="24" r="6" fill="#1a1a1a"/>
              <circle cx="36" cy="24" r="6" fill="#1a1a1a"/>
              <circle cx="20" cy="24" r="2.5" fill="url(#iconGradient)"/>
              <circle cx="36" cy="24" r="2.5" fill="url(#iconGradient)"/>
              <rect x="14" y="32" width="28" height="6" rx="2" fill="#1a1a1a"/>
              <circle cx="20" cy="35" r="2" fill="#2a2a2a"/>
              <circle cx="36" cy="35" r="2" fill="#2a2a2a"/>
              <defs>
                <linearGradient id="iconGradient" x1="8" y1="14" x2="48" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1DB954"/>
                  <stop offset="0.5" stopColor="#1ed760"/>
                  <stop offset="1" stopColor="#15a049"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="flow-label">Moodlist</span>
        </div>

        {/* Arrow */}
        <div className="flow-arrow">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path d="M0 8H28M28 8L20 2M28 8L20 14" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Playlist card */}
        <div className="flow-item">
          <div className="preview-card">
            <div className="card-tracks">
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines"><span></span><span></span></div>
              </div>
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines"><span></span><span></span></div>
              </div>
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines"><span></span><span></span></div>
              </div>
            </div>
          </div>
          <span className="flow-label">Playlist</span>
        </div>
      </div>

      {/* Title below */}
      <div className="hero-text">
        <h1 className="hero-title">Moodlist</h1>
        <p className="hero-subtitle">Transform photos into playlists with AI</p>
      </div>
    </div>
  );
}

export default HeroGraphic;
