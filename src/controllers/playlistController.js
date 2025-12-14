const db = require('../db');

// Create Playlist
exports.createPlaylist = (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Playlist name required' });

    db.run("INSERT INTO playlists (name) VALUES (?)", [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name });
    });
};

// List Playlists
exports.getAllPlaylists = (req, res) => {
    db.all("SELECT * FROM playlists ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Add Song to Playlist
exports.addSongToPlaylist = (req, res) => {
    const { playlistId, songId } = req.params;

    db.run("INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)", [playlistId, songId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Song added to playlist' });
    });
};

// Get Playlist with Songs
exports.getPlaylist = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT p.id as playlist_id, p.name as playlist_name, s.*
        FROM playlists p
        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
        LEFT JOIN songs s ON ps.song_id = s.id
        WHERE p.id = ?
    `;

    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'Playlist not found' });

        const playlist = {
            id: rows[0].playlist_id,
            name: rows[0].playlist_name,
            songs: rows.filter(r => r.id).map(r => ({
                id: r.id,
                title: r.title,
                artist: r.artist,
                size: r.size,
                streamUrl: `/api/songs/stream/${r.id}`,
                thumbnailUrl: `/api/songs/thumbnail/${r.id}`
            }))
        };
        res.json(playlist);
    });
};

// Remove Song from Playlist
exports.removeSongFromPlaylist = (req, res) => {
    const { playlistId, songId } = req.params;

    db.run("DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?", [playlistId, songId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Song removed from playlist' });
    });
};
