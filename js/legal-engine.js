


window.addEventListener('load', () => {
  const legalPages = window.siteRegistry.filter(p => p.type === 'legal');
  const ul = document.getElementById('footer-menu');
  if (ul) {
    ul.innerHTML = legalPages.map(p => 
      `<li><a href="${p.slug || '/'}" class="hover:text-white transition-colors">${p.title}</a></li>`
    ).join('');
  }
});
