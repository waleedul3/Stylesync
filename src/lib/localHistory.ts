import type { VersionEntry } from '../types';

const MAX_ENTRIES = 50;

function storageKey(sessionId: string) {
  return `stylesync_history_${sessionId}`;
}

export const localHistory = {
  addEntry(
    sessionId: string,
    tokenPath: string,
    previousValue: string | null,
    newValue: string,
    changeType: VersionEntry['changeType']
  ): VersionEntry {
    const entry: VersionEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sessionId,
      tokenPath,
      previousValue,
      newValue,
      changedAt: { toDate: () => new Date() } as any,
      changeType,
    };
    const existing = this.getAll(sessionId);
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    try {
      localStorage.setItem(storageKey(sessionId), JSON.stringify(updated));
    } catch { /* ignore quota errors */ }
    return entry;
  },

  getAll(sessionId: string): VersionEntry[] {
    try {
      const raw = localStorage.getItem(storageKey(sessionId));
      if (!raw) return [];
      const parsed: any[] = JSON.parse(raw);
      // Re-attach toDate helper after JSON parse
      return parsed.map((e) => ({
        ...e,
        changedAt: {
          toDate: () => new Date(e.changedAt?._ts ?? e.changedAt ?? Date.now()),
        },
      }));
    } catch {
      return [];
    }
  },

  clear(sessionId: string) {
    localStorage.removeItem(storageKey(sessionId));
  },
};
