import { motion } from 'framer-motion';
import { SectionHeader } from './ButtonSet';

const typeRows = [
  { label: 'H1',   size: '40px', weight: 700, font: 'var(--font-heading)', isHeading: true },
  { label: 'H2',   size: '32px', weight: 700, font: 'var(--font-heading)', isHeading: true },
  { label: 'H3',   size: '24px', weight: 600, font: 'var(--font-heading)', isHeading: true },
  { label: 'H4',   size: '20px', weight: 600, font: 'var(--font-heading)', isHeading: true },
  { label: 'H5',   size: '16px', weight: 600, font: 'var(--font-heading)', isHeading: true },
  { label: 'H6',   size: '14px', weight: 600, font: 'var(--font-heading)', isHeading: true },
  { label: 'Body', size: '16px', weight: 400, font: 'var(--font-body)',    isHeading: false },
  { label: 'Sm',   size: '14px', weight: 400, font: 'var(--font-body)',    isHeading: false },
  { label: 'Xs',   size: '12px', weight: 400, font: 'var(--font-body)',    isHeading: false },
];

export default function TypeScale() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <SectionHeader label="Type Scale" />

      <div>
        {typeRows.map((row, i) => (
          <div key={row.label}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              padding: '10px 0',
            }}>
              {/* Label column */}
              <div style={{
                width: '52px',
                flexShrink: 0,
                fontFamily: 'ui-monospace, monospace',
                fontSize: '11px',
                color: '#9ca3af',
                fontWeight: 400,
              }}>
                {row.label}
              </div>

              {/* Specimen text */}
              <div style={{
                flex: 1,
                fontSize: row.size,
                fontWeight: row.weight,
                fontFamily: row.font,
                color: 'var(--color-text)',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                The quick brown fox
              </div>

              {/* Size/weight label */}
              <div style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '11px',
                color: '#9ca3af',
                flexShrink: 0,
                marginLeft: '12px',
                whiteSpace: 'nowrap',
              }}>
                {row.size} / {row.weight}
              </div>
            </div>
            {i < typeRows.length - 1 && (
              <div style={{ height: '1px', background: '#f3f4f6' }} />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
