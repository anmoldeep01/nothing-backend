const express = require("express");
const router = express.Router();

const {
    createPlaylist,
    getAllPlaylists,
    getPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
} = require("../controllers/playlistController");

// Playlist CRUD
router.post("/", createPlaylist);
router.get("/", getAllPlaylists);
router.get("/:id", getPlaylist);

// Manage Songs in Playlist
router.post("/:playlistId/songs/:songId", addSongToPlaylist);
router.delete("/:playlistId/songs/:songId", removeSongFromPlaylist);

module.exports = router;
