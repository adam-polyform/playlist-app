import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Store user tokens in memory (in production, use a database/session store)
const userTokens = new Map();
// Store OAuth state tokens for CSRF protection
const oauthStates = new Map();

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the dist folder
app.use(express.static(join(__dirname, 'dist')));

// Extract media type from base64 data URL
function getMediaType(dataUrl) {
  const match = dataUrl.match(/^data:(image\/\w+);base64,/);
  if (match) {
    const type = match[1];
    // Map common types (Claude API supports jpeg, png, gif, webp)
    if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(type)) {
      return type;
    }
    // For unsupported formats like avif, default to jpeg
    return 'image/jpeg';
  }
  return 'image/jpeg';
}

// Helper function to extract JSON from response (handles markdown code blocks)
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Try to find JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }
    throw new Error('Could not extract JSON from response');
  }
}

// Helper function to call Claude API with retry
async function callClaudeWithRetry(body, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.error) {
        // If overloaded, retry
        if (data.error.type === 'overloaded_error' && attempt < maxRetries) {
          console.log(`Claude API overloaded, retrying (attempt ${attempt}/${maxRetries})...`);
          await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
          continue;
        }
        throw new Error(data.error.message);
      }

      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response structure from Claude API');
      }

      return data;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

// Analyze image with Claude Vision API
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const mediaType = getMediaType(imageData);
    const base64Data = imageData.replace(/^data:image\/[\w+]+;base64,/, '');

    // Validate base64 data
    if (!base64Data || base64Data.length === 0) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }

    console.log(`Processing image: ${mediaType}, size: ${Math.round(base64Data.length / 1024)}KB`);

    const data = await callClaudeWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            },
            {
              type: 'text',
              text: `Analyze this image and suggest music that would match its mood, atmosphere, and content.

Consider:
- The overall mood (happy, melancholic, energetic, peaceful, romantic, mysterious, etc.)
- Colors and lighting (warm, cool, bright, dark)
- Setting/location (beach, city, nature, indoor, etc.)
- Time of day if apparent
- Any activities or emotions depicted
- Cultural or thematic elements

Based on your analysis, provide exactly 10 song recommendations that would complement this image as a playlist. Also create a creative, short playlist title (2-5 words) that captures the essence of the image and mood.

IMPORTANT: Respond with ONLY valid JSON, no markdown, no code blocks, no additional text.

{
  "playlistTitle": "Creative Playlist Title",
  "analysis": {
    "mood": "description of mood",
    "atmosphere": "description of atmosphere",
    "themes": ["theme1", "theme2", "theme3"]
  },
  "songs": [
    {"title": "Song Title", "artist": "Artist Name"},
    {"title": "Song Title", "artist": "Artist Name"}
  ]
}`
            }
          ]
        }
      ]
    });

    // Parse the response with robust JSON extraction
    const content = data.content[0].text;
    console.log('Claude response received, parsing JSON...');

    const parsed = extractJSON(content);

    // Validate the response structure
    if (!parsed.analysis || !parsed.songs || !Array.isArray(parsed.songs)) {
      console.error('Invalid response structure:', JSON.stringify(parsed).substring(0, 200));
      return res.status(500).json({ error: 'Invalid response format from AI' });
    }

    // Ensure we have a playlist title
    if (!parsed.playlistTitle) {
      parsed.playlistTitle = 'My RelicRadio Playlist';
    }

    console.log(`Successfully analyzed image: "${parsed.playlistTitle}" with ${parsed.songs.length} songs`);
    res.json(parsed);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

// Get Spotify access token (Client Credentials flow)
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

