import { useEffect, useRef, useState } from 'react';
import { useTokenStore } from '../../store/useTokenStore';
import { Monitor, AlertTriangle, Loader } from 'lucide-react';

interface Props {
  siteUrl: string | null;
}

export default function SitePreview({ siteUrl }: Props) {
  const tokens = useTokenStore((s) => s.tokens);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'blocked'>('loading');

  // Inject CSS override whenever tokens change
  useEffect(() => {
    if (!iframeRef.current || status !== 'loaded') return;
    try {
      const doc = iframeRef.current.contentDocument;
      if (!doc || !tokens) return;

      let styleTag = doc.getElementById('stylesync-overlay') as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = doc.createElement('style');
        styleTag.id = 'stylesync-overlay';
        doc.head?.appendChild(styleTag);
      }

      const { primary, secondary, accent, background, text } = tokens.colors;
      const { headingFont, bodyFont } = tokens.typography;

      // Inject overrides for the most common CSS patterns
      styleTag.textContent = `
        :root {
          --color-primary: ${primary} !important;
          --color-secondary: ${secondary} !important;
          --color-accent: ${accent} !important;
          --color-background: ${background} !important;
          --color-text: ${text} !important;
        }
        /* StyleSync live color overlay */
        a, a:visited { color: ${primary} !important; }
        button:not([style*="background"]):not(.secondary) { background-color: ${primary} !important; color: #fff !important; }
        [class*="primary"],[class*="brand"] { background-color: ${primary} !important; color: #fff !important; }
        [class*="accent"] { background-color: ${accent} !important; }
        body { background-color: ${background} !important; color: ${text} !important; }
        h1,h2,h3,h4,h5,h6 { font-family: '${headingFont}', sans-serif !important; color: ${text} !important; }
        p,span,li,td,th { font-family: '${bodyFont}', sans-serif !important; }
      `;
    } catch {
      // Cross-origin iframe — can't access contentDocument (expected for external sites)
      setStatus('blocked');
    }
  }, [tokens, status]);

  const handleLoad = () => {
    try {
      // Test if we can access the document (same-origin check)
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.body) {
        setStatus('loaded');
      } else {
        setStatus('blocked');
      }
    } catch {
      setStatus('blocked');
    }
  };

  const handleError = () => setStatus('blocked');

  if (!siteUrl) return null;

  // Use a CORS proxy to load the site in the iframe
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(siteUrl)}`;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '500px',
      background: tokens?.colors.background ?? '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px',
        background: '#1a1a2e',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '4px',
          padding: '3px 10px', fontSize: '12px', color: '#9ca3af',
          fontFamily: 'ui-monospace, monospace',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {siteUrl}
        </div>
        <Monitor size={13} color="#6b7280" />
      </div>

      {/* Status overlays */}
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: '36px 0 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: tokens?.colors.background ?? '#ffffff',
          flexDirection: 'column', gap: '12px',
        }}>
          <Loader size={24} color={tokens?.colors.primary ?? '#6366f1'} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading site preview…</p>
        </div>
      )}

      {status === 'blocked' && (
        <div style={{
          position: 'absolute', inset: '36px 0 0 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: tokens?.colors.background ?? '#ffffff',
          flexDirection: 'column', gap: '12px', padding: '24px', textAlign: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px', background: `${tokens?.colors.primary ?? '#6366f1'}15`,
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} color={tokens?.colors.primary ?? '#6366f1'} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: tokens?.colors.text ?? '#111827', marginBottom: '6px' }}>
              Site blocked browser preview
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, maxWidth: '320px' }}>
              {siteUrl} uses security headers (X-Frame-Options) that prevent embedding.
              Color changes still apply to the design preview below ↓
            </p>
          </div>
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{
            padding: '8px 16px', background: tokens?.colors.primary ?? '#6366f1',
            color: '#fff', borderRadius: '6px', fontSize: '13px',
            textDecoration: 'none', fontWeight: 500,
          }}>
            Open site in new tab ↗
          </a>
        </div>
      )}

      {/* The iframe */}
      <iframe
        ref={iframeRef}
        src={siteUrl}
        onLoad={handleLoad}
        onError={handleError}
        title="Site Preview"
        sandbox="allow-scripts allow-same-origin allow-forms"
        style={{
          width: '100%',
          height: 'calc(100% - 36px)',
          border: 'none',
          display: status === 'blocked' ? 'none' : 'block',
          background: tokens?.colors.background ?? '#ffffff',
        }}
      />
    </div>
  );
}
