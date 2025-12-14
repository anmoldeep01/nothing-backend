const { drive } = require('../src/config/drive');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const LOCAL_SONGS_DIR = path.resolve(__dirname, '../songs');
const DRIVE_FOLDER_NAME = 'Music_Library';

async function getOrCreateFolder(folderName) {
    try {
        const res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (res.data.files.length > 0) {
            console.log(`📂 Found existing folder: ${folderName} (${res.data.files[0].id})`);
            return res.data.files[0].id;
        } else {
            console.log(`bw Create new folder: ${folderName}...`);
            const fileMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            };
            const file = await drive.files.create({
                resource: fileMetadata,
                fields: 'id',
            });
            console.log(`✅ Created folder: ${folderName} (${file.data.id})`);
            return file.data.id;
        }
    } catch (err) {
        console.error('❌ Error getting folder:', err.message);
        throw err;
    }
}

async function uploadFile(fileName, folderId) {
    const filePath = path.join(LOCAL_SONGS_DIR, fileName);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    try {
        // Check if file already exists in folder
        const checkRes = await drive.files.list({
            q: `name='${fileName.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed=false`,
            fields: 'files(id)',
        });

        if (checkRes.data.files.length > 0) {
            console.log(`⏭️  Skipping existing file: ${fileName}`);
            return; // Skip
        }

        console.log(`⬆️  Uploading: ${fileName}...`);
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath),
        };

        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });
        console.log(`✅ Uploaded: ${fileName} (${file.data.id})`);
    } catch (err) {
        console.log(`❌ Failed to upload ${fileName}:`, err.message);
    }
}

async function startUpload() {
    if (!fs.existsSync(LOCAL_SONGS_DIR)) {
        console.error(`❌ Local songs directory not found: ${LOCAL_SONGS_DIR}`);
        return;
    }

    try {
        const folderId = await getOrCreateFolder(DRIVE_FOLDER_NAME);
        const files = fs.readdirSync(LOCAL_SONGS_DIR);

        console.log(`Found ${files.length} files locally.`);

        // Upload sequentially to avoid hitting rate limits too hard
        for (const file of files) {
            if (['.mp3', '.flac', '.wav', '.m4a'].includes(path.extname(file).toLowerCase())) {
                await uploadFile(file, folderId);
            }
        }
        console.log('🎉 All uploads processed.');
    } catch (err) {
        console.error('Fatal Error:', err);
    }
}

startUpload();
