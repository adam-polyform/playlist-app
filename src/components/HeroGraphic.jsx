import './HeroGraphic.css';

function HeroGraphic() {
  // Sample "photos" with different colors representing different types
  const photoTypes = [
    { color: '#E84855', label: 'movie' },      // Movie poster red
    { color: '#F9DC5C', label: 'sunset' },     // Nature yellow
    { color: '#3185FC', label: 'ocean' },      // Ocean blue
    { color: '#5C4D7D', label: 'city' },       // City purple
    { color: '#2E8B57', label: 'forest' },     // Forest green
    { color: '#FF6B35', label: 'car' },        // Car orange
    { color: '#C9B1FF', label: 'lifestyle' },  // Lifestyle lavender
    { color: '#1A1A2E', label: 'night' },      // Night photo
  ];

  return (
    <div className="hero-graphic">
      {/* Input photos side */}
      <div className="photos-input">
        {photoTypes.map((photo, i) => (
          <div
            key={i}
            className={`photo-card photo-${i}`}
            style={{ '--photo-color': photo.color }}
          >
            <div className="photo-shine"></div>
          </div>
        ))}
      </div>

      {/* Flow lines going into logo */}
      <div className="flow-lines flow-in">
        <div className="flow-particle"></div>
        <div className="flow-particle"></div>
        <div className="flow-particle"></div>
      </div>

      {/* Center logo */}
      <div className="hero-logo">
        <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="#61626D" strokeWidth="2"/>
          <circle cx="20" cy="20" r="6" fill="#61626D"/>
          <path d="M20 8V14" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
          <path d="M20 26V32" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 20H14" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
          <path d="M26 20H32" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Flow lines going out */}
      <div className="flow-lines flow-out">
        <div className="flow-particle spotify-particle"></div>
        <div className="flow-particle spotify-particle"></div>
        <div className="flow-particle spotify-particle"></div>
      </div>

      {/* Output playlists side */}
      <div className="playlists-output">
        <div className="playlist-card playlist-0">
          <div className="playlist-art">
            <div className="art-grid">
              <span style={{ background: '#E84855' }}></span>
              <span style={{ background: '#3185FC' }}></span>
              <span style={{ background: '#F9DC5C' }}></span>
              <span style={{ background: '#2E8B57' }}></span>
            </div>
          </div>
          <div className="playlist-lines">
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="playlist-card playlist-1">
          <div className="playlist-art single" style={{ background: 'linear-gradient(135deg, #1DB954, #191414)' }}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="white" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div className="playlist-lines">
            <span></span>
            <span></span>
          </div>
        </div>
        <div className="playlist-card playlist-2">
          <div className="playlist-art">
            <div className="art-grid">
              <span style={{ background: '#5C4D7D' }}></span>
              <span style={{ background: '#FF6B35' }}></span>
              <span style={{ background: '#C9B1FF' }}></span>
              <span style={{ background: '#1A1A2E' }}></span>
            </div>
          </div>
          <div className="playlist-lines">
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroGraphic;
