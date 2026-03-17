const express = require("express");
const cors = require("cors");
const ytdlp = require("youtube-dl-exec");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// serve index.html and other static files from the root folder
app.use(express.static(__dirname));

// simple test route so Railway homepage doesn't show "Cannot GET /"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoint
app.post("/api/info", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true
    });

    const formats = info.formats
      .filter(f => f.ext === "mp4" || f.ext === "m4a")
      .map(f => ({
        quality: f.format_note || (f.height ? `${f.height}p` : "audio"),
        url: f.url,
        ext: f.ext
      }));

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Download failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
