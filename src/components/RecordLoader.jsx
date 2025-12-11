import { useState, useEffect } from 'react';
import './RecordLoader.css';

function RecordLoader({ message }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate tilt based on mouse position
  const tiltX = mousePos.y * 30; // -30 to 30 degrees
  const tiltY = mousePos.x * -30; // -30 to 30 degrees

  return (
    <div className="record-loader">
      <div
        className="record-container"
        style={{
          transform: `perspective(300px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
        }}
      >
        <svg viewBox="0 0 200 200" className="vinyl-record">
          {/* Outer ring */}
          <circle cx="100" cy="100" r="95" fill="#1a1a1a" />

          {/* Vinyl grooves */}
          <circle cx="100" cy="100" r="85" fill="none" stroke="#222" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="#222" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#222" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="#222" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="45" fill="none" stroke="#222" strokeWidth="0.5" />

          {/* Shiny reflection */}
          <ellipse
            cx="70"
            cy="70"
            rx="40"
            ry="20"
            fill="url(#vinylShine)"
            transform="rotate(-45 70 70)"
            opacity="0.15"
          />

          {/* Center label */}
          <circle cx="100" cy="100" r="35" fill="url(#labelGradient)" />

          {/* Label details */}
          <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

          {/* Center hole */}
          <circle cx="100" cy="100" r="5" fill="#0a0a0a" />
          <circle cx="100" cy="100" r="3" fill="#1a1a1a" />

          {/* Spotify icon on label */}
          <g transform="translate(85, 85) scale(0.6)">
            <path
              fill="#0a0a0a"
              opacity="0.3"
              d="M25 0C11.2 0 0 11.2 0 25s11.2 25 25 25 25-11.2 25-25S38.8 0 25 0zm11.46 36.08c-.48.72-1.38.96-2.1.48-5.76-3.52-13.02-4.32-21.56-2.36-.84.2-1.64-.32-1.84-1.12-.2-.84.32-1.64 1.12-1.84 9.36-2.12 17.38-1.2 23.9 2.76.72.4.92 1.36.48 2.08zm3.06-6.8c-.6.88-1.72 1.16-2.6.56-6.6-4.04-16.64-5.2-24.44-2.84-1.04.32-2.12-.28-2.44-1.28-.32-1.04.28-2.12 1.28-2.44 8.92-2.72 20.02-1.4 27.62 3.24.84.56 1.16 1.72.58 2.76zm.28-7.08c-7.92-4.72-20.96-5.16-28.52-2.84-1.2.36-2.48-.32-2.84-1.52-.36-1.2.32-2.48 1.52-2.84 8.68-2.64 23.08-2.12 32.2 3.32 1.08.64 1.44 2.04.8 3.12-.6 1.04-2 1.4-3.16.76z"
            />
          </g>

          <defs>
            <linearGradient id="labelGradient" x1="65" y1="65" x2="135" y2="135" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1DB954" />
              <stop offset="0.5" stopColor="#1ed760" />
              <stop offset="1" stopColor="#15a049" />
            </linearGradient>
            <radialGradient id="vinylShine" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      {message && <p className="record-message">{message}</p>}
    </div>
  );
}

export default RecordLoader;
