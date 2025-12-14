const app = require("./app");
const fs = require("fs");
const path = require("path");
const { fork } = require("child_process");

const PORT = process.env.PORT || 3000;

// Ensure local directories exist (Critical for Render Ephemeral Disk)
const THUMBNAILS_DIR = path.resolve(__dirname, "../thumbnails");
if (!fs.existsSync(THUMBNAILS_DIR)) {
    console.log("Creating thumbnails directory...");
    fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

// Ensure DB directory exists
const DB_DIR = path.resolve(__dirname, "../src/db");
// (Should exist in src, but if we move DB root...)
// Our DB is at ../songs.db actually.
const PROJECT_ROOT = path.resolve(__dirname, "..");
// songs.db is created by sqlite3 automatically if dir exists.

app.listen(PORT, () => {
    console.log(`Music API running on http://localhost:${PORT}`);

    // Trigger Background Sync on Start
    // This rebuilds the DB if it was lost (Ephemeral Disk)
    console.log("🚀 Triggering Background Drive Sync...");
    const syncProcess = fork(path.resolve(__dirname, "../scripts/sync_drive.js"));

    syncProcess.on('exit', (code) => {
        console.log(`Background Sync exited with code ${code}`);
    });
});
