import { motion } from 'framer-motion';

export default function SkeletonLoader() {
  const shimmerStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #18181b, #27272a, #18181b)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 2s infinite',
    borderRadius: '6px',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr)',
        gap: '32px',
        padding: '32px',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 400% 0; }
          50% { background-position: 0 0; }
          100% { background-position: -400% 0; }
        }
      `}</style>

      {/* Skeleton content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Title skeleton */}
        <div style={{ ...shimmerStyle, height: '32px', width: '60%' }} />

        {/* Rows skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ ...shimmerStyle, width: '36px', height: '36px', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ ...shimmerStyle, height: '12px', width: '80px' }} />
                <div style={{ ...shimmerStyle, height: '12px', width: '60px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading text */}
      <div style={{ textAlign: 'center' }}>
        <motion.p
          style={{
            color: '#71717a',
            fontSize: '14px',
            fontWeight: 500,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Analyzing DOM structure
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.p>
      </div>
    </motion.div>
  );
}
