


// js/registry.js
// SINGLE SOURCE OF TRUTH — edit this file ONLY when you add a new page

const siteRegistry = [
  {
    slug: "",                     // index.html
    title: "VideoLoader | Fastest Free Video Downloader & MP3 Converter",
    type: "tool",
    priority: 1.0,
    keywords: ["video downloader", "youtube downloader", "tiktok downloader", "mp3 converter", "4k download"]
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    type: "legal",
    priority: 0.5
  },
  {
    slug: "terms-of-use",
    title: "Terms of Use",
    type: "legal",
    priority: 0.5
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    type: "legal",
    priority: 0.5
  },
  {
    slug: "cookies-policy",
    title: "Cookies Policy",
    type: "legal",
    priority: 0.5
  },
  {
    slug: "about-us",
    title: "About Us",
    type: "info",
    priority: 0.6
  },
  {
    slug: "contact-us",
    title: "Contact Us",
    type: "info",
    priority: 0.6
  },
  {
    slug: "accessibility",
    title: "Accessibility Statement",
    type: "info",
    priority: 0.5
  },
  {
    slug: "how-to-delete-downloads-on-mac",
    title: "How to Delete Downloads on Mac – Complete Guide",
    type: "guide",
    priority: 0.7,
    keywords: ["delete downloads mac", "mac cleanup", "mac storage", "clear downloads folder"]
  },
  {
    slug: "sitemap",
    title: "Sitemap",
    type: "utility",
    priority: 0.4
  }
];
// Make it available both in browser and in Node (for generate-sitemap.js)
if (typeof window !== "undefined") {
  window.siteRegistry = siteRegistry;
} else {
  module.exports = siteRegistry;
}

