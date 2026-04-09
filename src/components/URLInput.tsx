import { useState } from 'react';
import { motion } from 'framer-motion';

interface URLInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function URLInput({ onSubmit, isLoading }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    onSubmit(normalizedUrl);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ maxWidth: '560px', margin: '40px auto 0', width: '100%' }}
    >
      <div
        style={{
          background: '#18181b',
          border: `1px solid ${isFocused ? '#3f3f46' : '#27272a'}`,
          borderRadius: '10px',
          padding: '6px 6px 6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          transition: 'border-color 200ms ease',
        }}
      >
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Paste a URL — try stripe.com"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '15px',
            color: '#ffffff',
            flex: 1,
            fontFamily: 'inherit',
            WebkitFontSmoothing: 'antialiased',
          }}
          disabled={isLoading}
        />
        <motion.button
          id="extract-btn"
          type="submit"
          disabled={isLoading || !url.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: '#6366f1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            opacity: isLoading || !url.trim() ? 0.5 : 1,
            transition: 'background 200ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading && url.trim()) {
              e.currentTarget.style.background = '#4f46e5';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#6366f1';
          }}
        >
          {isLoading ? 'Extracting...' : 'Extract'}
        </motion.button>
      </div>
    </motion.form>
  );
}
