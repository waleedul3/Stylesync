import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileCode, FileJson, Palette, Check, ChevronDown } from 'lucide-react';
import { useTokenStore } from '../store/useTokenStore';
import { exportAsCSS, exportAsJSON, exportAsTailwind, downloadFile } from '../lib/exporter';

export default function ExportPanel() {
  const tokens = useTokenStore((s) => s.tokens);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!tokens) return null;

  const handleCopyCSS = () => {
    const css = exportAsCSS(tokens);
    navigator.clipboard.writeText(css);
    setCopied('css');
    setTimeout(() => setCopied(null), 2000);
    setIsOpen(false);
  };

  const handleDownloadJSON = () => {
    const json = exportAsJSON(tokens);
    downloadFile(json, 'design-tokens.json', 'application/json');
    setIsOpen(false);
  };

  const handleDownloadTailwind = () => {
    const tw = exportAsTailwind(tokens);
    downloadFile(tw, 'tailwind.config.js', 'application/javascript');
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <motion.button
        id="export-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          background: '#6366f1',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background 200ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#4f46e5')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#6366f1')}
      >
        <Download style={{ width: '14px', height: '14px' }} />
        Export Tokens
        <ChevronDown style={{
          width: '12px',
          height: '12px',
          transition: 'transform 200ms ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '200px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              zIndex: 50,
            }}
          >
            <button
              id="export-css-btn"
              onClick={handleCopyCSS}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#a1a1aa',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#27272a';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              {copied === 'css' ? (
                <Check style={{ width: '14px', height: '14px', color: '#22c55e' }} />
              ) : (
                <FileCode style={{ width: '14px', height: '14px', color: '#6366f1' }} />
              )}
              {copied === 'css' ? 'Copied!' : 'Copy CSS'}
            </button>
            <button
              id="export-json-btn"
              onClick={handleDownloadJSON}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#a1a1aa',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                borderTop: '1px solid #27272a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#27272a';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              <FileJson style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
              Download JSON
            </button>
            <button
              id="export-tailwind-btn"
              onClick={handleDownloadTailwind}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#a1a1aa',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                borderTop: '1px solid #27272a',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#27272a';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              <Palette style={{ width: '14px', height: '14px', color: '#06b6d4' }} />
              Download Tailwind
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
