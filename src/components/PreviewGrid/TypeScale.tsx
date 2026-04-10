import { motion } from 'framer-motion';
import { SectionHeader } from './ButtonSet';
import { useTokenStore } from '../../store/useTokenStore';

export default function TypeScale() {
  const tokens = useTokenStore((s) => s.tokens);
  const headingFont = tokens?.typography.headingFont ?? 'Inter';
  const bodyFont = tokens?.typography.bodyFont ?? 'Inter';
  const text = tokens?.colors.text ?? '#111827';

  const typeRows = [
    { label: 'H1', size: '40px', weight: 700, font: `'${headingFont}', sans-serif` },
    { label: 'H2', size: '32px', weight: 700, font: `'${headingFont}', sans-serif` },
    { label: 'H3', size: '24px', weight: 600, font: `'${headingFont}', sans-serif` },
    { label: 'H4', size: '20px', weight: 600, font: `'${headingFont}', sans-serif` },
    { label: 'H5', size: '16px', weight: 600, font: `'${headingFont}', sans-serif` },
    { label: 'H6', size: '14px', weight: 600, font: `'${headingFont}', sans-serif` },
    { label: 'Body', size: '16px', weight: 400, font: `'${bodyFont}', sans-serif` },
    { label: 'Sm', size: '14px', weight: 400, font: `'${bodyFont}', sans-serif` },
    { label: 'Xs', size: '12px', weight: 400, font: `'${bodyFont}', sans-serif` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <SectionHeader label="Type Scale" />
      <div>
        {typeRows.map((row, i) => (
          <div key={row.label}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
              <div style={{ width: '52px', flexShrink: 0, fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: '#9ca3af' }}>
                {row.label}
              </div>
              <div style={{ flex: 1, fontSize: row.size, fontWeight: row.weight, fontFamily: row.font, color: text, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                The quick brown fox
              </div>
              <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px', color: '#9ca3af', flexShrink: 0, marginLeft: '12px', whiteSpace: 'nowrap' }}>
                {row.size} / {row.weight}
              </div>
            </div>
            {i < typeRows.length - 1 && <div style={{ height: '1px', background: '#f3f4f6' }} />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
