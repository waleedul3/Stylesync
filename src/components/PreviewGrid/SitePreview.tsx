import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTokenStore } from '../../store/useTokenStore';
import { Monitor, RefreshCw, AlertTriangle, Zap } from 'lucide-react';
import { fetchRawHTML } from '../../lib/scraper';

interface Props {
  siteUrl: string | null;
}

/** Build CSS that overrides the site's colors/fonts with our tokens (INFINITY MODE) */
function buildOverrideCSS(tokens: NonNullable<ReturnType<typeof useTokenStore.getState>['tokens']>): string {
  const { primary, secondary, accent, background, text } = tokens.colors;
  const { headingFont, bodyFont, baseSize, lineHeight } = tokens.typography;
  const { unit, scale } = tokens.spacing;

  // Spacing Multipliers
  const spaceXl = (scale[3] ?? 3) * unit;
  const spaceLg = (scale[2] ?? 2) * unit;
  const spaceMd = (scale[1] ?? 1.5) * unit;
  const spaceSm = (scale[0] ?? 1) * unit;

  return `
/* ═══ StyleSync INFINITY Override ═══ */
:root {
  --ss-primary: ${primary} !important;
  --ss-secondary: ${secondary} !important;
  --ss-accent: ${accent} !important;
  --ss-bg: ${background} !important;
  --ss-text: ${text} !important;
  --ss-spacing: ${unit}px !important;

  /* CSS Variable Poisoning — Overwrite common framework themes */
  --background: ${background} !important;
  --foreground: ${text} !important;
  --bg-color: ${background} !important;
  --text-color: ${text} !important;
  --body-color: ${text} !important;
  --surface: ${background} !important;
  --primary: ${primary} !important;
  --accent: ${accent} !important;
  --gray-50: ${background} !important;
}

/* ── INFINITY: Universal Grounding ── */
/* Force background and text on almost everything with max priority */
html, body, div, section, article, main, header, footer, nav, aside,
ul, ol, li, p, span, label, input, textarea, select, table, tr, td, th {
  background-color: ${background} !important;
  color: ${text} !important;
  border-color: ${secondary}33 !important;
  outline-color: ${primary}44 !important;
}

/* Exclude media and specific components from background overrides */
img, video, iframe, canvas, svg, i, [class*="icon"], [class*="Icon"] {
  background-color: transparent !important;
}

/* ── INFINITY: Typography ── */
html { font-size: ${baseSize} !important; }
body { 
  font-family: '${bodyFont}', system-ui, sans-serif !important; 
  line-height: ${lineHeight} !important; 
  -webkit-font-smoothing: antialiased;
}
h1,h2,h3,h4,h5,h6 { 
  font-family: '${headingFont}', system-ui, sans-serif !important; 
  color: ${text} !important; 
  margin-bottom: ${spaceMd}px !important;
}

/* ── INFINITY: Spacing Explosion ── */
section, article, main > div, [class*="section"], [class*="container"] {
  padding-top: ${spaceXl}px !important;
  padding-bottom: ${spaceXl}px !important;
  margin-bottom: ${spaceLg}px !important;
}
div > p, div > div {
  margin-bottom: ${spaceSm}px !important;
}

/* ── Component Overrides ── */
a { color: ${primary} !important; text-decoration: underline !important; }
button, [class*="btn"], [class*="button"] {
  background-color: ${primary} !important;
  color: #ffffff !important;
  padding: ${spaceSm}px ${spaceMd}px !important;
  border-radius: 6px !important;
  border: none !important;
  font-weight: 600 !important;
}
[class*="badge"], [class*="tag"], [class*="label-accent"] {
  background-color: ${accent} !important;
  color: #ffffff !important;
}

/* Specific Site Fixes */
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
  const [isSynced, setIsSynced] = useState(false);

  // ── Fetch real HTML ──
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
      setIsSynced(true);
    } catch (e) {
      console.error('Failed to inject CSS:', e);
      setIsSynced(false);
    }
  }, [tokens]);

  // Update CSS whenever tokens change (REFACTORED: NO RELOAD)
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

  // Build static srcdoc (REFACTORED: ONLY DEPENDS ON RAW HTML)
  const srcdoc = useMemo(() => {
    if (!rawHtml) return undefined;
    
    const infinityScript = `
      <script data-stylesync-infinity>
        (function() {
          const sync = () => {
            const styleTag = document.getElementById('__stylesync__');
            if (styleTag && styleTag.parentElement) {
              if (styleTag.nextElementSibling) {
                styleTag.parentElement.appendChild(styleTag);
              }
            }
            // Strip site-defined inline styles that fight us
            document.querySelectorAll('[style*="background"], [style*="color"]').forEach(el => {
              el.style.backgroundColor = '';
              el.style.color = '';
            });
          };
          const observer = new MutationObserver(sync);
          observer.observe(document.documentElement, { 
            childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] 
          });
          setInterval(sync, 500); // 500ms heartbeat sync
          window.addEventListener('load', sync);
        })();
      </script>
    `;

    // Shell tags for immediate injection
    const shellTags = `<style id="__stylesync__"></style>${infinityScript}`;
    return rawHtml.replace(/<\/head>/i, `${shellTags}</head>`);
  }, [rawHtml]); // <--- CRITICAL: NO TOKENS HERE. PREVENTS RELOAD.

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 48px rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* ── Browser Chrome ── */}
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
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.06)', borderRadius: 6,
          padding: '4px 10px', marginLeft: 8
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'ready' ? '#28c840' : status === 'loading' ? '#febc2e' : '#ff5f57', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {siteUrl ?? 'No site loaded'}
          </span>
          {isSynced && (
            <div title="Infinity Sync Active" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(99, 102, 241, 0.2)', padding: '1px 6px', borderRadius: 4 }}>
              <Zap size={10} color="#818cf8" fill="#818cf8" />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>Infinity</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={loadSite} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 2 }}>
            <RefreshCw size={13} />
          </button>
          <Monitor size={13} color="#4b5563" />
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: tokens?.colors.background ?? '#fff' }}>
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tokens?.colors.background ?? '#fff', zIndex: 10 }}>
             <RefreshCw size={24} color={tokens?.colors.primary} className="animate-spin" />
          </div>
        )}

        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', zIndex: 10 }}>
            <AlertTriangle size={32} color={tokens?.colors.primary} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: tokens?.colors.text }}>Deployment Error</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{errorMsg}</p>
          </div>
        )}

        {status === 'ready' && srcdoc && (
          <iframe
            key={siteUrl}
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
