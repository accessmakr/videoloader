


// schema.js
// Adds/enhances JSON-LD automatically per page type (skips index.html tool page because you already have perfect schema there)

function getCurrentSlug() {
    let path = window.location.pathname;
    if (path.endsWith('/')) path = path.slice(0, -1);
    if (path === '' || path === '/' || path === '/index.html') return '';
    return path.replace(/\.html$/, '');   // now keeps full path including /guides/
}

function addOrEnhanceSchema() {
    const registry = window.siteRegistry || [];
    const slug = getCurrentSlug();
    const page = registry.find(p => p.slug === slug) || { title: document.title, type: 'WebPage' };

    // Skip index.html (already has full WebApplication + FAQPage schema)
    if (page.type === 'tool') return;

    let schema = {
        "@context": "https://schema.org",
        "@type": page.type === 'legal' ? "WebPage" : page.type === 'info' ? "AboutPage" : "WebPage",
        "name": page.title,
        "url": `https://intelreap.com${slug || ''}`,   // FIXED — no extra slash
        "publisher": {
            "@type": "Organization",
            "name": "VideoLoader Team"
        }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

window.addEventListener('load', addOrEnhanceSchema);
