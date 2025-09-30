
import { getStatusInfo } from './status-codes';
interface StatusCodeInfo {
  code: number;
  name: string;
  description: string;
  emoji: string;
}

async function sendReportEmail(toEmail: string, subject: string, textContent: string): Promise<Response> {
  const payload = {
    personalizations: [
      {
        to: [{ email: toEmail }],
      },
    ],
    from: { email: 'no-reply@not200.example', name: 'Not200 Reporter' },
    subject,
    content: [{ type: 'text/plain', value: textContent }],
  };

  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
}

function formatUtcTimestamp(d: Date): string {
  // HH:MM:SS UTC Month Day, Year
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${hh}:${mm}:${ss} UTC ${month} ${day}, ${year}`;
}

type Theme = 'current' | 'space' | 'outdoors';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHomePage(theme?: Theme): Response {
  const themeAttr = theme && theme !== 'current' ? ` data-theme="${theme}"` : '';
  const html = `
    <!DOCTYPE html>
    <html lang="en"${themeAttr}>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not200 - Ooops! Something went wrong!</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <div class="titlebar">
          <div class="left">
            <div class="traffic">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="title">Not200 - Ooops! Something went wrong!</div>
          </div>
          <label for="themeSelect" class="title" style="margin-left:auto;margin-right:8px;">Theme</label>
          <select id="themeSelect" class="theme-select" aria-label="Select theme">
            <option value="current">Current (IDE)</option>
            <option value="space">Space</option>
            <option value="outdoors">Outdoors</option>
          </select>
        </div>

        <div class="tabs">
          <div class="tab active">README.md</div>
          <div class="tab">status.ts</div>
        </div>

        <div class="content">
          <div class="heading">HTTP Status Playground</div>
          <div class="sub">Enter a status code below or try one of the quick links.</div>
          <div class="quick-grid">
            <a class="quick" href="/400">400 <span>❌</span></a>
            <a class="quick" href="/401">401 <span>🔑</span></a>
            <a class="quick" href="/403">403 <span>🚫</span></a>
            <a class="quick" href="/404">404 <span>🔍</span></a>
            <a class="quick" href="/418">418 <span>☕</span></a>
            <a class="quick" href="/429">429 <span>🐌</span></a>
            <a class="quick" href="/500">500 <span>💥</span></a>
            <a class="quick" href="/502">502 <span>🔌</span></a>
            <a class="quick" href="/503">503 <span>🚧</span></a>
          </div>
        </div>

        <div class="panel">
          <div class="hint">Jump to a code</div>
          <form id="statusForm" class="code-input">
            <input type="number" name="code" placeholder="Enter error status code (400-599)" min="100" max="599" required>
            <button type="submit">Go</button>
          </form>
        </div>

        <div class="footer">Powered by Cloudflare Workers</div>
      </div>

      <script src="/home.js" defer type="text/javascript"></script>
      <button id="modeToggle" class="mode-toggle" aria-label="Toggle day/night"></button>
    </body>
    </html>
  `;

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}



function createHTMLResponse(
  statusInfo: StatusCodeInfo,
  referrer?: string | null,
  email?: string | null,
  sourceCfRayId?: string | null,
  theme?: Theme,
): Response {
  const ref = referrer && referrer.trim().length ? referrer : null;
  const emailSafe = email && email.trim().length ? email : null;
  const raySafe = sourceCfRayId && sourceCfRayId.trim().length ? sourceCfRayId : null;
  const themeAttr = theme && theme !== 'current' ? ` data-theme="${theme}"` : '';
  const html = theme === "space"
    ? `
    <!DOCTYPE html>
    <html lang="en"${themeAttr}>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not200 - Ooops! Something went wrong!</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="space-bg">
        <div class="space-stars"></div>
        <div class="space-stars2"></div>
        <div class="space-stars3"></div>
        <div class="space-planet"></div>
      </div>
      <section class="space-status">
        <div class="block">
          <div class="eyebrow">${statusInfo.emoji} ${statusInfo.code} ${statusInfo.name}</div>
          <h1>${statusInfo.code} ${statusInfo.name}</h1>
          <p>${statusInfo.description}</p>
          <div class="meta">
            ${ref ? `Referrer: ${escapeHtml(ref)}<br>` : ''}
            ${emailSafe ? `Email: ${escapeHtml(emailSafe)}<br>` : ''}
            ${raySafe ? `Ray ID: ${escapeHtml(raySafe)}` : ''}
          </div>
          ${emailSafe ? `<div class="actions" style="margin-top:12px;"><button id="reportBtn" class="report-btn">Report</button></div>` : ''}
        </div>
      </section>
      <button id="modeToggle" class="mode-toggle" aria-label="Toggle day/night"></button>
      <script src="/status.js" type="text/javascript" defer></script>
    </body>
    </html>
    `
    : theme === "outdoors"
    ? `
    <!DOCTYPE html>
    <html lang="en"${themeAttr}>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not200 - Ooops! Something went wrong!</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="outdoor-bg">
        <div class="outdoor-sky"></div>
        <div class="outdoor-sun"></div>
        <div class="outdoor-mountains"></div>
        <div class="outdoor-foreground"></div>
      </div>
      <section class="outdoor-status">
        <div class="block">
          <div class="eyebrow">${statusInfo.emoji} ${statusInfo.code} ${statusInfo.name}</div>
          <h1>${statusInfo.code} ${statusInfo.name}</h1>
          <p>${statusInfo.description}</p>
          <div class="meta">
            ${ref ? `Referrer: ${escapeHtml(ref)}<br>` : ''}
            ${emailSafe ? `Email: ${escapeHtml(emailSafe)}<br>` : ''}
            ${raySafe ? `Ray ID: ${escapeHtml(raySafe)}` : ''}
          </div>
          ${emailSafe ? `<div class="actions" style="margin-top:12px;"><button id=\"reportBtn\" class=\"report-btn\">Report</button></div>` : ''}
        </div>
      </section>
      <button id="modeToggle" class="mode-toggle" aria-label="Toggle day/night"></button>
      <script src="/status.js" type="text/javascript" defer></script>
    </body>
    </html>
    `
    : `
    <!DOCTYPE html>
    <html lang="en"${themeAttr}>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Not200 - Ooops! Something went wrong!</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="container">
        <div class="titlebar">
          <div class="left">
            <div class="traffic">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="title">status.ts</div>
          </div>
          <label for="themeSelect" class="theme-btn" style="background:transparent;border:none;color:inherit;">Theme</label>
          <select id="themeSelect" class="theme-btn" aria-label="Select theme">
            <option value="current">Current (IDE)</option>
            <option value="space">Space</option>
            <option value="outdoors">Outdoors</option>
          </select>
        </div>

        <div class="tabs">
          <div class="tab active">status.ts</div>
          <div class="tab">README.md</div>
        </div>

        <div class="editor">
          <div class="gutter">1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13</div>
          <pre class="code"><code>
<span class="tok-cmt">// HTTP status information</span>
<span class="tok-kw">type</span> <span class="tok-type">Status</span> <span class="tok-punc">=</span> <span class="tok-punc">{</span> <span class="tok-prop">code</span><span class="tok-punc">:</span> <span class="tok-type">number</span><span class="tok-punc">;</span> <span class="tok-prop">name</span><span class="tok-punc">:</span> <span class="tok-type">string</span><span class="tok-punc">;</span> <span class="tok-prop">description</span><span class="tok-punc">:</span> <span class="tok-type">string</span> <span class="tok-punc">}</span>

<span class="tok-kw">const</span> <span class="tok-var">status</span><span class="tok-punc">:</span> <span class="tok-type">Status</span> <span class="tok-punc">=</span> <span class="tok-punc">{</span>
  <span class="tok-prop">emoji</span><span class="tok-punc">:</span> <span class="tok-str">"${statusInfo.emoji}"</span>
  <span class="tok-prop">code</span><span class="tok-punc">:</span> <span class="tok-num">${statusInfo.code}</span><span class="tok-punc">,</span>
  <span class="tok-prop">name</span><span class="tok-punc">:</span> <span class="tok-str">"${statusInfo.name}"</span><span class="tok-punc">,</span>
  <span class="tok-prop">description</span><span class="tok-punc">:</span> <span class="tok-str">"${statusInfo.description}"</span><span class="tok-punc">,</span>
  ${ref ? `<span class="tok-prop">referrer</span><span class="tok-punc">:</span> <span class="tok-str">"${escapeHtml(ref)}"</span><span class="tok-punc">,</span>` : ''}
  ${emailSafe ? `<span class="tok-prop">email</span><span class="tok-punc">:</span> <span class="tok-str">"${escapeHtml(emailSafe)}"</span><span class="tok-punc">,</span>` : ''}
  ${raySafe ? `<span class="tok-prop">sourceCfRayId</span><span class="tok-punc">:</span> <span class="tok-str">"${escapeHtml(raySafe)}"</span><span class="tok-punc">,</span>` : ''}
<span class="tok-punc">}</span>

<span class="tok-cmt">// Tip: change the code below and hit Go</span>
          </code></pre>
{{ ... }}

        <div class="panel">
          <div class="hint">Open Command Palette: enter a status code</div>
          <form id="statusForm" class="code-input">
            <input 
              type="number" 
              name="code" 
              placeholder="Enter status code (100-599)" 
              min="100" 
              max="599"
              value="${statusInfo.code}"
              required
            >
            <button type="submit">Go</button>
          </form>
        </div>
        ${emailSafe ? `<div class="actions" style="padding:12px 16px; border-top: 1px solid #1f2a44;"><button id=\"reportBtn\" class=\"report-btn\">Report</button></div>` : ''}
        <div class="footer">Powered by Cloudflare Workers · Status ${statusInfo.code} ${statusInfo.name}</div>
      </div>
      
      <button id="modeToggle" class="mode-toggle" aria-label="Toggle day/night"></button>
      <script src="/status.js" type="text/javascript" defer></script>
    </body>
    </html>
  `;


  return new Response(html, {
    status: statusInfo.code,
    headers: {
      //'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading slash
    const ref = request.headers.get('referer') || request.headers.get('referrer');
    const email = request.headers.get('x-user-email');
    const sourceCfRayId = request.headers.get('source-cf-ray-id');
    const themeParam = (url.searchParams.get('theme') || '').toLowerCase();
    const theme: Theme | undefined = themeParam === 'space' || themeParam === 'outdoors' || themeParam === 'current' ? (themeParam as Theme) : undefined;

    // Serve static assets
    if (request.method === 'GET' && (path === 'styles.css' || path === 'home.js' || path === 'status.js')) {
      // @ts-ignore - ASSETS is provided by Wrangler binding
      return env.ASSETS.fetch(request);
    }

    // Handle report endpoint
    if (request.method === 'POST' && path === 'report') {
      try {
        const emailHeader = request.headers.get('x-user-email');
        if (!emailHeader) {
          return new Response(JSON.stringify({ error: 'Missing x-user-email header' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const refHeader = request.headers.get('referer') || request.headers.get('referrer') || '';
        const rayId = request.headers.get('cf-ray') || request.headers.get('source-cf-ray-id') || '';

        let codeFromPath: number | undefined;
        const p = url.pathname.slice(1);
        const n = parseInt(p, 10);
        if (!isNaN(n)) codeFromPath = n;

        let codeFromBody: number | undefined;
        try {
          const body = await request.json<any>();
          if (body && typeof body.code === 'number') codeFromBody = body.code;
        } catch {}

        const code = codeFromBody ?? codeFromPath ?? 0;
        const ts = formatUtcTimestamp(new Date());
        const subject = `Not200 Report: ${code || 'N/A'}`;
        const text = `Status Code: ${code || 'N/A'}\nTimestamp: ${ts}\nCF-Ray-ID: ${rayId || 'N/A'}\nReferrer: ${refHeader || 'N/A'}`;

        const mailRes = await sendReportEmail(emailHeader, subject, text);
        if (!mailRes.ok) {
          const msg = await mailRes.text();
          return new Response(JSON.stringify({ ok: false, error: msg }), { status: 502, headers: { 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      } catch (e: any) {
        return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
    }
    
    // Handle root path -> Show styled homepage
    if (path === '') {
      return renderHomePage(theme);
    }
    
    // Check if the path is a status code
    const statusCode = parseInt(path, 10);
    if (!isNaN(statusCode) && statusCode >= 100 && statusCode <= 599) {
      const statusInfo = getStatusInfo(statusCode);
      return createHTMLResponse(statusInfo, ref, email, sourceCfRayId, theme);
    }
    
    // Handle API endpoint
    if (path === 'api' || path.startsWith('api/')) {
      const codeParam = url.searchParams.get('code');
      const statusCode = codeParam ? parseInt(codeParam, 10) : 400;
      
      if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
        return new Response(
          JSON.stringify({ 
            error: 'Invalid status code. Must be between 100 and 599.' 
          }), 
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      const statusInfo = getStatusInfo(statusCode);
      const payload = {
        ...statusInfo,
        ...(email ? { email } : {}),
        ...(sourceCfRayId ? { sourceCfRayId: sourceCfRayId } : {}),
      };

      return new Response(
        JSON.stringify(payload),
        { 
          status: statusCode,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // 404 for any other routes
    return createHTMLResponse(getStatusInfo(404), ref, email, sourceCfRayId, theme);
  },
} satisfies ExportedHandler<Env>;
