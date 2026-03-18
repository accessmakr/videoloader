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

// Folders to ignore completely
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".github",
  "data",
  "js",
  "assets",
  "images",
  "css"
]);

// ==============================
// UTILITIES
// ==============================

// Ensure directories exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Safe JSON read
function readJSONSafe(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const raw = fs.readFileSync(file, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.log("⚠️ Failed to read JSON:", err.message);
    return [];
  }
}

// Safe write
function writeFileSafe(file, content) {
  try {
    fs.writeFileSync(file, content);
  } catch (err) {
    console.error("❌ Failed writing file:", file, err.message);
  }
}

// Recursive HTML discovery
function getHtmlFiles(dir) {
  let results = [];

  try {
    const list = fs.readdirSync(dir);

    list.forEach(file => {
      const filePath = path.join(dir, file);

      let stat;
      try {
        stat = fs.statSync(filePath);
      } catch {
        return;
      }

      if (stat.isDirectory()) {
        if (!IGNORE_DIRS.has(file)) {
          results = results.concat(getHtmlFiles(filePath));
        }
      } else if (file.toLowerCase().endsWith(".html")) {
        results.push(filePath);
      }
    });
  } catch (err) {
    console.log("⚠️ Directory read failed:", dir, err.message);
  }

  return results;
}

// Normalize path → URL slug
function toSlug(filePath) {
  let relative = path.relative(".", filePath).replace(/\\/g, "/");

  if (relative === "index.html") return "";

  if (relative.endsWith("/index.html")) {
    return "/" + relative.replace("/index.html", "");
  }

  return "/" + relative.replace(".html", "");
}

// Generate readable title
function generateTitle(slug) {
  if (!slug) return "Home";

  return slug
    .split("/")
    .pop()
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Determine type automatically
function detectType(slug) {
  if (slug.includes("tool")) return "tool";
  if (slug.includes("guide") || slug.includes("blog")) return "guide";
  return "info";
}

// Priority logic
function getPriority(type, slug) {
  if (slug === "") return 1.0;
  if (type === "tool") return 0.8;
  if (type === "guide") return 0.7;
  return 0.5;
}

// Changefreq logic
function getChangeFreq(type) {
  if (type === "tool") return "daily";
  if (type === "guide") return "weekly";
  return "monthly";
}

// Safe HTTPS request (never crashes)
function safeRequest(options, data = null) {
  return new Promise(resolve => {
    try {
      const req = https.request(options, res => {
        res.on("data", () => {});
        res.on("end", resolve);
      });

      req.on("error", err => {
        console.log("⚠️ Network error:", err.message);
        resolve();
      });

      if (data) req.write(data);
      req.end();
    } catch (err) {
      console.log("⚠️ Request exception:", err.message);
      resolve();
    }
  });
}

// ==============================
// MAIN EXECUTION
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

    let existing = existingPages.find(p => p.slug === slug);

    const stats = fs.statSync(filePath);
    const lastmod = stats.mtime.toISOString().split("T")[0];

    const type = existing?.type || detectType(slug);

    return {
      slug,
      title: existing?.title || generateTitle(slug),
      type,
      priority: existing?.priority ?? getPriority(type, slug),
      lastmod
    };
  });

  // ==========================
  // WRITE pages.json
  // ==========================
  writeFileSafe(pagesFile, JSON.stringify(newPages, null, 2));
  console.log("✅ pages.json updated");

  // ==========================
  // WRITE registry.js
  // ==========================
  const registryContent = `// AUTO-GENERATED FILE - DO NOT EDIT
const siteRegistry = ${JSON.stringify(newPages, null, 2)};

if (typeof window !== "undefined") {
  window.siteRegistry = siteRegistry;
} else {
  module.exports = siteRegistry;
}
`;

  writeFileSafe(registryFile, registryContent);
  console.log("✅ registry.js updated");

  // ==========================
  // WRITE sitemap.xml
  // ==========================
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  newPages.forEach(page => {
    const url = baseUrl + page.slug;

    xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${getChangeFreq(page.type)}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  xml += "\n</urlset>";

  writeFileSafe(sitemapFile, xml);
  console.log("✅ sitemap.xml updated");

  // ==========================
  // SEARCH ENGINE PINGS (SAFE)
  // ==========================

  console.log("🌐 Pinging search engines (non-blocking)...");

  // Google
  await safeRequest({
    hostname: "www.google.com",
    path: `/ping?sitemap=${encodeURIComponent(baseUrl + "/sitemap.xml")}`,
    method: "GET"
  });

  console.log("✅ Google ping attempted");

  // IndexNow
  const payload = JSON.stringify({
    host: "intelreap.com",
    key: indexNowKey,
    urlList: newPages.map(p => baseUrl + p.slug)
  });

  await safeRequest({
    hostname: "api.indexnow.org",
    path: "/indexnow",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    }
  }, payload);

  console.log("✅ IndexNow ping attempted");

  console.log("\n🎉 SUCCESS: Generation completed without blocking CI.");
})();
