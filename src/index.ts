interface StatusCodeInfo {
  code: number;
  name: string;
  description: string;
  emoji: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHomePage(): Response {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status Code Explorer</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          background: #0b1220; color: #e5e7eb; min-height: 100vh;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }

        .container { width: min(920px, 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,.5); border: 1px solid #1f2a44; background: #0f172a; }
        .titlebar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; background: #0a1222; border-bottom: 1px solid #1f2a44; }
        .left { display: flex; align-items: center; gap: 12px; }
        .traffic { display: flex; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ff5f57; } .dot.yellow { background: #febc2e; } .dot.green { background: #28c840; }
        .title { color: #9aa7bd; font-weight: 600; }
        .theme-btn { background: #0f172a; color: #cbd5e1; border: 1px solid #1f2a44; padding: 6px 10px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .theme-btn:hover { background: #111a31; }

        .tabs { display: flex; gap: 8px; padding: 8px 12px 0 12px; background: #0f172a; border-bottom: 1px solid #1f2a44; }
        .tab { padding: 8px 12px; border-top-left-radius: 6px; border-top-right-radius: 6px; background: #0a1222; color: #8aa0b6; border: 1px solid #1f2a44; border-bottom: none; }
        .tab.active { background: #0f172a; color: #e5e7eb; }

        .content { padding: 20px 16px 8px 16px; }
        .heading { font-size: 18px; color: #e5e7eb; margin-bottom: 8px; }
        .sub { color: #9aa7bd; margin-bottom: 16px; }

        .quick-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-top: 8px; }
        .quick { background: #0a1222; border: 1px solid #1f2a44; border-radius: 8px; padding: 10px 12px; color: #cbd5e1; text-decoration: none; display: flex; justify-content: space-between; align-items: center; }
        .quick:hover { background: #111a31; border-color: #2b395e; }

        .panel { border-top: 1px solid #1f2a44; background: #0a1222; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .panel .hint { color: #8aa0b6; font-size: 12px; }
        .code-input { display: flex; gap: 8px; }
        input[type="number"] { background: #0f172a; border: 1px solid #1f2a44; color: #e5e7eb; padding: 8px 12px; border-radius: 6px; width: 200px; }
        button { background: #2563eb; color: white; border: 1px solid #1d4ed8; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; }
        button:hover { background: #1d4ed8; }
        .footer { padding: 10px 14px; color: #64748b; background: #0a1222; border-top: 1px solid #1f2a44; font-size: 12px; text-align: right; }

        /* Light theme */
        [data-theme="light"] body { background: #f3f4f6; color: #0f172a; }
        [data-theme="light"] .container { background: #ffffff; border-color: #e5e7eb; }
        [data-theme="light"] .titlebar { background: #f8fafc; border-color: #e5e7eb; }
        [data-theme="light"] .tabs { background: #ffffff; border-color: #e5e7eb; }
        [data-theme="light"] .tab { background: #f8fafc; color: #475569; border-color: #e5e7eb; }
        [data-theme="light"] .tab.active { background: #ffffff; color: #0f172a; }
        [data-theme="light"] .panel { background: #f8fafc; border-color: #e5e7eb; }
        [data-theme="light"] input[type="number"] { background: #ffffff; color: #0f172a; border-color: #e5e7eb; }
        [data-theme="light"] .footer { background: #f8fafc; border-color: #e5e7eb; color: #475569; }
      </style>
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
            <div class="title">Status Code Explorer</div>
          </div>
          <button id="themeToggle" class="theme-btn" aria-label="Toggle theme">🌙 Dark</button>
        </div>

        <div class="tabs">
          <div class="tab active">README.md</div>
          <div class="tab">status.ts</div>
        </div>

        <div class="content">
          <div class="heading">HTTP Status Playground</div>
          <div class="sub">Enter a status code below or try one of the quick links.</div>
          <div class="quick-grid">
            <a class="quick" href="/200">200 <span>✅</span></a>
            <a class="quick" href="/201">201 <span>✨</span></a>
            <a class="quick" href="/204">204 <span>➖</span></a>
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
            <input type="number" name="code" placeholder="Enter status code (100-599)" min="100" max="599" required>
            <button type="submit">Go</button>
          </form>
        </div>

        <div class="footer">Powered by <img src="/public/workers.webp" height="16px">Cloudflare Workers</div>
      </div>

      <script>
        (function() {
          const root = document.documentElement;
          const btn = document.getElementById('themeToggle');
          const saved = localStorage.getItem('theme');
          if (saved === 'light') { root.setAttribute('data-theme', 'light'); btn.textContent = '🌞 Light'; }
          else { root.removeAttribute('data-theme'); btn.textContent = '🌙 Dark'; }
          btn?.addEventListener('click', () => {
            const isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) { root.removeAttribute('data-theme'); localStorage.removeItem('theme'); btn.textContent = '🌙 Dark'; }
            else { root.setAttribute('data-theme', 'light'); localStorage.setItem('theme', 'light'); btn.textContent = '🌞 Light'; }
          });
        })();

        document.getElementById('statusForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const code = e.target.elements.code.value;
          window.location.href = '/' + code;
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}

const statusCodes: Record<number, StatusCodeInfo> = {
  200: {
    code: 200,
    name: 'OK',
    description: 'The request has succeeded.',
    emoji: '✅',
  },
  201: {
    code: 201,
    name: 'Created',
    description: 'The request has been fulfilled and has resulted in one or more new resources being created.',
    emoji: '✨',
  },
  204: {
    code: 204,
    name: 'No Content',
    description: 'The server successfully processed the request and is not returning any content.',
    emoji: '➖',
  },
  400: {
    code: 400,
    name: 'Bad Request',
    description: 'The server cannot process the request due to something that is perceived to be a client error.',
    emoji: '❌',
  },
  401: {
    code: 401,
    name: 'Unauthorized',
    description: 'The request has not been applied because it lacks valid authentication credentials.',
    emoji: '🔑',
  },
  403: {
    code: 403,
    name: 'Forbidden',
    description: 'The server understood the request but refuses to authorize it.',
    emoji: '🚫',
  },
  404: {
    code: 404,
    name: 'Not Found',
    description: 'The server cannot find the requested resource.',
    emoji: '🔍',
  },
  418: {
    code: 418,
    name: "I'm a teapot",
    description: 'The server refuses the attempt to brew coffee with a teapot.',
    emoji: '☕',
  },
  429: {
    code: 429,
    name: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time.',
    emoji: '🐌',
  },
  500: {
    code: 500,
    name: 'Internal Server Error',
    description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.',
    emoji: '💥',
  },
  502: {
    code: 502,
    name: 'Bad Gateway',
    description: 'The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed.',
    emoji: '🔌',
  },
  503: {
    code: 503,
    name: 'Service Unavailable',
    description: 'The server is not ready to handle the request.',
    emoji: '🚧',
  },
  504: {
    code: 504,
    name: 'Gateway Timeout',
    description: 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.',
    emoji: '⏱️',
  },
};

function getStatusInfo(statusCode: number): StatusCodeInfo {
  return statusCodes[statusCode as keyof typeof statusCodes] || {
    code: statusCode,
    name: 'Unknown Status',
    description: 'This status code is not in our database.',
    emoji: '❓',
  };
}

function createHTMLResponse(statusInfo: StatusCodeInfo, referrer?: string | null): Response {
  const ref = referrer && referrer.trim().length ? referrer : null;
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${statusInfo.code} ${statusInfo.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          background: #0b1220; /* editor background */
          color: #e5e7eb;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .container {
          width: min(920px, 100%);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid #1f2a44;
          background: #0f172a; /* panel */
        }

        .titlebar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #0a1222;
          border-bottom: 1px solid #1f2a44;
        }

        .traffic { display: flex; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.red { background: #ff5f57; }
        .dot.yellow { background: #febc2e; }
        .dot.green { background: #28c840; }
        .title { color: #9aa7bd; font-weight: 600; }

        .tabs {
          display: flex;
          gap: 8px;
          padding: 8px 12px 0 12px;
          background: #0f172a;
          border-bottom: 1px solid #1f2a44;
        }

        .tab {
          padding: 8px 12px;
          border-top-left-radius: 6px;
          border-top-right-radius: 6px;
          background: #0a1222;
          color: #8aa0b6;
          border: 1px solid #1f2a44;
          border-bottom: none;
        }
        .tab.active { background: #0f172a; color: #e5e7eb; }

        .editor {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0;
          background: #0f172a;
        }

        .gutter {
          user-select: none;
          padding: 14px 12px;
          text-align: right;
          color: #4b5563;
          background: #0a1222;
          border-right: 1px solid #1f2a44;
          line-height: 1.8;
          min-width: 44px;
        }

        .code {
          padding: 14px 16px;
          overflow-x: auto;
          white-space: pre;
          font-size: 14px;
          line-height: 1.8;
        }

        /* Syntax colors (inspired by VSCode Dark+) */
        .tok-kw { color: #c792ea; }          /* keywords */
        .tok-type { color: #82aaff; }        /* types */
        .tok-var { color: #f78c6c; }         /* variables */
        .tok-prop { color: #addb67; }        /* property */
        .tok-num { color: #f78c6c; }         /* numbers */
        .tok-str { color: #ecc48d; }         /* strings */
        .tok-punc { color: #89ddff; }        /* punctuation */
        .tok-cmt { color: #646e82; font-style: italic; } /* comments */

        .panel {
          border-top: 1px solid #1f2a44;
          background: #0a1222;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .panel .hint { color: #8aa0b6; font-size: 12px; }

        .code-input { display: flex; gap: 8px; }
        input[type="number"] {
          background: #0f172a;
          border: 1px solid #1f2a44;
          color: #e5e7eb;
          padding: 8px 12px;
          border-radius: 6px;
          width: 160px;
        }

        button {
          background: #2563eb;
          color: white;
          border: 1px solid #1d4ed8;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
        button:hover { background: #1d4ed8; }

        .footer {
          padding: 10px 14px;
          color: #64748b;
          background: #0a1222;
          border-top: 1px solid #1f2a44;
          font-size: 12px;
          text-align: right;
        }
        /* Titlebar spacer and theme button */
        .titlebar { justify-content: space-between; }
        .titlebar .left { display: flex; align-items: center; gap: 12px; }
        .spacer { flex: 1; }
        .theme-btn {
          background: #0f172a;
          color: #cbd5e1;
          border: 1px solid #1f2a44;
          padding: 6px 10px;
          border-radius: 6px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .theme-btn:hover { background: #111a31; }

        /* Light theme overrides */
        [data-theme="light"] body { background: #f3f4f6; color: #0f172a; }
        [data-theme="light"] .container { background: #ffffff; border-color: #e5e7eb; }
        [data-theme="light"] .titlebar { background: #f8fafc; border-color: #e5e7eb; }
        [data-theme="light"] .tabs { background: #ffffff; border-color: #e5e7eb; }
        [data-theme="light"] .tab { background: #f8fafc; color: #475569; border-color: #e5e7eb; }
        [data-theme="light"] .tab.active { background: #ffffff; color: #0f172a; }
        [data-theme="light"] .gutter { background: #f8fafc; color: #94a3b8; border-color: #e5e7eb; }
        [data-theme="light"] .code { color: #0f172a; }
        [data-theme="light"] .panel { background: #f8fafc; border-color: #e5e7eb; }
        [data-theme="light"] input[type="number"] { background: #ffffff; color: #0f172a; border-color: #e5e7eb; }
        [data-theme="light"] button { background: #2563eb; }
        [data-theme="light"] .footer { background: #f8fafc; border-color: #e5e7eb; color: #475569; }
      </style>
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
          <button id="themeToggle" class="theme-btn" aria-label="Toggle theme">🌙 Dark</button>
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
  <span class="tok-prop">code</span><span class="tok-punc">:</span> <span class="tok-num">${statusInfo.code}</span><span class="tok-punc">,</span>
  <span class="tok-prop">name</span><span class="tok-punc">:</span> <span class="tok-str">"${statusInfo.name}"</span><span class="tok-punc">,</span>
  <span class="tok-prop">description</span><span class="tok-punc">:</span> <span class="tok-str">"${statusInfo.description}"</span><span class="tok-punc">,</span>
  ${ref ? `<span class="tok-prop">referrer</span><span class="tok-punc">:</span> <span class="tok-str">"${escapeHtml(ref)}"</span><span class="tok-punc">,</span>` : ''}
  <span class="tok-prop">emoji</span><span class="tok-punc">:</span> <span class="tok-str">"${statusInfo.emoji}"</span>
<span class="tok-punc">}</span>

<span class="tok-cmt">// Tip: change the code below and hit Go</span>
          </code></pre>
        </div>

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

        <div class="footer">Powered by Cloudflare Workers · Status ${statusInfo.code} ${statusInfo.name}</div>
      </div>
      
      <script>
        (function() {
          const root = document.documentElement;
          const btn = document.getElementById('themeToggle');
          const saved = localStorage.getItem('theme');
          if (saved === 'light') {
            root.setAttribute('data-theme', 'light');
            if (btn) btn.textContent = '🌞 Light';
          } else {
            root.removeAttribute('data-theme');
            if (btn) btn.textContent = '🌙 Dark';
          }
          btn?.addEventListener('click', () => {
            const isLight = root.getAttribute('data-theme') === 'light';
            if (isLight) {
              root.removeAttribute('data-theme');
              localStorage.removeItem('theme');
              btn.textContent = '🌙 Dark';
            } else {
              root.setAttribute('data-theme', 'light');
              localStorage.setItem('theme', 'light');
              btn.textContent = '🌞 Light';
            }
          });
        })();

        document.getElementById('statusForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const code = e.target.elements.code.value;
          window.location.href = "/" + code;
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    status: statusInfo.code,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
    },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.slice(1); // Remove leading slash
    
    // Handle root path -> Show styled homepage
    if (path === '') {
      return renderHomePage();
    }
    
    // Check if the path is a status code
    const statusCode = parseInt(path, 10);
    if (!isNaN(statusCode) && statusCode >= 100 && statusCode <= 599) {
      const statusInfo = getStatusInfo(statusCode);
      const ref = request.headers.get('referer') || request.headers.get('referrer');
      return createHTMLResponse(statusInfo, ref);
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
      
      return new Response(
        JSON.stringify(statusInfo),
        { 
          status: statusCode,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // 404 for any other routes
    return createHTMLResponse(getStatusInfo(404), request.headers.get('referer') || request.headers.get('referrer'));
  },
} satisfies ExportedHandler<Env>;
