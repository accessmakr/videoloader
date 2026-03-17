


const express = require("express");
const cors = require("cors");
const ytdlp = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/*
======================
VIDEO INFO (MP4)
======================
*/
app.post("/api/info", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      preferFreeFormats: true,

      // ⚡ SPEED
      concurrentFragments: 16,

      // 🔁 STABILITY
      retries: 3,
      fragmentRetries: 3,

      // 🌍 PLATFORM SUPPORT (YouTube + TikTok + IG)
      extractorArgs: [
        "youtube:player_client=android",
        "generic:impersonate"
      ],

      // 🔐 HEADERS (avoid blocking)
      addHeader: [
        "referer:youtube.com",
        "user-agent:Mozilla/5.0"
      ]
    });

    const formats = info.formats
      .filter(f => f.url && f.ext === "mp4" && f.height)
      .map(f => ({
        quality: `${f.height}p`,
        url: f.url,
        ext: f.ext
      }))
      .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      formats
    });

  } catch (err) {
    console.error("INFO ERROR:", err.stderr || err.message || err);

    res.status(500).json({
      error: err.stderr || err.message || "Failed to fetch video info"
    });
  }
});

/*
======================
MP3 DOWNLOAD
======================
*/
app.post("/api/mp3", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "No URL provided" });
    }

    const fileName = `audio-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, fileName);

    await ytdlp(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: filePath,

      // ⚡ SPEED
      concurrentFragments: 16,
      limitRate: "10M",

      // 🔁 STABILITY
      retries: 5,
      fragmentRetries: 5,

      // 🔐 HEADERS
      addHeader: [
        "user-agent:Mozilla/5.0"
      ]
    });

    res.download(filePath, fileName, () => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // 🧼 cleanup after download
      }
    });

  } catch (err) {
    console.error("MP3 ERROR:", err.stderr || err.message || err);

    res.status(500).json({
      error: "MP3 conversion failed"
    });
  }
});

/*
======================
START SERVER
======================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

