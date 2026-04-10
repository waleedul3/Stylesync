import { motion } from 'framer-motion';
import { useTokenStore } from '../../store/useTokenStore';

export function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: '#9ca3af', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  );
}

export default function ButtonSet() {
  const tokens = useTokenStore((s) => s.tokens);
  const primary = tokens?.colors.primary ?? '#6366f1';
  const accent = tokens?.colors.accent ?? '#f59e0b';
  const text = tokens?.colors.text ?? '#111827';

  const btnBase: React.CSSProperties = {
    borderRadius: '6px', fontSize: '14px', fontWeight: 500,
    padding: '8px 16px', cursor: 'pointer',
    transition: 'all 150ms ease', border: 'none',
    display: 'inline-flex', alignItems: 'center',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <SectionHeader label="Buttons" />
      <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '12px' }}>
        Button variants
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button
          style={{ ...btnBase, backgroundColor: primary, color: '#ffffff' }}
          onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.9)')}
          onMouseOut={e => (e.currentTarget.style.filter = '')}
        >Primary</button>

        <button
          style={{ ...btnBase, background: 'transparent', color: primary, border: `1.5px solid ${primary}` }}
        >Secondary</button>

        <button
          style={{ ...btnBase, background: 'transparent', color: text, border: '1.5px solid rgba(0,0,0,0.15)' }}
        >Ghost</button>

        <button
          style={{ ...btnBase, backgroundColor: accent, color: '#ffffff' }}
          onMouseOver={e => (e.currentTarget.style.filter = 'brightness(0.9)')}
          onMouseOut={e => (e.currentTarget.style.filter = '')}
        >Accent</button>
      </div>
    </motion.div>
  );
}
