import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useTokenStore } from '../store/useTokenStore';
import { useTokenListener } from '../hooks/useTokenListener';
import { firestoreService } from '../lib/firestoreService';
import ColorPicker from '../components/TokenEditor/ColorPicker';
import TypographyInspector from '../components/TokenEditor/TypographyInspector';
import SpacingVisualizer from '../components/TokenEditor/SpacingVisualizer';
import VersionHistory from '../components/VersionHistory';
import ExportPanel from '../components/ExportPanel';
import ButtonSet from '../components/PreviewGrid/ButtonSet';
import InputSet from '../components/PreviewGrid/InputSet';
import CardSet from '../components/PreviewGrid/CardSet';
import TypeScale from '../components/PreviewGrid/TypeScale';

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const tokens = useTokenStore((s) => s.tokens);
  const setTokens = useTokenStore((s) => s.setTokens);
  const setSessionId = useTokenStore((s) => s.setSessionId);
  const setTokenDocId = useTokenStore((s) => s.setTokenDocId);
  const setLockedPaths = useTokenStore((s) => s.setLockedPaths);
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'spacing'>('colors');

  useTokenListener(sessionId);

  useEffect(() => {
    if (!sessionId) { navigate('/'); return; }
    setSessionId(sessionId);
    if (!tokens) {
      firestoreService.getTokens(sessionId)
        .then((data) => {
          if (data) {
            setTokenDocId(data.id);
            setTokens({ colors: data.colors, typography: data.typography, spacing: data.spacing });
          }
        })
        .catch((err) => console.warn('Firestore getTokens failed:', err));
    }
    firestoreService.getLockedPaths(sessionId)
      .then(setLockedPaths)
      .catch((err) => console.warn('Firestore getLockedPaths failed:', err));
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

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f11', display: 'flex', flexDirection: 'column' }}>
      {/* ── TOP BAR ── */}
      <header style={{
        height: '52px',
        background: '#0f0f11',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>
        {/* Left: Logo */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
        >
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 12h6M9 15h4" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
            Style<span style={{ color: '#6366f1' }}>Sync</span>
          </span>
        </button>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="rescrape-btn"
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: '#9ca3af',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <RefreshCw size={13} />
            Re-scrape
          </button>
          <ExportPanel />
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <aside style={{
          width: '320px',
          flexShrink: 0,
          background: '#0f0f11',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Flat tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}>
            {(['colors', 'typography', 'spacing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                style={{
                  flex: 1,
                  padding: '12px 8px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeSection === tab ? '2px solid var(--color-primary, #6366f1)' : '2px solid transparent',
                  color: activeSection === tab ? '#ffffff' : '#6b7280',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 150ms ease',
                  textTransform: 'capitalize',
                  marginBottom: '-1px',
                }}
                onMouseOver={e => { if (activeSection !== tab) e.currentTarget.style.color = '#9ca3af'; }}
                onMouseOut={e => { if (activeSection !== tab) e.currentTarget.style.color = '#6b7280'; }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, padding: '0 16px 16px', overflowY: 'auto' }}>
            {activeSection === 'colors' && <ColorPicker />}
            {activeSection === 'typography' && <TypographyInspector />}
            {activeSection === 'spacing' && <SpacingVisualizer />}

            {/* Version History */}
            <div style={{ marginTop: '24px' }}>
              <VersionHistory />
            </div>
          </div>
        </aside>

        {/* ── RIGHT PANEL ── */}
        <main style={{
          flex: 1,
          background: '#f8f9fa',
          overflowY: 'auto',
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '32px',
          }}>
            {/* Buttons */}
            <ButtonSet />

            <div style={{ height: '48px' }} />

            {/* Inputs */}
            <InputSet />

            <div style={{ height: '48px' }} />

            {/* Cards */}
            <CardSet />

            <div style={{ height: '48px' }} />

            {/* Type Scale */}
            <TypeScale />

            {/* Neutrals */}
            {tokens.colors.neutrals && tokens.colors.neutrals.length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: '#9ca3af', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Neutrals
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {tokens.colors.neutrals.map((color, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        background: color,
                      }} />
                      <span style={{ fontSize: '11px', fontFamily: 'ui-monospace, monospace', color: '#9ca3af', marginTop: '6px', display: 'block' }}>
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
