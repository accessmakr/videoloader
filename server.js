


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
   2026 BYPASS + PLATFORM-AWARE HEADERS
   ====================== */
const getBaseOptions = (isNoTTWatermark = false, inputUrl = '') => {
  const isTikTok = inputUrl.includes('tiktok.com');
  const isYouTube = inputUrl.includes('youtube') || inputUrl.includes('youtu.be');
  const isInstagram = inputUrl.includes('instagram');
  const isTwitter = inputUrl.includes('twitter') || inputUrl.includes('x.com');
  const isFacebook = inputUrl.includes('facebook');

  let extractorArgs = [
    "youtube:player_client=default,web,android,web_embedded",
    "youtube:player_skip=webpage,configs,web_embedded",
    "youtube:age_gate_bypass"
  ];
  if (isNoTTWatermark && isTikTok) {
    extractorArgs.push("tiktok:remove_watermark");
  }

  let addHeader = [
    "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    "accept-language:en-US,en;q=0.9"
  ];

  if (isYouTube) addHeader.push("referer:https://www.youtube.com/");
  else if (isTikTok) addHeader.push("referer:https://www.tiktok.com/");
  else if (isInstagram) addHeader.push("referer:https://www.instagram.com/");
  else if (isTwitter) addHeader.push("referer:https://twitter.com/");
  else if (isFacebook) addHeader.push("referer:https://www.facebook.com/");
  else addHeader.push("referer:https://www.youtube.com/");

  return {
    noWarnings: true,
    retries: 10,
    fragmentRetries: 10,
    noCheckCertificate: true,
    concurrentFragments: 16,
    extractorArgs,
    addHeader
  };
};

/*
======================
VIDEO INFO (MP4)
======================
*/
app.post("/api/info", async (req, res) => {
  try {
    const { url, isNoTTWatermark = false } = req.body;
    if (!url) return res.status(400).json({ error: "No URL provided" });

    const cacheKey = `${url}:${isNoTTWatermark ? '1' : '0'}`;
    if (cache.has(cacheKey)) return res.json(cache.get(cacheKey));

    const options = getBaseOptions(isNoTTWatermark, url);

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
      title: info.title || "Video",
      thumbnail: info.thumbnail ||
                 (info.thumbnails && info.thumbnails[0] && info.thumbnails[0].url) ||
                 (Array.isArray(info.entries) && info.entries[0] &&
                  (info.entries[0].thumbnail || (info.entries[0].thumbnails && info.entries[0].thumbnails[0]?.url))) ||
                 null,
      formats
    };

    cache.set(cacheKey, responseData);
    res.json(responseData);

  } catch (err) {
    console.error("INFO ERROR:", err.stderr || err.message);
    const msg = err.message?.includes("Sign in") || err.message?.includes("403")
      ? "YouTube/TikTok blocked request – try again in 30s"
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

    const options = getBaseOptions(false, url);

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
    console.error("MP3 ERROR:", err.stderr || err.message);
    res.status(500).json({ error: "MP3 conversion failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ VideoLoader server running on port ${PORT} (2026 bypass + platform headers active)`);
});
