import { motion } from 'framer-motion';
import { SectionHeader } from './ButtonSet';

const cardBase: React.CSSProperties = {
  padding: '20px',
  borderRadius: '10px',
  flex: '1',
};

const cardTitle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--color-text)',
  fontFamily: 'var(--font-heading)',
  marginBottom: '6px',
};

const cardBody: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: 1.6,
  fontFamily: 'var(--font-body)',
};

const cardFooter: React.CSSProperties = {
  marginTop: '16px',
};

const ghostBtn: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-text)',
  background: 'transparent',
  border: '1.5px solid rgba(0,0,0,0.15)',
  borderRadius: '6px',
  padding: '6px 12px',
  cursor: 'pointer',
  transition: 'all 150ms ease',
};

const secondaryBtn: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--color-primary)',
  background: 'transparent',
  border: '1.5px solid var(--color-primary)',
  borderRadius: '6px',
  padding: '6px 12px',
  cursor: 'pointer',
  transition: 'all 150ms ease',
};

const primaryBtn: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#ffffff',
  background: 'var(--color-primary)',
  border: 'none',
  borderRadius: '6px',
  padding: '6px 12px',
  cursor: 'pointer',
  transition: 'all 150ms ease',
};

export default function CardSet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <SectionHeader label="Cards" />

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Card A — Minimal */}
        <div style={{
          ...cardBase,
          background: '#ffffff',
          border: '1px solid #e5e7eb',
        }}>
          <div style={cardTitle}>Minimal Card</div>
          <div style={cardBody}>
            Clean design with subtle border. Perfect for content-focused layouts and data display.
          </div>
          <div style={cardFooter}>
            <button
              style={ghostBtn}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Learn more →
            </button>
          </div>
        </div>

        {/* Card B — Elevated */}
        <div style={{
          ...cardBase,
          background: '#ffffff',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={cardTitle}>Elevated Card</div>
          <div style={cardBody}>
            Subtle shadow creates depth. Great for dashboards and interactive content areas.
          </div>
          <div style={cardFooter}>
            <button
              style={secondaryBtn}
              onMouseOver={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 8%, transparent)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              View details
            </button>
          </div>
        </div>

        {/* Card C — Branded */}
        <div style={{
          ...cardBase,
          background: 'color-mix(in srgb, var(--color-primary) 6%, white)',
          border: '1.5px solid var(--color-primary)',
          borderTop: '3px solid var(--color-primary)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ ...cardTitle, color: 'var(--color-primary)' }}>Branded Card</div>
          <div style={cardBody}>
            Uses brand colors for emphasis. Ideal for featured content, CTAs, or pricing plans.
          </div>
          <div style={cardFooter}>
            <button
              style={primaryBtn}
              onMouseOver={e => { e.currentTarget.style.filter = 'brightness(0.9)'; }}
              onMouseOut={e => { e.currentTarget.style.filter = ''; }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
