# Music API Project Prompt

## Project Goal
Build a RESTful API using Node.js and Express that serves as a backend for a music player application. The core feature is to stream music files directly from Google Drive, managing metadata in a local SQLite database, and supporting playlists.

## Tech Stack
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: SQLite (`sqlite3`)
-   **External Services**: Google Drive API (`googleapis`)
-   **Libraries**: `music-metadata` (for extracting thumbnails from audio files), `cors`, `dotenv`.

## Database Schema
The application uses a local SQLite database (`songs.db`) with the following schema:

1.  **`songs` Table**:
    -   `id` (INTEGER, PK): Auto-incrementing ID.
    -   `title` (TEXT): Song title.
    -   `artist` (TEXT): Artist name.
    -   `drive_file_id` (TEXT, UNIQUE): The ID of the file in Google Drive.
    -   `mime_type` (TEXT): MIME type (e.g., `audio/mpeg`).
    -   `size` (INTEGER): File size in bytes.
    -   `created_at`: Timestamp.

2.  **`playlists` Table**:
    -   `id` (INTEGER, PK).
    -   `name` (TEXT).
    -   `created_at`.

3.  **`playlist_songs` Table**:
    -   `playlist_id` (FK -> playlists.id).
    -   `song_id` (FK -> songs.id).
    -   Composite PK (`playlist_id`, `song_id`).

## API Endpoints

### Songs (`/api/songs`)
-   **`GET /`**: Retrieve all songs from the database, ordered by title. Returns an array of song objects including `streamUrl` and `thumbnailUrl`.
-   **`GET /stream/:id`**: Stream the audio file from Google Drive.
    -   **Critical Requirement**: Must support **Range Requests** (HTTP 206) to allow seeking in the audio player. Pipe the Google Drive stream to the response.
-   **`GET /thumbnail/:id`**: Extract and serve the album art from the audio file.
    -   **Logic**: Fetch the first 500KB (or appropriate chunk) of the file from Drive, use `music-metadata` to parse the ID3 tags, and serve the binary image data.
    -   **Caching**: Cache the extracted image locally (e.g., in a `thumbnails/` directory) to avoid repeated Drive API calls.

### Playlists (`/api/playlists`)
-   **`POST /`**: Create a new playlist (Body: `{ "name": "My Playlist" }`).
-   **`GET /`**: List all playlists.
-   **`GET /:id`**: Get a specific playlist with its songs.
-   **`POST /:playlistId/songs/:songId`**: Add a song to a playlist.
-   **`DELETE /:playlistId/songs/:songId`**: Remove a song from a playlist.

## Project Structure
```text
src/
├── config/
│   └── drive.js        # Google Drive Auth client setup
├── controllers/
│   ├── songController.js     # Logic for listing, streaming, and thumbnails
│   └── playlistController.js # CRUD for playlists
├── db/
│   └── index.js        # SQLite connection and schema init
├── routes/
│   ├── songs.routes.js     # Routes definitions for songs
│   └── playlists.routes.js # Routes definitions for playlists
├── app.js              # Express app setup (middleware, routes)
└── server.js           # Server entry point, background sync trigger
```

## Additional Features
-   **Background Sync**: The server should trigger a background script (`scripts/sync_drive.js`) on startup to scan the specific Google Drive folder and update the SQLite database with new or removed songs.
-   **Error Handling**: specific handling for Drive API errors and 404s for missing files.
