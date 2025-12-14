const express = require("express");
const cors = require("cors");

const songRoutes = require("./routes/songs.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/songs", songRoutes);

module.exports = app;
