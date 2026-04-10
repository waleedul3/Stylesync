import { useEffect, useRef, useState, useCallback } from 'react';
import { useTokenStore } from '../../store/useTokenStore';
import { Monitor, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  siteUrl: string | null;
}

// Build the CSS override block from current tokens
function buildOverrideCSS(tokens: ReturnType<typeof useTokenStore.getState>['tokens']): string {
  if (!tokens) return '';
  const { primary, secondary, accent, background, text } = tokens.colors;
  const { headingFont, bodyFont } = tokens.typography;
  return `
/* ═══ StyleSync Live Color Overlay ═══ */
:root {
  --color-primary: ${primary} !important;
  --color-secondary: ${secondary} !important;
  --color-accent: ${accent} !important;
  --color-bg: ${background} !important;
  --color-text: ${text} !important;
}
html, body {
  background-color: ${background} !important;
  color: ${text} !important;
}
h1,h2,h3,h4,h5,h6 {
  font-family: '${headingFont}', system-ui, sans-serif !important;
  color: ${text} !important;
}
p, span, li, td, th, label, div {
  font-family: '${bodyFont}', system-ui, sans-serif !important;
}
a { color: ${primary} !important; }
a:hover { opacity: 0.8 !important; }
/* Primary buttons */
button[class*="primary"], [class*="btn-primary"], [class*="button-primary"],
[class*="cta"], [class*="hero"] button, nav button, header button:not([class*="ghost"]):not([class*="outline"]) {
  background-color: ${primary} !important;
  border-color: ${primary} !important;
  color: #ffffff !important;
}
/* Secondary buttons */
button[class*="secondary"], [class*="btn-secondary"], [class*="button-secondary"],
[class*="btn-outline"], [class*="btn-ghost"] {
  background-color: transparent !important;
  border-color: ${secondary} !important;
  color: ${secondary} !important;
}
/* Accent badges / highlights */
[class*="badge"], [class*="tag"], [class*="label"], [class*="pill"] {
  background-color: ${accent} !important;
  color: #ffffff !important;
}
/* Nav / header backgrounds */
nav, header, [class*="navbar"], [class*="header"] {
  background-color: ${background} !important;
  border-bottom-color: ${secondary}33 !important;
}
/* Cards */
[class*="card"], [class*="panel"] {
  background-color: ${background} !important;
  color: ${text} !important;
}
/* Specific SVG fills */
svg[class*="logo"] path, svg[class*="brand"] path {
  fill: ${primary} !important;
}
  `.trim();
}

export default function SitePreview({ siteUrl }: Props) {
  const tokens = useTokenStore((s) => s.tokens);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'idle' | 'fetching' | 'ready' | 'error'>('idle');
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch HTML via proxy and store it
  const loadSite = useCallback(async () => {
    if (!siteUrl) return;
    setStatus('fetching');
    setErrorMsg('');

    const PROXIES = [
      (u: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
      (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    ];

    for (const proxyFn of PROXIES) {
      try {
        const res = await fetch(proxyFn(siteUrl), { signal: AbortSignal.timeout(12000) });
        const data = await res.json().catch(() => res.text());
        const html = typeof data === 'object' ? data.contents : data;
        if (typeof html === 'string' && html.length > 500) {
          // Make all relative URLs absolute
          const baseUrl = new URL(siteUrl).origin;
          const absHtml = html
            .replace(/src="\/(?!\/)/g, `src="${baseUrl}/`)
            .replace(/href="\/(?!\/)/g, `href="${baseUrl}/`)
            .replace(/url\(\/(?!\/)/g, `url(${baseUrl}/`);
          setHtmlContent(absHtml);
          setStatus('ready');
          return;
        }
      } catch { continue; }
    }
    setStatus('error');
    setErrorMsg('Could not fetch site HTML. All proxies failed.');
  }, [siteUrl]);

  // Load on mount / siteUrl change
  useEffect(() => {
    if (siteUrl) loadSite();
  }, [siteUrl, loadSite]);

  // Inject/update CSS whenever tokens or htmlContent changes
  useEffect(() => {
    if (status !== 'ready' || !iframeRef.current || !tokens) return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
      let tag = doc.getElementById('__stylesync__') as HTMLStyleElement | null;
      if (!tag) {
        tag = doc.createElement('style');
        tag.id = '__stylesync__';
        (doc.head || doc.body)?.appendChild(tag);
      }
      tag.textContent = buildOverrideCSS(tokens);
    } catch { /* cross-origin edge case */ }
  }, [tokens, status, htmlContent]);

  // Build srcdoc with CSS already injected
  const srcdoc = htmlContent
    ? htmlContent.replace(
        /<\/head>/i,
        `<style id="__stylesync__">${buildOverrideCSS(tokens)}</style></head>`
      )
    : undefined;

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '600px',
      display: 'flex', flexDirection: 'column',
      borderRadius: '10px', overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    }}>
      {/* Browser chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', background: '#1e1e2e',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '5px',
          padding: '4px 10px', fontSize: '12px', color: '#9ca3af',
          fontFamily: 'ui-monospace, monospace', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {siteUrl ?? 'No site loaded'}
        </div>
        <button
          onClick={loadSite}
          title="Reload preview"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: '2px' }}
        >
          <RefreshCw size={13} />
        </button>
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab"
            style={{ color: '#6b7280', display: 'flex' }}>
            <ExternalLink size={13} />
          </a>
        )}
        <Monitor size={13} color="#6b7280" />
      </div>

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: tokens?.colors.background ?? '#ffffff' }}>

        {/* Fetching state */}
        {status === 'fetching' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: tokens?.colors.background ?? '#ffffff', gap: '16px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              border: `3px solid ${tokens?.colors.primary ?? '#6366f1'}30`,
              borderTopColor: tokens?.colors.primary ?? '#6366f1',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: tokens?.colors.text ?? '#111827', marginBottom: '4px' }}>
                Loading site preview
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Fetching via proxy…</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: tokens?.colors.background ?? '#ffffff', gap: '16px', padding: '24px', textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: `${tokens?.colors.primary ?? '#6366f1'}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
            }}>🌐</div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 600, color: tokens?.colors.text ?? '#111827', marginBottom: '6px' }}>
                Proxy fetch failed
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, maxWidth: '300px' }}>
                {errorMsg || 'The site blocked all CORS proxies. Color tokens are still applied to the Components preview ↓'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={loadSite} style={{
                padding: '8px 16px', background: tokens?.colors.primary ?? '#6366f1',
                color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px',
                fontWeight: 500, cursor: 'pointer',
              }}>
                Try again
              </button>
              {siteUrl && (
                <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{
                  padding: '8px 16px', background: 'rgba(255,255,255,0.08)',
                  color: '#e5e7eb', borderRadius: '6px', fontSize: '13px',
                  fontWeight: 500, textDecoration: 'none',
                }}>
                  Open in new tab ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Idle / no site */}
        {status === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: tokens?.colors.background ?? '#ffffff',
          }}>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Go back and extract a site to see a live preview</p>
          </div>
        )}

        {/* The iframe — srcdoc bypasses X-Frame-Options! */}
        {status === 'ready' && srcdoc && (
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc}
            title="Live Site Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}
