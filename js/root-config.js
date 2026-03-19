


const SITE_CONFIG = {
  name: "IntelReap • VideoLoader",
  domain: "https://intelreap.com",
  description: "Fastest Free Video Downloader",
  author: "IntelReap Team"
};

const SOCIAL_LINKS = [
  { name: "Facebook", url: "https://www.facebook.com", icon: "📘" },
  { name: "Twitter",  url: "https://twitter.com", icon: "🐦" },
  { name: "GitHub",   url: "https://github.com", icon: "🐙" },
  { name: "Instagram", url: "https://instagram.com", icon: "📷" }
];

if (typeof window !== "undefined") {
  window.SITE_CONFIG = SITE_CONFIG;
  window.SOCIAL_LINKS = SOCIAL_LINKS;
  
  const isDark = localStorage.getItem("darkMode") === "true";
  document.documentElement.classList.toggle("dark", isDark);
}
