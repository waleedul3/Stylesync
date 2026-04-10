import { motion } from 'framer-motion';
import { useTokenStore } from '../../store/useTokenStore';
import { SectionHeader } from './ButtonSet';

export default function CardSet() {
  const tokens = useTokenStore((s) => s.tokens);
  const primary = tokens?.colors.primary ?? '#6366f1';
  const text = tokens?.colors.text ?? '#111827';
  const headingFont = tokens?.typography.headingFont ?? 'Inter';
  const bodyFont = tokens?.typography.bodyFont ?? 'Inter';

  const cardTitle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: text,
    fontFamily: `'${headingFont}', sans-serif`,
    marginBottom: '6px',
  };

  const cardBody: React.CSSProperties = {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.6,
    fontFamily: `'${bodyFont}', sans-serif`,
  };

  const ghostBtn: React.CSSProperties = {
    fontSize: '13px', fontWeight: 500,
    color: text,
    background: 'transparent',
    border: `1.5px solid rgba(0,0,0,0.15)`,
    borderRadius: '6px', padding: '6px 12px',
    cursor: 'pointer', transition: 'all 150ms ease',
  };

  const secondaryBtn: React.CSSProperties = {
    fontSize: '13px', fontWeight: 500,
    color: primary,
    background: 'transparent',
    border: `1.5px solid ${primary}`,
    borderRadius: '6px', padding: '6px 12px',
    cursor: 'pointer', transition: 'all 150ms ease',
  };

  const primaryBtn: React.CSSProperties = {
    fontSize: '13px', fontWeight: 500,
    color: '#ffffff',
    background: primary,
    border: 'none',
    borderRadius: '6px', padding: '6px 12px',
    cursor: 'pointer', transition: 'all 150ms ease',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <SectionHeader label="Cards" />
      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Card A — Minimal */}
        <div style={{ padding: '20px', borderRadius: '10px', flex: 1, background: '#ffffff', border: '1px solid #e5e7eb' }}>
          <div style={cardTitle}>Minimal Card</div>
          <div style={cardBody}>Clean design with subtle border. Perfect for content-focused layouts and data display.</div>
          <div style={{ marginTop: '16px' }}>
            <button style={ghostBtn} onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
              Learn more →
            </button>
          </div>
        </div>

        {/* Card B — Elevated */}
        <div style={{ padding: '20px', borderRadius: '10px', flex: 1, background: '#ffffff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)' }}>
          <div style={cardTitle}>Elevated Card</div>
          <div style={cardBody}>Subtle shadow creates depth. Great for dashboards and interactive content areas.</div>
          <div style={{ marginTop: '16px' }}>
            <button style={secondaryBtn}>View details</button>
          </div>
        </div>

        {/* Card C — Branded */}
        <div style={{ padding: '20px', borderRadius: '10px', flex: 1, background: `${primary}10`, border: `1.5px solid ${primary}`, borderTop: `3px solid ${primary}` }}>
          <div style={{ ...cardTitle, color: primary }}>Branded Card</div>
          <div style={cardBody}>Uses brand colors for emphasis. Ideal for featured content, CTAs, or pricing plans.</div>
          <div style={{ marginTop: '16px' }}>
            <button style={primaryBtn} onMouseOver={e => { e.currentTarget.style.filter = 'brightness(0.9)'; }} onMouseOut={e => { e.currentTarget.style.filter = ''; }}>
              Get started
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
