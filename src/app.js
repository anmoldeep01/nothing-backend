const express = require("express");
const cors = require("cors");

const songRoutes = require("./routes/songs.routes");
const playlistRoutes = require("./routes/playlists.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

module.exports = app;
