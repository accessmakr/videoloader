


// js/menu-system.js
// Auto-builds top navigation from registry (injected on every page load)

document.addEventListener('DOMContentLoaded', () => {
  const registry = window.siteRegistry || [];
  
  // Group pages
  const toolPages = registry.filter(p => p.type === 'tool');
  const infoPages = registry.filter(p => p.type === 'info');
  const legalPages = registry.filter(p => p.type === 'legal');
  const sitemapPage = registry.find(p => p.slug === 'sitemap');

  const navHTML = `
    <nav class="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          Video<span class="text-blue-600">Loader</span>
        </a>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center gap-8 text-sm font-medium">
          <!-- Tool -->
          ${toolPages.map(p => `
            <a href="/${p.slug}" 
               class="hover:text-blue-600 transition-colors ${p.slug === '' ? 'text-blue-600 font-semibold' : ''}">
              Tool
            </a>
          `).join('')}
          
          <!-- Info pages -->
          ${infoPages.map(p => `
            <a href="/${p.slug}" class="hover:text-blue-600 transition-colors">${p.title}</a>
          `).join('')}
          
          <!-- Sitemap -->
          ${sitemapPage ? `<a href="/sitemap" class="hover:text-blue-600 transition-colors">Sitemap</a>` : ''}
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Legal quick link -->
          <a href="/privacy-policy" 
             class="text-xs px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors">
            Legal
          </a>
          
          <!-- Mobile menu button (simple for now) -->
          <button id="mobile-menu-btn"
                  class="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
            ☰
          </button>
        </div>
      </div>

      <!-- Mobile Menu (hidden by default) -->
      <div id="mobile-menu" class="hidden md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div class="px-6 py-6 flex flex-col gap-4 text-sm">
          ${toolPages.map(p => `
            <a href="/${p.slug}" class="py-2 hover:text-blue-600">${p.title}</a>
          `).join('')}
          ${infoPages.map(p => `
            <a href="/${p.slug}" class="py-2 hover:text-blue-600">${p.title}</a>
          `).join('')}
          ${legalPages.map(p => `
            <a href="/${p.slug}" class="py-2 hover:text-blue-600">${p.title}</a>
          `).join('')}
          ${sitemapPage ? `<a href="/sitemap" class="py-2 hover:text-blue-600">Sitemap</a>` : ''}
        </div>
      </div>
    </nav>
  `;

  // Inject at the very top of <body>
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = navHTML.trim();
  const navElement = tempDiv.firstElementChild;
  
  const body = document.body;
  if (body.firstChild) {
    body.insertBefore(navElement, body.firstChild);
  } else {
    body.appendChild(navElement);
  }

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
});
