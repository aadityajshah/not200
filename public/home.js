document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const select = document.getElementById('themeSelect');
  const toggle = document.getElementById('modeToggle');

  const params = new URLSearchParams(window.location.search);
  const urlTheme = (params.get('theme') || '').toLowerCase();
  const urlMode = (params.get('mode') || '').toLowerCase();
  const attrTheme = root.getAttribute('data-theme');
  const active = (urlTheme || attrTheme || 'current');

  // Apply active theme
  if (active === 'current') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', active);
  if (select) select.value = active;
  if (toggle) {
    toggle.textContent = (urlMode === 'night' ? '🌙' : '☀️');
    toggle.setAttribute('aria-label', urlMode === 'night' ? 'Switch to day mode' : 'Switch to night mode');
  }
  if (urlMode) root.setAttribute('data-mode', urlMode);

  // Change handler: write to URL and reload to let server render with theme
  select?.addEventListener('change', () => {
    const val = select.value;
    const p = new URLSearchParams(window.location.search);
    if (val === 'current') p.delete('theme'); else p.set('theme', val);
    const newUrl = window.location.pathname + (p.toString() ? `?${p.toString()}` : '');
    window.location.replace(newUrl);
  });

  // Mode toggle only meaningful for outdoors theme
  toggle?.addEventListener('click', () => {
    const p = new URLSearchParams(window.location.search);
    const current = (p.get('mode') || '').toLowerCase();
    const next = current === 'night' ? 'day' : 'night';
    p.set('mode', next);
    const newUrl = window.location.pathname + (p.toString() ? `?${p.toString()}` : '');
    window.location.replace(newUrl);
  });

  // Rewrite quick links to include theme param
  const quickLinks = document.querySelectorAll('a.quick');
  quickLinks.forEach((a) => {
    try {
      const p = new URLSearchParams(window.location.search);
      if (active === 'current') p.delete('theme'); else p.set('theme', active);
      if (urlMode) p.set('mode', urlMode); else p.delete('mode');
      const base = a.getAttribute('href') || '/';
      a.setAttribute('href', `${base}${p.toString() ? `?${p.toString()}` : ''}`);
    } catch {}
  });

  // Form submit should carry theme param
  const form = document.getElementById('statusForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = form.elements.code.value;
    const p = new URLSearchParams(window.location.search);
    if (active === 'current') p.delete('theme'); else p.set('theme', active);
    if (urlMode) p.set('mode', urlMode); else p.delete('mode');
    const target = `/${code}${p.toString() ? `?${p.toString()}` : ''}`;
    window.location.href = target;
  });
});
