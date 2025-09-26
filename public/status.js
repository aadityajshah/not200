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

  // Change handler: write to URL and reload so server renders with theme
  select?.addEventListener('change', () => {
    const val = select.value;
    const p = new URLSearchParams(window.location.search);
    if (val === 'current') p.delete('theme'); else p.set('theme', val);
    const newUrl = window.location.pathname + (p.toString() ? `?${p.toString()}` : '');
    window.location.replace(newUrl);
  });

  // Report button handler with disabled state + toast feedback
  function showToast(message, type = 'success') {
    try {
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `<span class="icon">${type === 'success' ? '✅' : '⚠️'}</span><span class="msg">${message}</span>`;
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.transition = 'opacity 200ms ease';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 220);
      }, 2200);
    } catch {}
  }

  const reportBtn = document.getElementById('reportBtn');
  reportBtn?.addEventListener('click', async () => {
    try {
      if (reportBtn.disabled) return;

      const codeMeta = document.querySelector('meta[name="x-status-code"]');
      const emailMeta = document.querySelector('meta[name="x-user-email"]');
      let code = 0;
      if (codeMeta) {
        code = parseInt(codeMeta.getAttribute('content') || '0', 10) || 0;
      } else {
        // Fallback: parse from heading text
        const h1 = document.querySelector('h1');
        const m = h1?.textContent?.match(/(\d{3})/);
        if (m) code = parseInt(m[1], 10);
      }
      const email = emailMeta?.getAttribute('content') || '';

      const prevText = reportBtn.textContent;
      reportBtn.disabled = true;
      reportBtn.textContent = 'Sending…';

      const res = await fetch('/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...(email ? { email } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        showToast('Failed to send report.', 'error');
        reportBtn.disabled = false;
        reportBtn.textContent = prevText || 'Report';
        return;
      }
      showToast('Report sent. Thank you!', 'success');
      reportBtn.textContent = 'Reported';
      // keep disabled to indicate completion
    } catch (err) {
      showToast('Something went wrong sending the report.', 'error');
      if (reportBtn) {
        reportBtn.disabled = false;
        reportBtn.textContent = 'Report';
      }
    }
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
