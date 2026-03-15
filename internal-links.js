


// internal-links.js
// Auto-injects "Related Tools & Guides" section on every page (zero manual editing)

function getCurrentSlug() {
    let path = window.location.pathname;
    if (path.endsWith('/')) path = path.slice(0, -1);
    if (path === '' || path === '/' || path === '/index.html') return '';
    return path.replace(/\.html$/, '').replace(/^\//, '');
}

function addRelatedSection() {
    const registry = window.siteRegistry || [];
    const currentSlug = getCurrentSlug();
    const related = registry.filter(p => p.slug !== currentSlug && p.type !== 'legal' && p.type !== 'utility');

    if (related.length === 0) return;

    const html = `
        <section class="max-w-4xl mx-auto px-6 py-16 border-t border-slate-200 dark:border-slate-800">
            <h2 class="text-3xl font-extrabold mb-8 text-center">Related Tools &amp; Guides</h2>
            <div class="grid md:grid-cols-3 gap-6">
                ${related.map(p => `
                    <a href="/${p.slug || ''}${p.slug ? '.html' : ''}" 
                       class="block p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all">
                        <h3 class="font-semibold">${p.title}</h3>
                    </a>
                `).join('')}
            </div>
        </section>
    `;

    const footer = document.querySelector('footer');
    if (footer) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        footer.parentNode.insertBefore(temp.firstElementChild, footer);
    }
}

window.addEventListener('load', addRelatedSection);

