


const express = require("express");
const cors = require("cors");
const ytdlp = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const cache = new Map();

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

    // ✅ CACHE
    if (cache.has(url)) {
      return res.json(cache.get(url));
    }

    const info = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,

      // 🔥 CRITICAL BYPASS SETTINGS
      extractorArgs: [
        "youtube:player_client=android",
        "youtube:player_skip=webpage,configs",
        "generic:impersonate"
      ],

      // 🔥 HEADERS (look like real browser)
      addHeader: [
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "accept-language:en-US,en;q=0.9",
        "referer:https://www.youtube.com/"
      ],

      // ⚡ SPEED
      concurrentFragments: 16,

      // 🔁 STABILITY
      retries: 5,
      fragmentRetries: 5
    });

    const formats = (info.formats || [])
      .filter(f => f.url && f.ext === "mp4" && f.height)
      .map(f => ({
        quality: `${f.height}p`,
        url: f.url.replace("http://", "https://"),
        ext: f.ext
      }))
      .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

    const responseData = {
      title: info.title,
      thumbnail: info.thumbnail || (info.thumbnails?.[0]?.url || null),
      formats
    };

    cache.set(url, responseData);

    res.json(responseData);

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

      // 🔥 SAME BYPASS SETTINGS
      extractorArgs: [
        "youtube:player_client=android",
        "youtube:player_skip=webpage,configs",
        "generic:impersonate"
      ],

      addHeader: [
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "accept-language:en-US,en;q=0.9",
        "referer:https://www.youtube.com/"
      ],

      concurrentFragments: 16,
      retries: 5,
      fragmentRetries: 5
    });

    res.download(filePath, fileName, () => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
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
