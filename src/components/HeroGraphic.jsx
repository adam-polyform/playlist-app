import './HeroGraphic.css';

function HeroGraphic() {
  return (
    <div className="hero-section">
      {/* Background gradient orbs */}
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      <div className="hero-orb hero-orb-3"></div>

      {/* Main content */}
      <div className="hero-content">
        {/* App icon logo */}
        <div className="app-icon">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            {/* Modern cassette icon */}
            <rect x="8" y="14" width="40" height="28" rx="4" fill="url(#iconGradient)"/>
            {/* Tape reels */}
            <circle cx="20" cy="24" r="6" fill="#1a1a1a"/>
            <circle cx="36" cy="24" r="6" fill="#1a1a1a"/>
            <circle cx="20" cy="24" r="2.5" fill="url(#iconGradient)"/>
            <circle cx="36" cy="24" r="2.5" fill="url(#iconGradient)"/>
            {/* Bottom window */}
            <rect x="14" y="32" width="28" height="6" rx="2" fill="#1a1a1a"/>
            <circle cx="20" cy="35" r="2" fill="#2a2a2a"/>
            <circle cx="36" cy="35" r="2" fill="#2a2a2a"/>
            <defs>
              <linearGradient id="iconGradient" x1="8" y1="14" x2="48" y2="42" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF6B35"/>
                <stop offset="0.5" stopColor="#F7931E"/>
                <stop offset="1" stopColor="#FFD93D"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <h1 className="hero-title">Moodlist</h1>
        <p className="hero-subtitle">Transform photos into playlists with AI</p>

        {/* Floating preview cards */}
        <div className="hero-cards">
          <div className="preview-card card-left">
            <div className="card-image">
              <div className="image-placeholder sunset"></div>
            </div>
            <span className="card-label">Photo</span>
          </div>

          <div className="flow-arrow">
            <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
              <path d="M0 12H36M36 12L26 4M36 12L26 20" stroke="url(#arrowGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="arrowGradient" x1="0" y1="12" x2="36" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6B35" stopOpacity="0.3"/>
                  <stop offset="1" stopColor="#1DB954"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="preview-card card-right">
            <div className="card-tracks">
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines">
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines">
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mini-track">
                <span className="track-dot"></span>
                <div className="track-lines">
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
            <span className="card-label">Playlist</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroGraphic;
