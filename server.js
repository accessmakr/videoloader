


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
   SHARED MODERN OPTIONS (2026 bypass)
   ====================== */
const getBaseOptions = (isNoTTWatermark = false) => ({
  noWarnings: true,
  retries: 10,
  fragmentRetries: 10,
  noCheckCertificate: true,
  concurrentFragments: 16,

  // 🔥 MODERN YOUTUBE BYPASS (fixes bot detection + 403 + Varnish)
  extractorArgs: [
    "youtube:player_client=android,ios,web,web_embedded",
    "youtube:player_skip=webpage,configs,web_embedded",
    "youtube:age_gate_bypass",                    // extra safety
    "generic:impersonate"                         // kept but now with better clients
  ],

  // 🔥 Updated headers (Chrome 134+)
  addHeader: [
    "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "accept-language:en-US,en;q=0.9",
    "referer:https://www.youtube.com/"
  ],

  // TikTok no-watermark support (uses the flag you already send)
  ...(isNoTTWatermark && { extractorArgs: [...(Array.isArray(this.extractorArgs) ? this.extractorArgs : []), "tiktok:remove_watermark"] })
});

/*
======================
VIDEO INFO (MP4) – FIXED
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
    const msg = err.message?.includes("Sign in") || err.message?.includes("403")
      ? "YouTube blocked request – try again in 30s (or use a different video)"
      : (err.stderr || err.message || "Failed to fetch video info");
    res.status(500).json({ error: msg });
  }
});

/*
======================
MP3 DOWNLOAD – FIXED
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
      audioQuality: 0,           // best quality
      output: filePath
    });

    res.download(filePath, fileName, (err) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error("MP3 ERROR:", err.stderr || err.message || err);
    const msg = err.message?.includes("Sign in") || err.message?.includes("403")
      ? "YouTube/TikTok blocked MP3 conversion – try again"
      : "MP3 conversion failed";
    res.status(500).json({ error: msg });
  }
});

/*
======================
START SERVER
======================
*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ VideoLoader server running on port ${PORT} (yt-dlp bypass updated)`);
});
