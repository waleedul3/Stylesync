import { useTokenStore } from '../../store/useTokenStore';
import { ExternalLink, Monitor } from 'lucide-react';

interface Props {
  siteUrl: string | null;
}

// Darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function isLight(hex: string): boolean {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

export default function SitePreview({ siteUrl }: Props) {
  const tokens = useTokenStore((s) => s.tokens);

  if (!tokens) return null;

  const { primary, secondary, accent, background, text, neutrals } = tokens.colors;
  const { headingFont, bodyFont } = tokens.typography;
  const bodyColor = isLight(background) ? text : (isLight(text) ? text : '#ffffff');
  const navBg = isLight(background) ? adjustColor(background, -8) : adjustColor(background, +15);
  const cardBg = isLight(background) ? '#ffffff' : adjustColor(background, +10);
  const mutedText = isLight(background) ? adjustColor(text, +80) : adjustColor(text, -80);
  const siteName = siteUrl ? new URL(siteUrl).hostname.replace('www.', '') : 'mysite.com';
  const border = `1px solid ${isLight(background) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`;

  const h1Style: React.CSSProperties = { fontFamily: `'${headingFont}', sans-serif`, color: bodyColor, fontWeight: 800, margin: 0 };
  const pStyle: React.CSSProperties = { fontFamily: `'${bodyFont}', sans-serif`, color: mutedText, margin: 0, lineHeight: 1.6 };
  const btnPrimary: React.CSSProperties = {
    background: primary, color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 22px', fontWeight: 600, cursor: 'pointer',
    fontFamily: `'${bodyFont}', sans-serif`, fontSize: 14,
  };
  const btnSecondary: React.CSSProperties = {
    background: 'transparent', color: primary, border: `1.5px solid ${primary}`,
    borderRadius: 8, padding: '10px 22px', fontWeight: 600, cursor: 'pointer',
    fontFamily: `'${bodyFont}', sans-serif`, fontSize: 14,
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>

      {/* ── Browser chrome ── */}
      <div style={{ background: '#1e1e2e', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Dot color="#ff5f57" /><Dot color="#febc2e" /><Dot color="#28c840" />
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 5, padding: '4px 10px', fontSize: 12, color: '#9ca3af', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {siteUrl ?? 'https://example.com'}
        </div>
        <Monitor size={13} color="#6b7280" />
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" title="Open real site" style={{ color: '#6b7280', display: 'flex' }}>
            <ExternalLink size={13} />
          </a>
        )}
      </div>

      {/* ── Live mockup ── */}
      <div style={{ flex: 1, background, overflowY: 'auto', transition: 'background 200ms ease' }}>

        {/* NAV */}
        <nav style={{ background: navBg, borderBottom: border, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.8)' }} />
            </div>
            <span style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 700, color: bodyColor, fontSize: 15 }}>{siteName}</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Product', 'Pricing', 'Docs', 'Blog'].map(l => (
              <span key={l} style={{ ...pStyle, fontSize: 14, color: mutedText, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ ...pStyle, fontSize: 14, cursor: 'pointer' }}>Log in</span>
            <button style={{ ...btnPrimary, padding: '7px 16px', fontSize: 13 }}>Sign up</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding: '72px 32px 64px', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 99, padding: '4px 14px', marginBottom: 24 }}>
            <Dot color={accent} size={6} />
            <span style={{ fontSize: 13, color: accent, fontFamily: `'${bodyFont}', sans-serif`, fontWeight: 500 }}>New — Now in public beta</span>
          </div>

          <h1 style={{ ...h1Style, fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-1.5px' }}>
            The design system<br />
            <span style={{ color: primary }}>built for your brand</span>
          </h1>
          <p style={{ ...pStyle, fontSize: 18, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Extract, edit, and export design tokens from any website. Real-time preview as you customize colors, typography, and spacing.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={btnPrimary}>Get started free →</button>
            <button style={btnSecondary}>View demo</button>
          </div>

          {/* Hero visual */}
          <div style={{ marginTop: 56, background: cardBg, border, borderRadius: 16, padding: 24, boxShadow: `0 20px 60px ${primary}20` }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ height: 10, borderRadius: 5, background: primary, width: '45%' }} />
              <div style={{ height: 10, borderRadius: 5, background: `${secondary}60`, width: '30%' }} />
              <div style={{ height: 10, borderRadius: 5, background: `${accent}60`, width: '15%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ height: 8, borderRadius: 4, background: `${text}15`, width: '70%' }} />
              <div style={{ height: 8, borderRadius: 4, background: `${text}10`, width: '20%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ height: 8, borderRadius: 4, background: `${text}10`, width: '55%' }} />
              <div style={{ height: 8, borderRadius: 4, background: `${text}08`, width: '35%' }} />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section style={{ padding: '0 32px 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ ...h1Style, fontSize: 32, marginBottom: 12 }}>Everything you need</h2>
            <p style={{ ...pStyle, fontSize: 16 }}>Powerful tools to extract and customize design tokens</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: '🎨', title: 'Color extraction', desc: 'Automatically extract brand colors', color: primary },
              { icon: '✏️', title: 'Live editor', desc: 'Edit tokens and preview in real-time', color: secondary },
              { icon: '⚡', title: 'Instant export', desc: 'CSS variables, JSON, or Tailwind config', color: accent },
            ].map(f => (
              <div key={f.title} style={{ background: cardBg, border, borderRadius: 14, padding: 20, transition: 'all 200ms ease' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 20 }}>
                  {f.icon}
                </div>
                <div style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 700, color: bodyColor, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
                <div style={{ ...pStyle, fontSize: 13 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: '0 32px 64px', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ background: `${primary}08`, border: `1px solid ${primary}20`, borderRadius: 16, padding: '32px 32px', textAlign: 'center' }}>
            <p style={{ ...h1Style, fontSize: 22, fontWeight: 600, fontStyle: 'italic', marginBottom: 16, color: bodyColor }}>
              "StyleSync cut our design handoff time in half. The real-time color preview is incredible."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: primary }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 700, color: bodyColor, fontSize: 14 }}>Sarah Chen</div>
                <div style={{ ...pStyle, fontSize: 12 }}>Lead Designer at Acme Corp</div>
              </div>
            </div>
          </div>
        </section>

        {/* COLOR SWATCH STRIP */}
        <section style={{ padding: '0 32px 64px', maxWidth: 900, margin: '0 auto' }}>
          <h3 style={{ ...h1Style, fontSize: 20, marginBottom: 20 }}>Your color palette</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Primary', color: primary },
              { label: 'Secondary', color: secondary },
              { label: 'Accent', color: accent },
              { label: 'Background', color: background },
              { label: 'Text', color: text },
              ...neutrals.map((c, i) => ({ label: `Neutral ${i + 1}`, color: c })),
            ].map(({ label, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: color, border, marginBottom: 6 }} />
                <div style={{ ...pStyle, fontSize: 11 }}>{label}</div>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: mutedText }}>{color}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: primary, padding: '48px 32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: `'${headingFont}', sans-serif`, color: '#ffffff', fontWeight: 800, fontSize: 32, marginBottom: 12 }}>
            Ready to sync your design?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, marginBottom: 28, fontFamily: `'${bodyFont}', sans-serif` }}>
            Start extracting design tokens from any website for free.
          </p>
          <button style={{ background: '#ffffff', color: primary, border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: `'${bodyFont}', sans-serif` }}>
            Get started — it's free
          </button>
        </section>

        {/* FOOTER */}
        <footer style={{ background: navBg, borderTop: border, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: 700, color: bodyColor, fontSize: 14 }}>{siteName}</span>
          <span style={{ ...pStyle, fontSize: 13 }}>Design tokens extracted by StyleSync</span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} style={{ ...pStyle, fontSize: 13, cursor: 'pointer', color: primary }}>{l}</span>
            ))}
          </div>
        </footer>

      </div>
    </div>
  );
}
