import { useState, useEffect } from 'react';
import PhotoCapture from './components/PhotoCapture';
import PlaylistDisplay from './components/PlaylistDisplay';
import HeroGraphic from './components/HeroGraphic';
import './App.css';

// API is served from the same origin
const API_URL = '';

function App() {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [spotifyUser, setSpotifyUser] = useState(null);

  // Handle OAuth callback and check user status on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('spotify_session');
    const authError = urlParams.get('auth_error');

    if (authError) {
      setError(`Spotify login failed: ${authError}`);
      window.history.replaceState({}, '', '/');
    } else if (sessionToken) {
      localStorage.setItem('spotify_session', sessionToken);
      window.history.replaceState({}, '', '/');
    }

    // Check if user is already logged in
    const storedSession = localStorage.getItem('spotify_session');
    if (storedSession) {
      checkUserStatus(storedSession);
    }
  }, []);

  const checkUserStatus = async (sessionToken) => {
    try {
      const response = await fetch(`${API_URL}/api/user-status`, {
        headers: { 'x-spotify-session': sessionToken }
      });
      const data = await response.json();
      if (data.authenticated) {
        setSpotifyUser(data);
      } else {
        localStorage.removeItem('spotify_session');
      }
    } catch (err) {
      console.error('Failed to check user status:', err);
    }
  };

  const handleSpotifyLogin = () => {
    window.location.href = '/auth/spotify';
  };

  const handleSpotifyLogout = async () => {
    const sessionToken = localStorage.getItem('spotify_session');
    if (sessionToken) {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        headers: { 'x-spotify-session': sessionToken }
      });
    }
    localStorage.removeItem('spotify_session');
    setSpotifyUser(null);
  };

  const handlePhotoCapture = async (imageData) => {
    setImagePreview(imageData);
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setTracks([]);

    try {
      // Step 1: Analyze the image with Claude
      setLoadingMessage('Analyzing your photo...');
      const analyzeResponse = await fetch(`${API_URL}/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData })
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }

      const analysisData = await analyzeResponse.json();
      setAnalysis(analysisData.analysis);

      // Step 2: Search for tracks on Spotify
      setLoadingMessage('Finding the perfect songs...');
      const searchResponse = await fetch(`${API_URL}/api/search-tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songs: analysisData.songs })
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || 'Failed to search tracks');
      }

      const tracksData = await searchResponse.json();
      setTracks(tracksData.tracks);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setAnalysis(null);
    setTracks([]);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <HeroGraphic />
      </header>

      <main className="app-main">
        {!imagePreview && !loading && (
          <>
            <PhotoCapture onPhotoCapture={handlePhotoCapture} disabled={loading} />
            <div className="spotify-connect-section">
              {spotifyUser ? (
                <div className="spotify-connected">
                  <span>Connected as {spotifyUser.displayName}</span>
                  <button onClick={handleSpotifyLogout} className="disconnect-button">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={handleSpotifyLogin} className="spotify-connect-button">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Connect Spotify
                </button>
              )}
            </div>
          </>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{loadingMessage}</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={handleReset}>Try Again</button>
          </div>
        )}

        {tracks.length > 0 && (
          <>
            <PlaylistDisplay
              analysis={analysis}
              tracks={tracks}
              imagePreview={imagePreview}
              spotifyUser={spotifyUser}
              onSpotifyLogin={handleSpotifyLogin}
            />
            <button className="reset-button" onClick={handleReset}>
              Create Another
            </button>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by Claude & Spotify</p>
      </footer>
    </div>
  );
}

export default App;