// Search for tracks on Spotify
app.post('/api/search-tracks', async (req, res) => {
  try {
    const { songs } = req.body;

    const token = await getSpotifyToken();

    const tracks = await Promise.all(
      songs.map(async (song) => {
        const query = encodeURIComponent(`track:${song.title} artist:${song.artist}`);
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (data.tracks?.items?.length > 0) {
          const track = data.tracks.items[0];
          return {
            id: track.id,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            uri: track.uri
          };
        }

        // If exact match not found, try a more general search
        const fallbackQuery = encodeURIComponent(`${song.title} ${song.artist}`);
        const fallbackResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${fallbackQuery}&type=track&limit=1`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.tracks?.items?.length > 0) {
          const track = fallbackData.tracks.items[0];
          return {
            id: track.id,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            uri: track.uri
          };
        }

        return null;
      })
    );

    // Filter out null results
    const validTracks = tracks.filter(t => t !== null);

    res.json({ tracks: validTracks });
  } catch (error) {
    console.error('Error searching tracks:', error);
    res.status(500).json({ error: 'Failed to search tracks: ' + error.message });
  }
});

// Spotify OAuth - Start authorization
app.get('/auth/spotify', (req, res) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  // Use x-forwarded-proto header for apps behind a proxy (like Render)
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const redirectUri = `${protocol}://${req.get('host')}/auth/spotify/callback`;
  const state = crypto.randomBytes(16).toString('hex');
  const scope = 'playlist-modify-public playlist-modify-private user-read-private';

  // Store state for CSRF validation (expires in 10 minutes)
  oauthStates.set(state, { createdAt: Date.now(), redirectUri });
  setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000);

  console.log('Redirect URI:', redirectUri); // Debug log

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// Spotify OAuth - Handle callback
app.get('/auth/spotify/callback', async (req, res) => {
  const { code, error, state } = req.query;

  if (error) {
    return res.redirect('/?auth_error=' + encodeURIComponent(error));
  }

  // Validate state parameter for CSRF protection
  const storedState = oauthStates.get(state);
  if (!state || !storedState) {
    console.error('Invalid OAuth state - possible CSRF attack');
    return res.redirect('/?auth_error=invalid_state');
  }
  oauthStates.delete(state); // Use state only once

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    // Use the stored redirect URI to ensure consistency
    const redirectUri = storedState.redirectUri;

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.redirect('/?auth_error=' + encodeURIComponent(data.error_description || data.error));
    }

    // Get user profile
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${data.access_token}` }
    });
    const profile = await profileResponse.json();

    // Generate a session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Store user data
    userTokens.set(sessionToken, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      userId: profile.id,
      displayName: profile.display_name
    });

    // Set session token as HTTP-only secure cookie (not accessible via JavaScript)
    const isProduction = process.env.NODE_ENV === 'production' || req.get('x-forwarded-proto') === 'https';
    res.cookie('spotify_session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    // Redirect back to app (no token in URL)
    res.redirect('/?spotify_connected=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?auth_error=callback_failed');
  }
});

// Helper to get session token from cookie or header (for backwards compatibility)
function getSessionToken(req) {
  return req.cookies?.spotify_session || req.headers['x-spotify-session'];
}

// Check user authentication status
app.get('/api/user-status', (req, res) => {
  const sessionToken = getSessionToken(req);

  if (!sessionToken || !userTokens.has(sessionToken)) {
    return res.json({ authenticated: false });
  }

  const userData = userTokens.get(sessionToken);
  res.json({
    authenticated: true,
    displayName: userData.displayName,
    userId: userData.userId
  });
});

// Refresh token if needed
async function refreshTokenIfNeeded(sessionToken) {
  const userData = userTokens.get(sessionToken);
  if (!userData) return null;

  // Refresh if token expires within 5 minutes
  if (userData.expiresAt - Date.now() < 5 * 60 * 1000) {
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: userData.refreshToken
        })
      });

      const data = await response.json();

      if (!data.error) {
        userData.accessToken = data.access_token;
        userData.expiresAt = Date.now() + (data.expires_in * 1000);
        if (data.refresh_token) {
          userData.refreshToken = data.refresh_token;
        }
        userTokens.set(sessionToken, userData);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }

  return userData;
}

// Create playlist and add tracks
app.post('/api/create-playlist', async (req, res) => {
  const sessionToken = getSessionToken(req);
  const { name, description, trackUris } = req.body;

  if (!sessionToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userData = await refreshTokenIfNeeded(sessionToken);
  if (!userData) {
    return res.status(401).json({ error: 'Session expired' });
  }

  try {
    // Create playlist
    const createResponse = await fetch(
      `https://api.spotify.com/v1/users/${userData.userId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name || 'RelicRadio Playlist',
          description: description || 'Created with RelicRadio',
          public: false
        })
      }
    );

    const playlist = await createResponse.json();

    if (playlist.error) {
      return res.status(400).json({ error: playlist.error.message });
    }

    // Add tracks to playlist
    if (trackUris && trackUris.length > 0) {
      await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: trackUris })
        }
      );
    }

    res.json({
      success: true,
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls.spotify
    });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Generate more songs based on existing analysis
app.post('/api/generate-more-songs', async (req, res) => {
  try {
    const { analysis, existingTracks } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const existingSongs = existingTracks.map(t => `${t.name} by ${t.artist}`).join(', ');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Based on this mood analysis, suggest 10 MORE songs that would fit the playlist.

Mood: ${analysis.mood}
Atmosphere: ${analysis.atmosphere}
Themes: ${analysis.themes?.join(', ')}

IMPORTANT: Do NOT suggest any of these songs that are already in the playlist:
${existingSongs}

Provide 10 NEW and DIFFERENT songs that match the same mood and atmosphere.

Respond in this exact JSON format:
{
  "songs": [
    {"title": "Song Title", "artist": "Artist Name"},
    {"title": "Song Title", "artist": "Artist Name"}
  ]
}

Only respond with the JSON, no other text.`
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    const content = data.content[0].text;
    const parsed = JSON.parse(content);

    // Search for the new tracks on Spotify
    const token = await getSpotifyToken();
    const existingIds = new Set(existingTracks.map(t => t.id));

    const tracks = await Promise.all(
      parsed.songs.map(async (song) => {
        const query = encodeURIComponent(`track:${song.title} artist:${song.artist}`);
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const searchData = await searchResponse.json();

        if (searchData.tracks?.items?.length > 0) {
          const track = searchData.tracks.items[0];
          // Skip if already in playlist
          if (existingIds.has(track.id)) return null;
          return {
            id: track.id,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            uri: track.uri
          };
        }

        // Fallback search
        const fallbackQuery = encodeURIComponent(`${song.title} ${song.artist}`);
        const fallbackResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${fallbackQuery}&type=track&limit=1`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        const fallbackData = await fallbackResponse.json();

        if (fallbackData.tracks?.items?.length > 0) {
          const track = fallbackData.tracks.items[0];
          if (existingIds.has(track.id)) return null;
          return {
            id: track.id,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            album: track.album.name,
            albumArt: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            spotifyUrl: track.external_urls.spotify,
            uri: track.uri
          };
        }

        return null;
      })
    );

    const validTracks = tracks.filter(t => t !== null);

    res.json({ tracks: validTracks });
  } catch (error) {
    console.error('Error generating more songs:', error);
    res.status(500).json({ error: 'Failed to generate more songs' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  const sessionToken = getSessionToken(req);
  if (sessionToken) {
    userTokens.delete(sessionToken);
  }
  // Clear the session cookie
  res.clearCookie('spotify_session', { path: '/' });
  res.json({ success: true });
});

// Serve index.html for all other routes (SPA support)
app.get('/{*path}', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
