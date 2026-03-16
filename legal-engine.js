

// legal-engine.js
// Automatically rebuilds the Legal footer links from registry

function updateLegalFooter() {
    const registry = window.siteRegistry || [];
    const legalPages = registry.filter(p => p.type === 'legal');

    const legalH4 = Array.from(document.querySelectorAll('footer h4')).find(h => h.textContent.trim() === 'Legal');
    if (!legalH4) return;

    const legalUl = legalH4.parentElement.querySelector('ul');
    if (!legalUl) return;

    legalUl.innerHTML = legalPages.map(p => `
        <li><a href="/${p.slug}" class="hover:text-blue-500 transition">${p.title}</a></li>
    `).join('');
}

window.addEventListener('load', updateLegalFooter);
