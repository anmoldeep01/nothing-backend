const express = require("express");
const router = express.Router();

const {
    getAllSongs,
    getSongFile,
    streamSong
} = require("../controllers/songs.controller");

router.get("/", getAllSongs);            // List songs
router.get("/:songName", getSongFile);   // Download song
router.get("/stream/:songName", streamSong); // Stream song

module.exports = router;
