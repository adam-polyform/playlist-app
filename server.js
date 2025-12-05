import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Analyze image with Claude Vision API
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageData } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

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
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageData.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
                  data: imageData.replace(/^data:image\/\w+;base64,/, '')
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

Based on your analysis, provide exactly 10 song recommendations that would complement this image as a playlist.

Respond in this exact JSON format:
{
  "analysis": {
    "mood": "description of mood",
    "atmosphere": "description of atmosphere",
    "themes": ["theme1", "theme2", "theme3"]
  },
  "songs": [
    {"title": "Song Title", "artist": "Artist Name"},
    {"title": "Song Title", "artist": "Artist Name"}
  ]
}

Only respond with the JSON, no other text.`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Parse the response
    const content = data.content[0].text;
    const parsed = JSON.parse(content);

    res.json(parsed);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
