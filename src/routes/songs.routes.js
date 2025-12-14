const express = require("express");
const router = express.Router();

const {
    getAllSongs,
    streamSong,
    getThumbnail
} = require("../controllers/songController");

router.get("/", getAllSongs);            // List songs
router.get("/stream/:id", streamSong);   // Stream song (by DB ID)
router.get("/thumbnail/:id", getThumbnail); // Get Thumbnail

module.exports = router;
