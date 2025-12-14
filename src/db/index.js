const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure DB directory exists
const dbDir = path.resolve(__dirname, '../../');
// songs.db is at root

const dbPath = path.resolve(__dirname, '../../songs.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initSchema();
    }
});

function initSchema() {
    const sql = `
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      artist TEXT,
      drive_file_id TEXT UNIQUE,
      mime_type TEXT,
      size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.run(sql, (err) => {
        if (err) console.error('Error creating songs table: ' + err.message);
    });

    const sqlPlaylists = `
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
    db.run(sqlPlaylists, (err) => {
        if (err) console.error('Error creating playlists table: ' + err.message);
    });

    const sqlPlaylistSongs = `
    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlist_id INTEGER,
      song_id INTEGER,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (playlist_id, song_id),
      FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE
    )
  `;
    db.run(sqlPlaylistSongs, (err) => {
        if (err) console.error('Error creating playlist_songs table: ' + err.message);
    });
}

module.exports = db;
