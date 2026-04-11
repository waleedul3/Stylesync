import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTokenStore } from '../../store/useTokenStore';
import { ExternalLink, Monitor, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchRawHTML } from '../../lib/scraper';

interface Props {
  siteUrl: string | null;
}

/** Build CSS that overrides the site's colors/fonts with our tokens (OMEGA MODE) */
function buildOverrideCSS(tokens: NonNullable<ReturnType<typeof useTokenStore.getState>['tokens']>): string {
  const { primary, secondary, accent, background, text } = tokens.colors;
  const { headingFont, bodyFont, baseSize, lineHeight } = tokens.typography;
  const { unit, scale } = tokens.spacing;

  // Use the 3rd multiplier from the scale for major spacing
  const majorSpacing = (scale[2] ?? 2) * unit;
  const minorSpacing = (scale[0] ?? 1) * unit;

  return `
/* ═══ StyleSync OMEGA Override ═══ */
:root {
  --ss-primary: ${primary} !important;
  --ss-secondary: ${secondary} !important;
  --ss-accent: ${accent} !important;
  --ss-bg: ${background} !important;
  --ss-text: ${text} !important;
  --ss-spacing-unit: ${unit}px !important;

  /* CSS Variable Poisoning — Target common variables used by sites */
  --bg: ${background} !important;
  --background: ${background} !important;
  --bg-color: ${background} !important;
  --color-bg: ${background} !important;
  --surface: ${background} !important;
  
  --text: ${text} !important;
  --foreground: ${text} !important;
  --text-color: ${text} !important;
  --color-text: ${text} !important;
  --body-color: ${text} !important;
  
  --primary: ${primary} !important;
  --color-primary: ${primary} !important;
  --accent: ${accent} !important;
}

/* ── OMEGA: Reset anything that blocks background ── */
* {
  border-color: ${secondary}33 !important;
  outline-color: ${primary}66 !important;
}

/* ── OMEGA: Universal Background & Text Color ── */
/* Target almost everything except media and specialized components */
html, body, div, section, article, main, header, footer, nav, aside,
p, span, li, u, label, input, textarea, select, table, tr, td, th {
  background-color: ${background} !important;
  color: ${text} !important;
  border-color: ${secondary}33 !important;
}

/* Specific exclusions (Icons, Images) */
i, svg, img, video, [class*="icon"], [class*="Icon"] {
  background-color: transparent !important;
}

/* ── OMEGA: Typography ── */
html { font-size: ${baseSize} !important; }
body { 
  font-family: '${bodyFont}', system-ui, sans-serif !important; 
  line-height: ${lineHeight} !important; 
}
h1,h2,h3,h4,h5,h6 { 
  font-family: '${headingFont}', system-ui, sans-serif !important; 
  color: ${text} !important; 
}

/* ── OMEGA: Spacing Explosion ── */
/* Force margins and paddings on structural elements */
section, article, [class*="section"], [class*="block"], [id*="content"], main > div {
  margin-top: ${majorSpacing}px !important;
  margin-bottom: ${majorSpacing}px !important;
  padding-top: ${majorSpacing}px !important;
  padding-bottom: ${majorSpacing}px !important;
}

p, div > span, li {
  margin-bottom: ${minorSpacing}px !important;
}

/* ── Common Components ── */
a { color: ${primary} !important; }
button, [class*="btn"], [class*="button"] {
  background-color: ${primary} !important;
  color: #ffffff !important;
  padding: 8px 16px !important;
  border-radius: 6px !important;
  border: none !important;
}

/* Accent areas */
[class*="badge"], [class*="tag"], [class*="highlight"], [class*="accent"] {
  background-color: ${accent} !important;
  color: #fff !important;
}

/* Specific Huge Site Fixes */
#a-page, #dp, #dp-container, .celwidget, #nav-belt, #nav-main { 
  background-color: ${background} !important; 
}
#nav-logo-sprites, .nav-logo-link { filter: hue-rotate(180deg) brightness(1.2); }
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
  const srcdoc = useMemo(() => {
    if (!rawHtml || !tokens) return undefined;
    
    const omegaScript = `
      <script data-stylesync-omega>
        (function() {
          const forceStyles = () => {
            const styleTag = document.getElementById('__stylesync__');
            if (styleTag && styleTag.parentElement) {
              // Always move our style tag to the very end of <head> to increase priority
              if (styleTag.nextElementSibling) {
                styleTag.parentElement.appendChild(styleTag);
              }
            }
          };

          // Monitor for dynamic changes
          const observer = new MutationObserver((mutations) => {
            let shouldSync = false;
            for (const mutation of mutations) {
              if (mutation.type === 'childList' || 
                  (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class'))) {
                shouldSync = true;
                break;
              }
            }
            if (shouldSync) forceStyles();
          });

          observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });

          // Initial run
          window.addEventListener('load', forceStyles);
          setInterval(forceStyles, 2000); // Heartbeat sync
        })();
      </script>
    `;

    // Inject our script and initial style tag immediately into the HTML source
    const initialCSS = buildOverrideCSS(tokens);
    const headTag = `<style id="__stylesync__">${initialCSS}</style>${omegaScript}`;
    
    return rawHtml.replace(/<\/head>/i, `${headTag}</head>`);
  }, [rawHtml, tokens]);

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
