const fs = require("fs");
const path = require("path");

const SONGS_DIR = path.join(__dirname, "../../songs");

exports.getAllSongs = (req, res) => {
    fs.readdir(SONGS_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Unable to read songs directory" });
        }

        const songs = files.map((file) => ({
            name: file,
            url: `/api/songs/${file}`,
            streamUrl: `/api/songs/stream/${file}`
        }));

        res.json(songs);
    });
};

exports.getSongFile = (req, res) => {
    const songName = req.params.songName;
    const songPath = path.join(SONGS_DIR, songName);

    if (!fs.existsSync(songPath)) {
        return res.status(404).json({ error: "Song not found" });
    }

    res.download(songPath);
};

exports.streamSong = (req, res) => {
    const songName = req.params.songName;
    const songPath = path.join(SONGS_DIR, songName);

    if (!fs.existsSync(songPath)) {
        return res.status(404).json({ error: "Song not found" });
    }

    const stat = fs.statSync(songPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(songPath, { start, end });

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": "audio/mpeg"
        });

        file.pipe(res);
    } else {
        res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": "audio/mpeg"
        });

        fs.createReadStream(songPath).pipe(res);
    }
};
