const { drive } = require('../src/config/drive');
const db = require('../src/db');

async function syncDrive() {
    console.log('🔄 Starting Sync with Google Drive...');
    let pageToken = null;
    let totalFiles = 0;

    try {
        do {
            const res = await drive.files.list({
                q: "(mimeType contains 'audio/' or fileExtension = 'mp3' or fileExtension = 'flac') and trashed = false",
                fields: 'nextPageToken, files(id, name, mimeType, size)',
                spaces: 'drive',
                pageToken: pageToken,
                pageSize: 100, // Process 100 at a time
            });

            const files = res.data.files;
            if (files.length) {
                const stmt = db.prepare('INSERT OR IGNORE INTO songs (title, drive_file_id, mime_type, size, artist) VALUES (?, ?, ?, ?, ?)');

                db.serialize(() => {
                    db.run("BEGIN TRANSACTION");
                    files.forEach((file) => {
                        // Simple parsing of Artist - Title.mp3 if possible, else use filename as title
                        let title = file.name;
                        let artist = 'Unknown';

                        // remove extension
                        const nameParts = file.name.replace(/\.[^/.]+$/, "").split(' - ');
                        if (nameParts.length > 1) {
                            artist = nameParts[0];
                            title = nameParts.slice(1).join(' - ');
                        }

                        stmt.run(title, file.id, file.mimeType, file.size, artist);
                        totalFiles++;
                    });
                    db.run("COMMIT");
                });
                console.log(`Synced ${files.length} files...`);
            }

            pageToken = res.data.nextPageToken;
        } while (pageToken);

        console.log(`✅ Sync Complete. Total songs indexed: ${totalFiles}`);
    } catch (err) {
        console.error('❌ Sync Failed:', err.message);
    }
}

// Ensure DB is connected before running
setTimeout(syncDrive, 1000);
