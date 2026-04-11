import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useTokenStore } from '../../store/useTokenStore';
import { Monitor, RefreshCw, AlertTriangle, Zap } from 'lucide-react';
import { fetchRawHTML } from '../../lib/scraper';

interface Props {
  siteUrl: string | null;
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
    setIsSynced(false);
    try {
      const html = await fetchRawHTML(siteUrl);
      // Fix relative URLs
      const origin = new URL(siteUrl).origin;
      const fixed = html
        .replace(/\bsrc="\/(?!\/)/g, `src="${origin}/`)
        .replace(/\bhref="\/(?!\/)/g, `href="${origin}/`)
        .replace(/\baction="\/(?!\/)/g, `action="${origin}/`)
        .replace(/url\(["']?\/(?!\/)/g, `url("${origin}/`);
      
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

  // ── Dispatch Tokens via PostMessage Bridge ──
  useEffect(() => {
    if (status === 'ready' && iframeRef.current?.contentWindow && tokens) {
      // Send message to internal iframe script
      iframeRef.current.contentWindow.postMessage({ 
        type: 'STYLESYNC_TOKEN_UPDATE', 
        tokens 
      }, '*');
      setIsSynced(true);
    }
  }, [tokens, status]);

  // Initial sync when iframe loads
  const handleIframeLoad = () => {
    if (status === 'ready' && iframeRef.current?.contentWindow && tokens) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'STYLESYNC_TOKEN_UPDATE', 
        tokens 
      }, '*');
      setIsSynced(true);
    }
  };

  // ── Build Autonomous srcdoc Shell ──
  const srcdoc = useMemo(() => {
    if (!rawHtml) return undefined;
    
    // We use a separate string for the script to avoid complex escaping
    const bridgeScript = `
      <script data-stylesync-bridge>
        (function() {
          let currentTokens = null;

          function generateCSS(tokens) {
            const { primary, secondary, accent, background, text } = tokens.colors;
            const { headingFont, bodyFont, baseSize, lineHeight } = tokens.typography;
            const { unit, scale } = tokens.spacing;

            const spaceLg = (scale[2] ?? 2) * unit;
            const spaceMd = (scale[1] ?? 1.5) * unit;

            return "/* StyleSync Bridge */" + 
              ":root { " +
              "--ss-bg: " + background + " !important; " +
              "--ss-text: " + text + " !important; " +
              "--ss-primary: " + primary + " !important; " +
              "} " +
              "* { background-color: " + background + " !important; color: " + text + " !important; border-color: " + secondary + "33 !important; } " +
              "html, body { font-size: " + baseSize + " !important; font-family: '" + bodyFont + "', sans-serif !important; line-height: " + lineHeight + " !important; } " +
              "h1,h2,h3,h4,h5,h6 { font-family: '" + headingFont + "', sans-serif !important; } " +
              "div, section, article { margin-bottom: " + spaceMd + "px !important; padding-top: " + spaceLg + "px !important; } " +
              "img, video, svg, i { background-color: transparent !important; } " +
              "a { color: " + primary + " !important; }";
          }

          function applyTokens(tokens) {
            currentTokens = tokens;
            let tag = document.getElementById('__stylesync__');
            if (!tag) {
              tag = document.createElement('style');
              tag.id = '__stylesync__';
              document.head.appendChild(tag);
            }
            tag.textContent = generateCSS(tokens);
            
            // Proactive cleanup
            document.querySelectorAll('[style*="background"], [style*="color"]').forEach(el => {
              el.style.backgroundColor = '';
              el.style.color = '';
            });
          }

          window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'STYLESYNC_TOKEN_UPDATE') {
              applyTokens(event.data.tokens);
            }
          });

          const observer = new MutationObserver(() => {
            if (currentTokens) applyTokens(currentTokens);
          });
          observer.observe(document.documentElement, { 
            childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] 
          });
        })();
      </script>
    `;

    const shell = '<style id="__stylesync__"></style>' + bridgeScript;
    return rawHtml.replace(/<\/head>/i, shell + "</head>");
  }, [rawHtml]);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 12px 64px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
    }}>

      {/* ── macOS browser chrome ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
        background: '#1a1b26', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>

        {/* Address bar with Sync Status */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.06)', borderRadius: 8,
          padding: '6px 12px', marginLeft: 12, border: '1px solid rgba(255,255,255,0.04)'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: status === 'ready' ? '#28c840' : status === 'loading' ? '#febc2e' : '#ff5f57', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {siteUrl ?? 'No site loaded'}
          </span>
          {isSynced && (
            <div title="Infinity Bridge Sync Active" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(99, 102, 241, 0.15)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <Zap size={11} color="#818cf8" fill="#818cf8" strokeWidth={3} />
              <span style={{ fontSize: 10, fontWeight: 800, color: '#818cf8', letterSpacing: '0.05em' }}>BRIDGE ACTIVE</span>
            </div>
          )}
        </div>

        <button onClick={loadSite} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', transition: 'color 0.2s' }}>
          <RefreshCw size={15} />
        </button>
        <Monitor size={15} color="#4b5563" />
      </div>

      {/* ── Content Area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: tokens?.colors.background ?? '#000' }}>
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26, 27, 38, 0.8)', zIndex: 10, backdropFilter: 'blur(4px)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(129, 140, 248, 0.2)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        )}

        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', zIndex: 10, background: '#1a1b26' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Preview Blocked</p>
            <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 360, lineHeight: 1.6 }}>{errorMsg}</p>
            <button onClick={loadSite} style={{ marginTop: 24, padding: '10px 24px', background: '#818cf8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Retry Bridge</button>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
