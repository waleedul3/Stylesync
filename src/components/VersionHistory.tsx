import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, RotateCcw, Clock } from 'lucide-react';
import { localHistory } from '../lib/localHistory';
import { useTokenStore } from '../store/useTokenStore';
import type { VersionEntry } from '../types';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const changeTypeColors: Record<string, string> = {
  scraped: '#22c55e',
  user_edit: '#3b82f6',
  locked: '#f59e0b',
  unlocked: '#9ca3af',
};

const changeTypeBadges: Record<string, { bg: string; text: string }> = {
  scraped: { bg: '#0f5f2f', text: '#22c55e' },
  user_edit: { bg: '#0c3d91', text: '#3b82f6' },
  locked: { bg: '#7c2d12', text: '#f59e0b' },
  unlocked: { bg: '#3f3f46', text: '#9ca3af' },
};

export default function VersionHistory() {
  const sessionId = useTokenStore((s) => s.sessionId);
  const tokens = useTokenStore((s) => s.tokens);
  const updateColor = useTokenStore((s) => s.updateColor);
  const updateTypography = useTokenStore((s) => s.updateTypography);
  const updateSpacing = useTokenStore((s) => s.updateSpacing);
  const [entries, setEntries] = useState<VersionEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadHistory = useCallback(() => {
    if (!sessionId) return;
    setEntries(localHistory.getAll(sessionId));
  }, [sessionId]);

  // Load on open, and refresh every 2s when open (picks up new edits)
  useEffect(() => {
    if (!isOpen) return;
    loadHistory();
    const id = setInterval(loadHistory, 2000);
    return () => clearInterval(id);
  }, [isOpen, loadHistory]);

  const handleRestore = (entry: VersionEntry) => {
    if (!entry.previousValue || entry.changeType !== 'user_edit') return;
    const [section, key] = entry.tokenPath.split('.');
    if (section === 'colors') updateColor(key, entry.previousValue);
    else if (section === 'typography') updateTypography(key, entry.previousValue);
    else if (section === 'spacing') updateSpacing(key, Number(entry.previousValue));
    // Immediately refresh list
    setTimeout(loadHistory, 100);
  };

  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
      <button
        id="version-history-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History style={{ width: '14px', height: '14px', color: '#6b7280' }} />
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#9ca3af',
            transition: 'color 200ms ease',
          }}>
            Version History
          </span>
          {entries.length > 0 && (
            <span style={{
              padding: '2px 6px',
              fontSize: '10px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '4px',
              color: '#6b7280',
            }}>
              {entries.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp style={{ width: '14px', height: '14px', color: '#6b7280' }} />
        ) : (
          <ChevronDown style={{ width: '14px', height: '14px', color: '#6b7280' }} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '320px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}>
              {entries.length === 0 ? (
                <p style={{
                  color: '#52525b',
                  fontSize: '12px',
                  textAlign: 'center',
                  padding: '16px',
                }}>
                  No history yet — start editing tokens above
                </p>
              ) : (
                entries.map((entry, i) => {
                  const badge = changeTypeBadges[entry.changeType] ?? changeTypeBadges.user_edit;
                  const color = changeTypeColors[entry.changeType] ?? '#9ca3af';
                  let dateObj: Date;
                  try {
                    dateObj = entry.changedAt?.toDate ? entry.changedAt.toDate() : new Date();
                  } catch {
                    dateObj = new Date();
                  }
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        position: 'relative',
                        paddingLeft: '16px',
                        paddingTop: '8px',
                        paddingBottom: '8px',
                        paddingRight: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        borderRadius: '6px',
                        transition: 'background 200ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Timeline line */}
                      <div style={{
                        position: 'absolute',
                        left: '4px',
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        background: 'rgba(255,255,255,0.05)',
                      }} />
                      <div style={{
                        position: 'absolute',
                        left: '-2px',
                        top: '12px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: '2px solid ' + color,
                        background: '#0f0f11',
                      }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontFamily: 'ui-monospace, monospace',
                            color: '#e5e7eb',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {entry.tokenPath}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            fontSize: '9px',
                            borderRadius: '4px',
                            fontWeight: 500,
                            background: badge.bg,
                            color: badge.text,
                            whiteSpace: 'nowrap',
                          }}>
                            {entry.changeType}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          {entry.previousValue && (
                            <>
                              <span style={{
                                fontSize: '10px',
                                color: '#52525b',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60px',
                              }}>
                                {entry.previousValue}
                              </span>
                              <span style={{ fontSize: '10px', color: '#52525b' }}>→</span>
                            </>
                          )}
                          <span style={{
                            fontSize: '10px',
                            color: color,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '60px',
                          }}>
                            {entry.newValue}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock style={{ width: '10px', height: '10px', color: '#52525b' }} />
                          <span style={{ fontSize: '10px', color: '#52525b' }}>
                            {timeAgo(dateObj)}
                          </span>
                        </div>
                      </div>

                      {entry.previousValue && entry.changeType === 'user_edit' && (
                        <button
                          onClick={() => handleRestore(entry)}
                          style={{
                            opacity: 0,
                            padding: '4px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'opacity 200ms ease',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.color = '#6366f1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0';
                            e.currentTarget.style.color = '#6b7280';
                          }}
                          title="Restore previous value"
                        >
                          <RotateCcw style={{ width: '12px', height: '12px' }} />
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
