


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

/* ======================
   UPDATED 2026 BYPASS OPTIONS
   ====================== */
const getBaseOptions = (isNoTTWatermark = false) => {
  let extractorArgs = [
    "youtube:player_client=web,android,ios",   // 2026 stable combo
    "youtube:player_skip=webpage,configs,web_embedded",
    "youtube:age_gate_bypass"
  ];

  if (isNoTTWatermark) {
    extractorArgs.push("tiktok:remove_watermark");
  }

  return {
    noWarnings: true,
    retries: 10,
    fragmentRetries: 10,
    noCheckCertificate: true,
    concurrentFragments: 16,
    extractorArgs,
    addHeader: [
      "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      "accept-language:en-US,en;q=0.9",
      "referer:https://www.youtube.com/"
    ]
  };
};

/*
======================
VIDEO INFO (MP4) – now works for YouTube
======================
*/
app.post("/api/info", async (req, res) => {
  try {
    const { url, isNoTTWatermark } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    if (cache.has(url)) return res.json(cache.get(url));

    const options = getBaseOptions(isNoTTWatermark);

    const info = await ytdlp(url, {
      ...options,
      dumpSingleJson: true,
      skipDownload: true
    });

    const formats = (info.formats || [])
      .filter(f => f.url && (f.ext === "mp4" || f.ext === "webm") && f.height)
      .map(f => ({
        quality: `${f.height}p`,
        url: f.url.replace("http://", "https://"),
        ext: f.ext
      }))
      .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

    const responseData = {
      title: info.title,
      thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || null,
      formats
    };

    cache.set(url, responseData);
    res.json(responseData);

  } catch (err) {
    console.error("INFO ERROR:", err.stderr || err.message || err);
    const msg = err.message?.includes("Sign in") || err.message?.includes("403")
      ? "YouTube blocked request – try again in 30s (or use a different video)"
      : (err.stderr || err.message || "Failed to fetch video info");
    res.status(500).json({ error: msg });
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
    if (!url) return res.status(400).json({ error: "No URL provided" });

    const fileName = `audio-${Date.now()}.mp3`;
    const filePath = path.join(__dirname, fileName);

    const options = getBaseOptions(false);

    await ytdlp(url, {
      ...options,
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: filePath
    });

    res.download(filePath, fileName, (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error("MP3 ERROR:", err.stderr || err.message || err);
    res.status(500).json({ error: "MP3 conversion failed" });
  }
});

/*
======================
START SERVER
======================
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ VideoLoader server running on port ${PORT} (yt-dlp 2026 bypass active)`);
});
