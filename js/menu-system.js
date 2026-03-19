


document.addEventListener('DOMContentLoaded', () => {
  const registry = window.siteRegistry || [];
  const toolPages = registry.filter(p => p.type === 'tool');
  const infoPages = registry.filter(p => p.type === 'legal' || p.type === 'info');

  const navHTML = `
    ${toolPages.map(p => `<a href="${p.slug || '/'}" class="hover:text-blue-600 transition-colors">${p.title}</a>`).join('')}
    ${infoPages.map(p => `<a href="${p.slug || '/'}" class="hover:text-blue-600 transition-colors">${p.title}</a>`).join('')}
  `;

  const mainMenu = document.getElementById('main-menu');
  if (mainMenu) mainMenu.innerHTML = navHTML;

  // Mobile menu
  const btn = document.getElementById('mobile-menu-btn');
  const mobileDiv = document.getElementById('mobile-menu');
  if (btn && mobileDiv) {
    btn.addEventListener('click', () => mobileDiv.classList.toggle('hidden'));
    mobileDiv.innerHTML = `<div class="flex flex-col gap-4">${navHTML}</div>`;
  }
});
