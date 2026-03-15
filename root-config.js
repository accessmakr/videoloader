


// js/root-config.js
// Site-wide config + early dark-mode sync (runs before everything else)

const SITE_CONFIG = {
  name: "VideoLoader",
  domain: "https://intelreap.com",
  description: "Fastest Free Video Downloader & MP3 Converter - 4K, YouTube, TikTok",
  author: "VideoLoader Team",
  version: "1.0"
};

if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;

  // Sync dark mode from localStorage (works on every page)
  const isDark = localStorage.getItem("darkMode") === "true";
  document.documentElement.classList.toggle("dark", isDark);
}