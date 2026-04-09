import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Edit3 } from 'lucide-react';
import type { ScrapeError } from '../types';

interface ErrorCardProps {
  error: ScrapeError;
  onRetry: () => void;
  onManualEntry?: () => void;
}

const errorMessages: Record<string, { title: string; desc: string }> = {
  bot_protected: {
    title: 'Site Blocks Scanners',
    desc: 'This website has bot protection that prevents automated access. Try a different site.',
  },
  timeout: {
    title: 'Request Timed Out',
    desc: 'The site took too long to respond. It might be experiencing heavy traffic.',
  },
  invalid_url: {
    title: 'Invalid URL',
    desc: "That doesn't look like a valid URL. Please check the format and try again.",
  },
  network_error: {
    title: 'Connection Failed',
    desc: 'Could not reach this site. Please check the URL and your internet connection.',
  },
};

export default function ErrorCard({
  error,
  onRetry,
  onManualEntry,
}: ErrorCardProps) {
  const info = errorMessages[error.type] ?? errorMessages.network_error;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ maxWidth: '560px', width: '100%', margin: '0 auto' }}
    >
      <div style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '10px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
          </div>
          <div>
            <h3 style={{ color: '#ffffff', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              {info.title}
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '13px' }}>
              {info.desc}
            </p>
          </div>
        </div>

        {error.message && (
          <div style={{
            background: '#0f0f11',
            borderRadius: '6px',
            padding: '10px 12px',
            marginBottom: '16px',
          }}>
            <code style={{
              color: '#a1a1aa',
              fontSize: '12px',
              fontFamily: 'ui-monospace, monospace',
              wordBreak: 'break-all',
            }}>
              {error.message}
            </code>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.button
            id="retry-btn"
            onClick={onRetry}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#27272a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 200ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3f3f46')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#27272a')}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} />
            Try Again
          </motion.button>
          {onManualEntry && (
            <motion.button
              id="manual-entry-btn"
              onClick={onManualEntry}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #27272a',
                color: '#a1a1aa',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#27272a';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              <Edit3 style={{ width: '14px', height: '14px' }} />
              Enter Tokens Manually
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
