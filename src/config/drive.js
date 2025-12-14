const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

async function checkConnection() {
    try {
        const res = await drive.files.list({ pageSize: 1, fields: 'files(id, name)' });
        console.log('Google Drive Connection SUCCESS.');
        if (res.data.files && res.data.files.length > 0) {
            console.log('File found: ' + res.data.files[0].name);
        } else {
            console.log('Connection successful but no files found.');
        }
        return true;
    } catch (error) {
        console.error('Google Drive Connection FAILED: ' + error.message);
        return false;
    }
}

module.exports = { drive, checkConnection };
