import { useEffect, useRef, useState, useCallback } from 'react';
import { useTokenStore } from '../../store/useTokenStore';
import { ExternalLink, Monitor, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchRawHTML } from '../../lib/scraper';

interface Props {
  siteUrl: string | null;
}

/** Build CSS that overrides the site's colors/fonts with our tokens */
function buildOverrideCSS(tokens: NonNullable<ReturnType<typeof useTokenStore.getState>['tokens']>): string {
  const { primary, secondary, accent, background, text, neutrals } = tokens.colors;
  const { headingFont, bodyFont, baseSize, lineHeight } = tokens.typography;
  const { unit } = tokens.spacing;

  return `
/* ═══ StyleSync Live Override ═══ */
:root {
  --color-primary: ${primary} !important;
  --color-secondary: ${secondary} !important;
  --color-accent: ${accent} !important;
  --background: ${background} !important;
  --foreground: ${text} !important;
  --spacing-unit: ${unit}px !important;
  ${neutrals.map((c, i) => `--neutral-${i}: ${c} !important;`).join('\n  ')}
}

html { 
  font-size: ${baseSize} !important; 
  background-color: ${background} !important;
}

body { 
  background-color: ${background} !important; 
  color: ${text} !important; 
  font-family: '${bodyFont}', system-ui, sans-serif !important; 
  line-height: ${lineHeight} !important;
}

h1,h2,h3,h4,h5,h6 { 
  font-family: '${headingFont}', system-ui, sans-serif !important; 
  color: ${text} !important; 
}

a:not([class*="btn"]):not([class*="button"]) { 
  color: ${primary} !important; 
}

/* Universal Spacing Overrides */
section, article, nav, footer, header {
  padding-top: calc(var(--spacing-unit) * 2) !important;
  padding-bottom: calc(var(--spacing-unit) * 2) !important;
}

/* Layout Overrides */
nav, header, [class*="nav"], [class*="header"], [class*="navbar"] { 
  background-color: ${background} !important; 
  border-bottom: 1px solid ${secondary}33 !important;
}

footer, [class*="footer"] { 
  background-color: ${secondary} !important; 
  color: #ffffff !important; 
}

/* Primary CTAs */
[class*="btn-primary"], [class*="button-primary"], [class*="btn--primary"],
[class*="cta-"], button[class*="sign"], button[class*="get-start"],
button[class*="primary"], a[class*="btn-primary"], [class*="Button--primary"] {
  background-color: ${primary} !important;
  border-color: ${primary} !important;
  color: #ffffff !important;
}

/* Accent highlights */
[class*="badge"], [class*="tag"], [class*="label"], [class*="pill"],
[class*="highlight"], [class*="accent"] {
  background-color: ${accent} !important;
  color: #ffffff !important;
}

/* Specific Amazon/Big Site Overrides */
#nav-belt, #nav-main { background-color: ${background} !important; }
#nav-logo-sprites, .nav-logo-link { filter: hue-rotate(180deg); } /* Crude logo color shift */
.nav-a { color: ${text} !important; }

/* Border colors */
[class*="border-primary"] { border-color: ${primary} !important; }

/* Background sections */
[class*="bg-primary"], [class*="section--primary"] { background-color: ${primary} !important; color: #ffffff !important; }
[class*="bg-secondary"], [class*="section--secondary"] { background-color: ${secondary} !important; color: #ffffff !important; }
`;
}

/** Fix relative URLs so images/styles load correctly */
function fixRelativeUrls(html: string, baseUrl: string): string {
  const origin = new URL(baseUrl).origin;
  return html
    .replace(/\bsrc="\/(?!\/)/g, `src="${origin}/`)
    .replace(/\bhref="\/(?!\/)/g, `href="${origin}/`)
    .replace(/\baction="\/(?!\/)/g, `action="${origin}/`)
    .replace(/url\(["']?\/(?!\/)/g, `url("${origin}/`);
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function SitePreview({ siteUrl }: Props) {
  const tokens = useTokenStore((s) => s.tokens);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [rawHtml, setRawHtml] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Fetch real HTML via proxy ──
  const loadSite = useCallback(async () => {
    if (!siteUrl) return;
    setStatus('loading');
    setRawHtml(null);
    setErrorMsg('');
    try {
      const html = await fetchRawHTML(siteUrl);
      const fixed = fixRelativeUrls(html, siteUrl);
      setRawHtml(fixed);
      setStatus('ready');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Could not fetch site');
      setStatus('error');
    }
  }, [siteUrl]);

  useEffect(() => {
    if (siteUrl) loadSite();
  }, [siteUrl, loadSite]);

  // ── Inject or update CSS ──
  const injectOrUpdateCSS = useCallback(() => {
    if (!iframeRef.current || !tokens) return;
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
    } catch (e) {
      console.error('Failed to inject CSS into preview iframe:', e);
    }
  }, [tokens]);

  // Update CSS whenever tokens change (reactive update)
  useEffect(() => {
    if (status === 'ready') {
      injectOrUpdateCSS();
    }
  }, [tokens, status, injectOrUpdateCSS]);

  // Initial injection when iframe loads
  const handleIframeLoad = () => {
    if (status === 'ready') {
      injectOrUpdateCSS();
    }
  };

  // Build srcdoc ONLY when rawHtml changes (prevents reload on token change)
  const srcdoc = rawHtml ? rawHtml : undefined;

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 48px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* ── macOS-style browser chrome ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px',
        background: '#1a1b26', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* Address bar */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)', borderRadius: 6,
          padding: '4px 10px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'ready' ? '#28c840' : status === 'loading' ? '#febc2e' : '#ff5f57', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {siteUrl ?? 'No site loaded'}
          </span>
        </div>

        <button onClick={loadSite} title="Reload" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 2, borderRadius: 4 }}>
          <RefreshCw size={13} />
        </button>
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" title="Open in real browser" style={{ color: '#6b7280', display: 'flex' }}>
            <ExternalLink size={13} />
          </a>
        )}
        <Monitor size={13} color="#4b5563" />
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: tokens?.colors.background ?? '#fff' }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: tokens?.colors.background ?? '#fff', gap: 16, zIndex: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `3px solid ${tokens?.colors.primary ?? '#6366f1'}20`,
              borderTopColor: tokens?.colors.primary ?? '#6366f1',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: tokens?.colors.text ?? '#111', marginBottom: 4 }}>Loading real site…</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Fetching via server-side proxy</p>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: tokens?.colors.background ?? '#fff', gap: 16, padding: 32, textAlign: 'center', zIndex: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${tokens?.colors.primary ?? '#6366f1'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color={tokens?.colors.primary ?? '#6366f1'} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: tokens?.colors.text ?? '#111', marginBottom: 8 }}>Could not load site</p>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, maxWidth: 340 }}>
                {errorMsg || 'The site may be blocking server-side requests. Try another site or open the real site in a new tab.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={loadSite} style={{ padding: '9px 18px', background: tokens?.colors.primary ?? '#6366f1', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Try again
              </button>
              {siteUrl && (
                <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.08)', color: '#e5e7eb', borderRadius: 7, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Open real site ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Idle */}
        {status === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens?.colors.background ?? '#fff' }}>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Enter a URL on the home page to preview</p>
          </div>
        )}

        {/* The real site — rendered via srcdoc (bypasses X-Frame-Options) */}
        {status === 'ready' && srcdoc && (
          <iframe
            key={siteUrl} /* remount ONLY on URL change */
            ref={iframeRef}
            srcDoc={srcdoc}
            onLoad={handleIframeLoad}
            title={`Preview of ${siteUrl}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        )}
      </div>
    </div>
  );
}
