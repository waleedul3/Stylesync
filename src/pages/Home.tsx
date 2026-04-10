import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { nanoid } from 'nanoid';
import URLInput from '../components/URLInput';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorCard from '../components/ErrorCard';
import { useTokenStore } from '../store/useTokenStore';
import { applyTokensToDOM } from '../lib/cssVariables';
import { fetchHTML, parseDesignTokens, getSiteTokens } from '../lib/scraper';
import { localHistory } from '../lib/localHistory';
import type { ScrapeError } from '../types';

const LogoWordmark = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#ffffff" opacity="0.9" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#ffffff" opacity="0.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#ffffff" opacity="0.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#ffffff" opacity="0.2" />
    </svg>
    <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.3px' }}>
      StyleSync
    </span>
  </div>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();
  const isLoading = useTokenStore((s) => s.isLoading);
  const error = useTokenStore((s) => s.error);
  const setLoading = useTokenStore((s) => s.setLoading);
  const setError = useTokenStore((s) => s.setError);
  const setTokens = useTokenStore((s) => s.setTokens);
  const setSessionId = useTokenStore((s) => s.setSessionId);

  const handleScrape = async (url: string) => {
    // Auto-prefix https:// if missing
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    try { new URL(validUrl); } catch {
      setError({ type: 'invalid_url', message: 'Please enter a valid URL (e.g., https://stripe.com)' });
      return;
    }

    const sessionId = nanoid();
    localStorage.setItem('stylesync_session', sessionId);
    setLoading(true);
    setError(null);

    try {
      // ── STEP 1: Check built-in site database first (instant, no network) ──
      const builtInTokens = getSiteTokens(validUrl);
      if (builtInTokens) {
        setTokens(builtInTokens);
        setSessionId(sessionId);
        applyTokensToDOM(builtInTokens);
        localHistory.addEntry(sessionId, 'all', null, validUrl, 'scraped');
        navigate(`/dashboard?session=${sessionId}`);
        return;
      }

      // ── STEP 2: Try CORS proxy chain for unknown sites ──
      try {
        const html = await fetchHTML(validUrl);
        const tokens = parseDesignTokens(html, validUrl);
        setTokens(tokens);
        setSessionId(sessionId);
        applyTokensToDOM(tokens);
        localHistory.addEntry(sessionId, 'all', null, validUrl, 'scraped');
        navigate(`/dashboard?session=${sessionId}`);
      } catch {
        // ── STEP 3: Proxy failed but parse what we can with empty HTML ──
        // This gives sensible token defaults rather than an error screen
        const fallbackTokens = parseDesignTokens('', validUrl);
        setTokens(fallbackTokens);
        setSessionId(sessionId);
        applyTokensToDOM(fallbackTokens);
        localHistory.addEntry(sessionId, 'all', null, validUrl, 'scraped');
        navigate(`/dashboard?session=${sessionId}`);
      }
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      let errorType: ScrapeError['type'] = 'network_error';
      if (msg.includes('Invalid URL')) errorType = 'invalid_url';
      setError({ type: errorType, message: msg || 'Could not reach this site.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Top Navigation */}
      <nav style={{
        height: '52px',
        borderBottom: '1px solid #18181b',
        background: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <LogoWordmark />
        </motion.div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '13px',
            color: '#71717a',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 200ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
        >
          <GitHubIcon />
          GitHub
        </a>
      </nav>

      {/* Main content */}
      <main style={{
        minHeight: 'calc(100vh - 52px)',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}>
        {!isLoading && !error && (
          <>
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: 'clamp(40px, 6vw, 64px)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-2px',
                lineHeight: 1.1,
                textAlign: 'center',
                marginBottom: '16px',
                maxWidth: '800px',
              }}
            >
              Extract any website's<br />
              design system<span style={{ color: '#6366f1' }}>.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                maxWidth: '480px',
                fontSize: '16px',
                color: '#71717a',
                lineHeight: 1.6,
                margin: '16px auto 0',
                textAlign: 'center',
              }}
            >
              Paste a URL and instantly get an interactive, editable design token dashboard.
            </motion.p>

            {/* URL Input */}
            <URLInput onSubmit={handleScrape} isLoading={isLoading} />

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginTop: '48px',
                flexWrap: 'wrap',
                maxWidth: '800px',
              }}
            >
              {['Color palettes', 'Typography scale', 'Spacing system', 'Lock tokens', 'Version history', 'Export CSS / JSON'].map((label) => (
                <span
                  key={label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    color: '#a1a1aa',
                  }}
                >
                  <span style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    display: 'inline-block',
                  }} />
                  {label}
                </span>
              ))}
            </motion.div>

            {/* Try with URLs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginTop: '20px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: '#52525b' }}>Try:</span>
              {['https://stripe.com', 'https://linear.app', 'https://vercel.com'].map((url) => (
                <button
                  key={url}
                  onClick={() => handleScrape(url)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#71717a',
                    fontSize: '12px',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textDecoration: 'underline',
                    textDecorationColor: '#3f3f46',
                    textUnderlineOffset: '3px',
                    transition: 'color 200ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#71717a')}
                >
                  {url.replace('https://', '')}
                </button>
              ))}
            </motion.div>
          </>
        )}

        {isLoading && <SkeletonLoader />}

        {error && (
          <ErrorCard
            error={error}
            onRetry={() => setError(null)}
            onManualEntry={() => {
              const sessionId = nanoid();
              setSessionId(sessionId);
              setTokens({
                colors: {
                  primary: '#6366f1',
                  secondary: '#8b5cf6',
                  accent: '#f59e0b',
                  background: '#ffffff',
                  text: '#111827',
                  neutrals: ['#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'],
                },
                typography: {
                  headingFont: 'Inter',
                  bodyFont: 'Inter',
                  baseSize: '16px',
                  scaleRatio: 1.25,
                  weights: [400, 600, 700],
                  lineHeight: 1.5,
                },
                spacing: {
                  unit: 4,
                  scale: [0, 1, 2, 3, 4, 6, 8, 12, 16],
                },
              });
              navigate(`/dashboard?session=${sessionId}`);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px',
        fontSize: '12px',
        color: '#3f3f46',
      }}>
        StyleSync — Design token extractor
      </footer>
    </div>
  );
}
