import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCw, Monitor, Layout } from 'lucide-react';
import { useTokenStore } from '../store/useTokenStore';
import { useTokenListener } from '../hooks/useTokenListener';
import ColorPicker from '../components/TokenEditor/ColorPicker';
import TypographyInspector from '../components/TokenEditor/TypographyInspector';
import SpacingVisualizer from '../components/TokenEditor/SpacingVisualizer';
import VersionHistory from '../components/VersionHistory';
import ExportPanel from '../components/ExportPanel';
import ButtonSet from '../components/PreviewGrid/ButtonSet';
import InputSet from '../components/PreviewGrid/InputSet';
import CardSet from '../components/PreviewGrid/CardSet';
import TypeScale from '../components/PreviewGrid/TypeScale';
import SitePreview from '../components/PreviewGrid/SitePreview';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const tokens = useTokenStore((s) => s.tokens);
  const setSessionId = useTokenStore((s) => s.setSessionId);
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'spacing'>('colors');
  const [previewMode, setPreviewMode] = useState<'components' | 'site'>('components');

  // Retrieve the URL that was scraped (stored in localStorage)
  const [siteUrl, setSiteUrl] = useState<string | null>(null);

  useTokenListener(sessionId);

  useEffect(() => {
    if (!sessionId) { navigate('/'); return; }
    setSessionId(sessionId);

    // Restore URL from local history
    try {
      const raw = localStorage.getItem(`stylesync_history_${sessionId}`);
      if (raw) {
        const entries = JSON.parse(raw);
        const scraped = entries.find((e: any) => e.changeType === 'scraped' && e.tokenPath === 'all');
        if (scraped?.newValue) setSiteUrl(scraped.newValue);
      }
    } catch { /* ignore */ }
  }, [sessionId]);

  if (!tokens) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0f11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Loading design tokens…</p>
        </div>
      </div>
    );
  }

  const { primary, background } = tokens.colors;

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f11', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOP BAR ── */}
      <header style={{
        height: '52px', background: '#0f0f11',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 50, flexShrink: 0,
      }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 12h6M9 15h4" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
            Style<span style={{ color: '#6366f1' }}>Sync</span>
          </span>
        </button>

        {/* Center: Preview mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
          {([
            { id: 'components', label: 'Components', icon: <Layout size={13} /> },
            { id: 'site', label: 'Site Preview', icon: <Monitor size={13} /> },
          ] as const).map(({ id, label, icon }) => (
            <button key={id} onClick={() => setPreviewMode(id)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '6px', border: 'none',
              background: previewMode === id ? primary : 'transparent',
              color: previewMode === id ? '#fff' : '#6b7280',
              fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              transition: 'all 150ms ease',
            }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button id="rescrape-btn" onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
            color: '#9ca3af', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 150ms ease',
          }}
            onMouseOver={e => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <RefreshCw size={13} /> Re-scrape
          </button>
          <ExportPanel />
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <aside style={{
          width: '300px', flexShrink: 0, background: '#0f0f11',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
          {/* Color preview strip */}
          <div style={{ display: 'flex', height: '4px', flexShrink: 0 }}>
            {[tokens.colors.primary, tokens.colors.secondary, tokens.colors.accent, tokens.colors.background, tokens.colors.text].map((c, i) => (
              <div key={i} style={{ flex: 1, background: c }} />
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            {(['colors', 'typography', 'spacing'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveSection(tab)} style={{
                flex: 1, padding: '12px 8px', background: 'transparent', border: 'none',
                borderBottom: activeSection === tab ? `2px solid ${primary}` : '2px solid transparent',
                color: activeSection === tab ? '#ffffff' : '#6b7280',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                transition: 'color 150ms ease', textTransform: 'capitalize', marginBottom: '-1px',
              }}>{tab}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, padding: '0 16px 16px', overflowY: 'auto' }}>
            {activeSection === 'colors' && <ColorPicker />}
            {activeSection === 'typography' && <TypographyInspector />}
            {activeSection === 'spacing' && <SpacingVisualizer />}
            <div style={{ marginTop: '24px' }}>
              <VersionHistory />
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main style={{
          flex: 1,
          background: previewMode === 'site' ? '#1a1a2e' : background,
          overflowY: 'auto',
          transition: 'background 300ms ease',
        }}>
          {previewMode === 'site' ? (
            /* SITE PREVIEW MODE */
            <div style={{ padding: '16px', height: 'calc(100vh - 52px)', boxSizing: 'border-box' }}>
              <SitePreview siteUrl={siteUrl} />
            </div>
          ) : (
            /* COMPONENTS MODE */
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px' }}>
              <ButtonSet />
              <div style={{ height: '48px' }} />
              <InputSet />
              <div style={{ height: '48px' }} />
              <CardSet />
              <div style={{ height: '48px' }} />
              <TypeScale />

              {/* Neutrals */}
              {tokens.colors.neutrals && tokens.colors.neutrals.length > 0 && (
                <div style={{ marginTop: '48px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: '#9ca3af', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Neutrals</span>
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {tokens.colors.neutrals.map((color, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #e5e7eb', background: color }} />
                        <span style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', color: '#9ca3af', marginTop: '6px', display: 'block' }}>{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
