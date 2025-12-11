import { useState, useEffect } from 'react';
import './HeroGraphic.css';

function HeroGraphic({ isLoading }) {
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

  // Blur increases with distance from center (100px at center, 220px at edges)
  const blur = 100 + (distFromCenter * 120);

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

        {/* Logo - M letter */}
        <div className="flow-item">
          <div className="app-icon">
            <span className="app-icon-letter">M</span>
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
        <h1 className={`hero-title ${isLoading ? 'shimmer' : ''}`}>Moodlist</h1>
        <p className="hero-subtitle">Transform photos into playlists</p>
      </div>
    </div>
  );
}

export default HeroGraphic;
