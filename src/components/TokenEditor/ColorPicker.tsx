import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';
import { Lock, LockKeyhole } from 'lucide-react';
import { useTokenStore } from '../../store/useTokenStore';
import { firestoreService } from '../../lib/firestoreService';

const COLOR_KEYS = ['primary', 'secondary', 'accent', 'background', 'text'] as const;

const colorLabels: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  background: 'Background',
  text: 'Text',
};

export default function ColorPicker() {
  const tokens = useTokenStore((s) => s.tokens);
  const updateColor = useTokenStore((s) => s.updateColor);
  const lockedPaths = useTokenStore((s) => s.lockedPaths);
  const addLockedPath = useTokenStore((s) => s.addLockedPath);
  const removeLockedPath = useTokenStore((s) => s.removeLockedPath);
  const sessionId = useTokenStore((s) => s.sessionId);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  if (!tokens) return null;

  const handleLockToggle = async (key: string) => {
    const path = `colors.${key}`;
    if (!sessionId) return;
    if (lockedPaths.includes(path)) {
      removeLockedPath(path);
      await firestoreService.unlockToken(sessionId, path).catch(() => {});
    } else {
      const value = (tokens.colors as any)[key] as string;
      addLockedPath(path);
      await firestoreService.lockToken(sessionId, path, value).catch(() => {});
    }
  };

  return (
    <div>
      {/* Section header */}
      <div style={{ padding: '16px 0 8px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          color: '#6b7280',
          textTransform: 'uppercase',
        }}>
          Color Tokens
        </span>
      </div>

      <div>
        {COLOR_KEYS.map((key, idx) => {
          const path = `colors.${key}`;
          const isLocked = lockedPaths.includes(path);
          const value = (tokens.colors as any)[key] as string;
          const isActive = activeKey === key;

          return (
            <div key={key}>
              {/* Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background 120ms ease',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {/* Color swatch */}
                <button
                  onClick={() => !isLocked && setActiveKey(isActive ? null : key)}
                  disabled={isLocked}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: value,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    flexShrink: 0,
                    outline: isActive ? '2px solid rgba(255,255,255,0.3)' : 'none',
                    outlineOffset: '2px',
                    transition: 'outline 150ms ease',
                  }}
                />

                {/* Token info */}
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => !isLocked && setActiveKey(isActive ? null : key)}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#e5e7eb', lineHeight: 1.3 }}>
                    {colorLabels[key]}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'ui-monospace, monospace', marginTop: '2px' }}>
                    {value || '—'}
                  </div>
                </div>

                {/* Lock button */}
                <button
                  onClick={e => { e.stopPropagation(); handleLockToggle(key); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: isLocked ? '#f59e0b' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 150ms ease',
                    flexShrink: 0,
                  }}
                  onMouseOver={e => { if (!isLocked) e.currentTarget.style.color = '#e5e7eb'; }}
                  onMouseOut={e => { if (!isLocked) e.currentTarget.style.color = '#6b7280'; }}
                >
                  {isLocked
                    ? <LockKeyhole width={16} height={16} />
                    : <Lock width={16} height={16} />
                  }
                </button>
              </div>

              {/* Inline color picker */}
              <AnimatePresence>
                {isActive && !isLocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: 'hidden', marginBottom: '4px' }}
                  >
                    <div style={{ paddingBottom: '12px', paddingTop: '4px' }}>
                      <HexColorPicker
                        color={value}
                        onChange={(c) => updateColor(key, c)}
                        style={{ width: '100%' }}
                      />
                      {/* Hex text input */}
                      <input
                        type="text"
                        value={value}
                        onChange={e => {
                          const v = e.target.value;
                          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateColor(key, v);
                        }}
                        style={{
                          marginTop: '10px',
                          width: '100%',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontFamily: 'ui-monospace, monospace',
                          color: '#e5e7eb',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Row divider */}
              {idx < COLOR_KEYS.length - 1 && (
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
