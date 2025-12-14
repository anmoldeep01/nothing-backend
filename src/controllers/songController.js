const db = require('../db');
const { drive } = require('../config/drive');
const mm = require('music-metadata');
const fs = require('fs');
const path = require('path');

// List all songs from SQLite
exports.getAllSongs = (req, res) => {
    db.all("SELECT * FROM songs ORDER BY title ASC", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Add stream URL to each song
        const songs = rows.map(song => ({
            ...song,
            streamUrl: `/api/songs/stream/${song.id}`,
            thumbnailUrl: `/api/songs/thumbnail/${song.id}`
        }));
        res.json(songs);
    });
};

// Get Song Thumbnail
exports.getThumbnail = (req, res) => {
    const songId = req.params.id;
    const thumbnailPath = path.resolve(__dirname, `../../thumbnails/${songId}.jpg`);

    // 1. Serve cached thumbnail if exists
    if (fs.existsSync(thumbnailPath)) {
        return res.sendFile(thumbnailPath);
    }

    // 2. Extract from Drive
    db.get("SELECT * FROM songs WHERE id = ?", [songId], async (err, song) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!song) return res.status(404).json({ error: 'Song not found' });

        try {
            // Stream first 500KB to read metadata
            // Note: Some FLACs/MP3s might have headers larger than 500KB if the image is huge.
            // 500KB is a safe tradeoff for speed.
            const response = await drive.files.get(
                { fileId: song.drive_file_id, alt: 'media' },
                { responseType: 'stream', headers: { Range: 'bytes=0-500000' } }
            );

            // Parse the stream
            const metadata = await mm.parseStream(response.data, { mimeType: song.mime_type, size: song.size });
            const picture = metadata.common.picture ? metadata.common.picture[0] : null;

            if (picture) {
                fs.writeFileSync(thumbnailPath, picture.data);
                return res.sendFile(thumbnailPath);
            } else {
                // Return 404 if no image found (Client should show placeholder)
                return res.status(404).json({ error: 'No artwork found' });
            }

        } catch (e) {
            console.error('Thumbnail Extract Error:', e.message);
            // It could fail if file is too small or other drive errors
            // Return 404 so client doesn't break
            res.status(404).json({ error: 'Failed to extract thumbnail' });
        }
    });
};

// Stream a song from Google Drive
exports.streamSong = (req, res) => {
    const songId = req.params.id;

    db.get("SELECT * FROM songs WHERE id = ?", [songId], async (err, song) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }

        try {
            const driveFileId = song.drive_file_id;

            // Get file metadata for size (optional, since we have it in DB)
            const range = req.headers.range;
            const fileSize = song.size;

            if (range) {
                // Handle Range Requests (Seeking)
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;

                const head = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': song.mime_type || 'audio/mpeg',
                };

                res.writeHead(206, head);

                const response = await drive.files.get(
                    { fileId: driveFileId, alt: 'media' },
                    { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
                );

                response.data.pipe(res);
            } else {
                // Full File
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': song.mime_type || 'audio/mpeg',
                };
                res.writeHead(200, head);

                const response = await drive.files.get(
                    { fileId: driveFileId, alt: 'media' },
                    { responseType: 'stream' }
                );
                response.data.pipe(res);
            }
        } catch (driveError) {
            console.error('Drive Stream Error:', driveError.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to stream from Drive' });
            }
        }
    });
};
