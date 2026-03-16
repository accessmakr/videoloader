


const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, 'js', 'registry.js');
const registry = require(registryPath);
const base = 'https://intelreap.com';

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

registry.forEach(page => {
  const loc = page.slug ? `${base}/${page.slug}` : base;
  const prio = page.priority || 0.8;
  xml += `  <url>\n    <loc>${loc}</loc>\n    <priority>${prio}</priority>\n  </url>\n`;
});

xml += '</urlset>';

fs.writeFileSync('sitemap.xml', xml);
console.log(`✅ sitemap.xml generated – ${registry.length} pages`);
