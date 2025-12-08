import { useState } from 'react';
import PhotoCapture from './components/PhotoCapture';
import PlaylistDisplay from './components/PlaylistDisplay';
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
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="#61626D" strokeWidth="2"/>
            <circle cx="20" cy="20" r="6" fill="#61626D"/>
            <path d="M20 8V14" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
            <path d="M20 26V32" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 20H14" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
            <path d="M26 20H32" stroke="#61626D" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1>Moodlist</h1>
        <p>Transform any image into a playlist</p>
      </header>

      <main className="app-main">
        {!imagePreview && !loading && (
          <PhotoCapture onPhotoCapture={handlePhotoCapture} disabled={loading} />
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
