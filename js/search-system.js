


window.addEventListener('load', () => {
  const container = document.getElementById('search-bar-container');
  if (!container) return;
  
  container.innerHTML = `
    <input id="site-search-input" type="text" placeholder="Try: youtube downloader, delete downloads mac, find iphone downloads..." 
           class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:border-blue-500">
  `;
  
  const input = document.getElementById('site-search-input');
  const examples = ["youtube downloader", "tiktok mp3", "delete downloads mac", "find downloads iphone"];
  let i = 0;
  setInterval(() => {
    input.placeholder = "Try: " + examples[i++ % examples.length];
  }, 4000);
  
  input.addEventListener('input', (e) => {
    // your original matching logic here (kept short for space)
    console.log("Searching:", e.target.value);
  });
});

