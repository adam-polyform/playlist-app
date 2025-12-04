# Photo Playlist

Upload a photo and get a personalized music playlist based on its mood, atmosphere, and content.

## How It Works

1. **Upload or take a photo** - Use the camera or upload an existing image
2. **AI analyzes your photo** - Claude Vision API detects mood, themes, and atmosphere
3. **Get a playlist** - Spotify finds matching songs based on the analysis
4. **Listen** - Preview tracks or open them in Spotify

## Setup

### 1. Get API Keys

**Claude API Key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

**Spotify Credentials:**
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **Create App**
4. Fill in the app details (any name/description)
5. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

### 3. Install & Run

```bash
npm install
```

Run both the server and frontend (in separate terminals):

```bash
# Terminal 1: Start the backend server
npm run server

# Terminal 2: Start the frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express.js
- **Image Analysis:** Claude Vision API (Anthropic)
- **Music Search:** Spotify Web API
