const express = require("express");
const cors = require("cors");
const ytdlp = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const cache = new Map();

/* ======================
   UPDATED 2026 BYPASS OPTIONS (fixes YouTube 403)
   ====================== */
const getBaseOptions = (isNoTTWatermark = false) => {
  let extractorArgs = [
    "youtube:player_client=default,android,web_embedded",
    "youtube:formats=missing_pot",
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

/* ======================
   PROXY HEADERS (fixes TikTok/Twitter/Instagram CDN 403s)
   ====================== */
const getProxyHeaders = (link) => {
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";
  const base = {
    "User-Agent": ua,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua": '"Not)A;Brand";v="99", "Chromium";v="134", "Google Chrome";v="134"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };

  if (link.includes("tiktok")) {
    return { ...base, "Referer": "https://www.tiktok.com/", "Origin": "https://www.tiktok.com" };
  }
  if (link.includes("twimg.com") || link.includes("twitter.com") || link.includes("x.com") || 
      link.includes("video.twimg.com") || link.includes("pbs.twimg.com")) {
    return { ...base, "Referer": "https://twitter.com/", "Origin": "https://twitter.com" };
  }
  if (link.includes("instagram")) {
    return { ...base, "Referer": "https://www.instagram.com/", "Origin": "https://www.instagram.com" };
  }
  return base;
};

/* ======================
   NEW: PROXY DOWNLOAD (fixes all client-side 403s)
   ====================== */
app.get("/api/download", async (req, res) => {
  try {
    const { url: videoUrl, filename } = req.query;
    if (!videoUrl) return res.status(400).json({ error: "No URL provided" });

    const response = await fetch(videoUrl, {
      headers: getProxyHeaders(videoUrl),
      redirect: "follow"
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    if (filename) {
      res.set("Content-Disposition", `attachment; filename="${filename}"`);
    }

    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy download error:", err);
    res.status(500).json({ error: "Failed to download via proxy" });
  }
});

/* ======================
   VIDEO INFO (MP4)
   ====================== */
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
    let msg = err.message?.includes("Sign in") || err.message?.includes("403")
      ? "YouTube blocked request – try again in 30s or a different video"
      : (err.stderr || err.message || "Failed to fetch video info");

    if (msg.includes("rate-limit") || msg.includes("login required")) {
      msg = "Instagram rate-limited or requires login. Try a public reel or different platform.";
    }
    res.status(500).json({ error: msg });
  }
});

/* ======================
   MP3 DOWNLOAD
   ====================== */
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

/* ======================
   START SERVER
   ====================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ VideoLoader server v2.1 running on port ${PORT} (2026 YouTube + proxy fixed)`);
});
