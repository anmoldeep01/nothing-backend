# Music API

A simple REST API to serve offline songs, hosted on Render.

**Live URL:** [https://music-api-3-dvho.onrender.com/](https://music-api-3-dvho.onrender.com/)

## API Usage

### 1. List All Songs
Retrieves a list of all available songs with metadata.

*   **Endpoint:** `GET /api/songs`
*   **Response:** JSON Array of song objects.

**Example Request:**
```bash
curl https://music-api-3-dvho.onrender.com/api/songs
```

**Example Response:**
```json
[
  {
    "name": "Song Name.mp3",
    "url": "/api/songs/Song%20Name.mp3",
    "streamUrl": "/api/songs/stream/Song%20Name.mp3"
  },
  ...
]
```

### 2. Stream a Song
Streams the audio file. Supports range requests (seeking) for media players.

*   **Endpoint:** `GET /api/songs/stream/:filename`
*   **Parameter:** `filename` - The exact name of the file from the list (URL encoded).

**Example Usage (HTML Audio):**
```html
<audio controls>
  <source src="https://music-api-3-dvho.onrender.com/api/songs/stream/Song%20Name.mp3" type="audio/mpeg">
</audio>
```

### 3. Download a Song
Downloads the full audio file.

*   **Endpoint:** `GET /api/songs/:filename`
*   **Parameter:** `filename` - The exact name of the file.

**Example Request:**
```bash
curl -O https://music-api-3-dvho.onrender.com/api/songs/Song%20Name.mp3
```

## Local Development

1.  **Install Dependencies:**
    ```bash
    yarn install
    ```

2.  **Start Server:**
    ```bash
    yarn start
    ```
    Runs on `http://localhost:3000`.

## Deployment

This project is configured for **Render** using `render.yaml`.
*   **Build Command:** `yarn`
*   **Start Command:** `yarn start`
