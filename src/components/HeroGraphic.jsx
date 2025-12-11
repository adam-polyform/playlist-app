import { useState, useEffect, useRef } from 'react';
import './HeroGraphic.css';

function HeroGraphic({ isLoading }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [motionPos, setMotionPos] = useState({ x: 0, y: 0 });
  const [useMotion, setUseMotion] = useState(false);
  const [showLightning, setShowLightning] = useState(false);
  const [lightningPosition, setLightningPosition] = useState({ x: 50, y: 0 });
  const lightningTimeoutRef = useRef(null);

  // Lightning animation every 30 seconds
  useEffect(() => {
    const triggerLightning = () => {
      // Random horizontal position
      setLightningPosition({ x: 20 + Math.random() * 60, y: 0 });
      setShowLightning(true);

      // Hide lightning after animation
      lightningTimeoutRef.current = setTimeout(() => {
        setShowLightning(false);
      }, 300);
    };

    // Initial lightning after 30 seconds
    const interval = setInterval(triggerLightning, 30000);

    return () => {
      clearInterval(interval);
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current);
      }
    };
  }, []);

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!useMotion) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [useMotion]);

  // Accelerometer/gyroscope handler
  useEffect(() => {
    const handleDeviceOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        setUseMotion(true);
        // gamma: left/right tilt (-90 to 90)
        // beta: front/back tilt (-180 to 180)
        const x = (e.gamma + 45) / 90; // Normalize to 0-1
        const y = (e.beta + 45) / 90;  // Normalize to 0-1
        setMotionPos({
          x: Math.max(0, Math.min(1, x)),
          y: Math.max(0, Math.min(1, y))
        });
      }
    };

    // Request permission for iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Will be triggered by user interaction elsewhere
    } else {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  // Use motion data if available, otherwise use mouse
  const activePos = useMotion ? motionPos : mousePos;

  // Calculate distance from center (0 at center, 1 at corners)
  const distX = (activePos.x - 0.5) * 2;
  const distY = (activePos.y - 0.5) * 2;
  const distFromCenter = Math.sqrt(distX * distX + distY * distY) / Math.sqrt(2);

  // Blur increases with distance from center (100px at center, 220px at edges)
  const blur = 100 + (distFromCenter * 120);

  // Deformation based on position
  const scaleX = 1 + (distX * 0.15);
  const scaleY = 1 + (distY * 0.15);
  const offsetX = distX * 100;
  const offsetY = distY * 100;

  // Export motion position for RecordLoader
  useEffect(() => {
    window.moodlistMotion = useMotion ? motionPos : null;
  }, [useMotion, motionPos]);

  return (
    <div className="hero-section">
      {/* 8-bit Lightning bolt */}
      {showLightning && (
        <div
          className="lightning-bolt"
          style={{ left: `${lightningPosition.x}%` }}
        >
          <svg viewBox="0 0 24 80" fill="white" xmlns="http://www.w3.org/2000/svg">
            {/* 8-bit style lightning bolt made of rectangles */}
            <rect x="12" y="0" width="4" height="8"/>
            <rect x="8" y="8" width="8" height="4"/>
            <rect x="8" y="12" width="4" height="8"/>
            <rect x="4" y="20" width="8" height="4"/>
            <rect x="4" y="24" width="4" height="8"/>
            <rect x="8" y="32" width="8" height="4"/>
            <rect x="12" y="36" width="4" height="8"/>
            <rect x="8" y="44" width="8" height="4"/>
            <rect x="8" y="48" width="4" height="8"/>
            <rect x="12" y="56" width="4" height="8"/>
            <rect x="8" y="64" width="8" height="4"/>
            <rect x="10" y="68" width="4" height="12"/>
          </svg>
        </div>
      )}

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
