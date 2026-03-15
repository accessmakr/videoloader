


// search-system.js
// Global search (ready for sitemap.html and future header search)

function initGlobalSearch() {
    const searchInputs = document.querySelectorAll('[data-search]');
    if (searchInputs.length === 0) return;

    const registry = window.siteRegistry || [];

    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase().trim();
            const matches = registry.filter(page =>
                page.title.toLowerCase().includes(term) ||
                (page.keywords && page.keywords.some(k => k.toLowerCase().includes(term)))
            );

            // For sitemap.html we will update the results div (see sitemap.html below)
            const resultsContainer = document.getElementById('search-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = matches.length
                    ? matches.map(p => `
                        <a href="/${p.slug || ''}${p.slug ? '.html' : ''}" 
                           class="block p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            ${p.title}
                        </a>`).join('')
                    : '<p class="text-slate-500">No matches found.</p>';
            }
        });
    });
}

window.addEventListener('load', initGlobalSearch);

