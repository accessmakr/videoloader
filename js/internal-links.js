


window.addEventListener('load', () => {
  // Social links
  const socialDiv = document.getElementById('footer-social-links');
  if (socialDiv && window.SOCIAL_LINKS) {
    socialDiv.innerHTML = window.SOCIAL_LINKS.map(s => 
      `<a href="${s.url}" target="_blank" class="text-3xl hover:scale-125 transition">${s.icon}</a>`
    ).join('');
  }

  // Related section (keeps your original logic but now inserts cleanly)
  const registry = window.siteRegistry || [];
  const currentSlug = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '') || '';
  const related = registry.filter(p => p.slug !== currentSlug && p.type !== 'legal' && p.type !== 'utility');
  
  const html = `<section class="max-w-4xl mx-auto px-6 py-16 border-t"><h2 class="text-3xl font-bold text-center mb-8">Related Tools & Guides</h2><div class="grid md:grid-cols-3 gap-6">${related.map(p => `<a href="/${p.slug}" class="block p-6 bg-white dark:bg-slate-800 rounded-2xl shadow hover:shadow-xl">${p.title}</a>`).join('')}</div></section>`;
  
  const footer = document.querySelector('footer');
  if (footer) {
    const div = document.createElement('div');
    div.innerHTML = html;
    footer.parentNode.insertBefore(div.firstElementChild, footer);
  }
});
