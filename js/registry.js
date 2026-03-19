


const siteRegistry = [
  { slug: "", title: "VideoLoader | Fastest Free Video Downloader & MP3 Converter", type: "tool", priority: 1.0, keywords: ["video downloader", "youtube", "tiktok", "mp3"] },
  { slug: "privacy-policy", title: "Privacy Policy", type: "legal", priority: 0.5 },
  { slug: "terms-of-use", title: "Terms of Use", type: "legal", priority: 0.5 },
  { slug: "cookies-policy", title: "Cookies Policy", type: "legal", priority: 0.5 },
  { slug: "disclaimer", title: "Disclaimer", type: "legal", priority: 0.5 },
  { slug: "about-us", title: "About Us", type: "legal", priority: 0.6 },        // changed to legal as you asked
  { slug: "contact-us", title: "Contact Us", type: "legal", priority: 0.6 },
  { slug: "accessibility", title: "Accessibility Statement", type: "legal", priority: 0.5 },
  { slug: "how-to-delete-downloads-on-mac", title: "How to Delete Downloads on Mac", type: "guide", priority: 0.7 },
  { slug: "how-to-find-downloads-on-iPhone", title: "How to Find Downloads on iPhone", type: "guide", priority: 0.7 },
  { slug: "sitemap", title: "Sitemap", type: "utility", priority: 0.4 }
];

if (typeof window !== "undefined") window.siteRegistry = siteRegistry;
else module.exports = siteRegistry;
