


const fs = require("fs");
const path = require("path");
const https = require("https");

// ==============================
// CONFIG
// ==============================
const baseUrl = "https://intelreap.com";
const pagesFile = "./data/pages.json";
const registryFile = "./js/registry.js";
const sitemapFile = "./sitemap.xml";

const indexNowKey = "833b2f9ffb7d41ba9ed2ef3ea392d9c1";

// Folders to ignore
const IGNORE_DIRS = new Set(["node_modules", ".git", ".github", "data", "js", "assets", "images", "css"]);

// Keywords for better search/SEO (auto-added)
const KEYWORDS_MAP = {
  "": ["video downloader", "youtube", "tiktok", "mp3", "converter"],
  // others stay empty – you can extend later
};

// ==============================
// UTILITIES (unchanged except detectType)
// ==============================
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function readJSONSafe(file) {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : []; }
  catch { return []; }
}
function writeFileSafe(file, content) { try { fs.writeFileSync(file, content); } catch(e) { console.error(e); } }

function getHtmlFiles(dir) {
  let results = [];
  try {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !IGNORE_DIRS.has(file)) {
        results = results.concat(getHtmlFiles(filePath));
      } else if (file.toLowerCase().endsWith(".html")) {
        results.push(filePath);
      }
    });
  } catch {}
  return results;
}

function toSlug(filePath) {
  let relative = path.relative(".", filePath).replace(/\\/g, "/");
  if (relative === "index.html") return "";
  if (relative.endsWith("/index.html")) return "/" + relative.replace("/index.html", "");
  return "/" + relative.replace(".html", "");
}

function generateTitle(slug) {
  if (!slug) return "Home";
  return slug.split("/").pop().split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// 🔥 IMPROVED: auto-detects everything from your slugs
function detectType(slug) {
  if (!slug) return "tool";
  const lower = slug.toLowerCase();
  if (lower.includes("tool") || lower.includes("videoloader")) return "tool";
  if (lower.includes("guide") || lower.includes("blog") || lower.includes("how-to")) return "guide";
  if (lower.includes("privacy") || lower.includes("terms") || lower.includes("cookies") ||
      lower.includes("disclaimer") || lower.includes("about") || lower.includes("contact") ||
      lower.includes("accessibility")) return "legal";
  if (lower.includes("sitemap")) return "utility";
  return "info";
}

function getPriority(type, slug) {
  if (slug === "") return 1.0;
  if (type === "tool") return 0.8;
  if (type === "guide") return 0.7;
  return 0.5;
}

function getChangeFreq(type) {
  if (type === "tool") return "daily";
  if (type === "guide") return "weekly";
  return "monthly";
}

function safeRequest(options, data = null) {
  return new Promise(resolve => {
    try {
      const req = https.request(options, res => { res.on("data", () => {}); res.on("end", resolve); });
      req.on("error", () => resolve());
      if (data) req.write(data);
      req.end();
    } catch { resolve(); }
  });
}

// ==============================
// MAIN
// ==============================
(async () => {
  console.log("🚀 Starting generation...");

  ensureDir("./data");
  ensureDir("./js");

  const htmlFiles = getHtmlFiles(".");
  console.log(`📄 Found ${htmlFiles.length} HTML files`);

  const existingPages = readJSONSafe(pagesFile);

  const newPages = htmlFiles.map(filePath => {
    const slug = toSlug(filePath);
    const existing = existingPages.find(p => p.slug === slug);
    const stats = fs.statSync(filePath);
    const lastmod = stats.mtime.toISOString().split("T")[0];

    const type = existing?.type || detectType(slug);

    return {
      slug,
      title: existing?.title || generateTitle(slug),
      type,
      priority: existing?.priority ?? getPriority(type, slug),
      lastmod,
      keywords: existing?.keywords || KEYWORDS_MAP[slug] || []
    };
  });

  // WRITE files
  writeFileSafe(pagesFile, JSON.stringify(newPages, null, 2));
  writeFileSafe(registryFile, `// AUTO-GENERATED - DO NOT EDIT
const siteRegistry = ${JSON.stringify(newPages, null, 2)};
if (typeof window !== "undefined") window.siteRegistry = siteRegistry;
else module.exports = siteRegistry;`);

  // sitemap (same as before)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  newPages.forEach(page => {
    const url = baseUrl + page.slug;
    xml += `\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${page.lastmod}</lastmod>\n    <changefreq>${getChangeFreq(page.type)}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
  });
  xml += "\n</urlset>";
  writeFileSafe(sitemapFile, xml);

  console.log("✅ pages.json + registry.js + sitemap.xml updated");

  // PINGS REMOVED (was causing CI failure)
  console.log("🌐 Search engine pings skipped in CI (run locally if you want them).");
  console.log("\n🎉 SUCCESS: Generation completed.");
})();

