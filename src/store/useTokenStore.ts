import { create } from 'zustand';
import type { DesignTokens, ScrapeError } from '../types';
import { applyTokensToDOM } from '../lib/cssVariables';
import { firestoreService } from '../lib/firestoreService';

// Debounce helper
let debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedFirestoreUpdate(
  sessionId: string,
  tokenDocId: string,
  path: string,
  newValue: string | number | number[],
  previousValue: string | number | number[] | null
) {
  if (debounceTimers[path]) clearTimeout(debounceTimers[path]);
  debounceTimers[path] = setTimeout(() => {
    firestoreService
      .updateToken(sessionId, tokenDocId, path, newValue, previousValue)
      .catch(console.error);
  }, 300);
}

interface TokenStore {
  sessionId: string | null;
  tokenDocId: string | null;
  tokens: DesignTokens | null;
  lockedPaths: string[];
  isLoading: boolean;
  error: ScrapeError | null;

  setSessionId: (id: string) => void;
  setTokenDocId: (id: string) => void;
  setTokens: (t: DesignTokens) => void;
  updateColor: (key: string, value: string) => void;
  updateTypography: (key: string, value: any) => void;
  updateSpacing: (key: string, value: any) => void;
  setLockedPaths: (paths: string[]) => void;
  addLockedPath: (path: string) => void;
  removeLockedPath: (path: string) => void;
  setLoading: (v: boolean) => void;
  setError: (e: ScrapeError | null) => void;
}

export const useTokenStore = create<TokenStore>((set, get) => ({
  sessionId: null,
  tokenDocId: null,
  tokens: null,
  lockedPaths: [],
  isLoading: false,
  error: null,

  setSessionId: (id) => set({ sessionId: id }),
  setTokenDocId: (id) => set({ tokenDocId: id }),
  setTokens: (t) => {
    set({ tokens: t });
    applyTokensToDOM(t);
  },

  updateColor: (key, value) => {
    const { tokens, sessionId, tokenDocId, lockedPaths } = get();
    if (!tokens || !sessionId || !tokenDocId) return;
    const path = `colors.${key}`;
    if (lockedPaths.includes(path)) return;

    const previousValue = (tokens.colors as any)[key];
    const newTokens: DesignTokens = {
      ...tokens,
      colors: { ...tokens.colors, [key]: value },
    };
    set({ tokens: newTokens });
    applyTokensToDOM(newTokens);
    debouncedFirestoreUpdate(sessionId, tokenDocId, path, value, previousValue);
  },

  updateTypography: (key, value) => {
    const { tokens, sessionId, tokenDocId, lockedPaths } = get();
    if (!tokens || !sessionId || !tokenDocId) return;
    const path = `typography.${key}`;
    if (lockedPaths.includes(path)) return;

    const previousValue = (tokens.typography as any)[key];
    const newTokens: DesignTokens = {
      ...tokens,
      typography: { ...tokens.typography, [key]: value },
    };
    set({ tokens: newTokens });
    applyTokensToDOM(newTokens);
    debouncedFirestoreUpdate(sessionId, tokenDocId, path, value, previousValue);
  },

  updateSpacing: (key, value) => {
    const { tokens, sessionId, tokenDocId, lockedPaths } = get();
    if (!tokens || !sessionId || !tokenDocId) return;
    const path = `spacing.${key}`;
    if (lockedPaths.includes(path)) return;

    const previousValue = (tokens.spacing as any)[key];
    const newTokens: DesignTokens = {
      ...tokens,
      spacing: { ...tokens.spacing, [key]: value },
    };
    set({ tokens: newTokens });
    applyTokensToDOM(newTokens);
    debouncedFirestoreUpdate(sessionId, tokenDocId, path, value, previousValue);
  },

  setLockedPaths: (paths) => set({ lockedPaths: paths }),
  addLockedPath: (path) =>
    set((s) => ({ lockedPaths: [...s.lockedPaths, path] })),
  removeLockedPath: (path) =>
    set((s) => ({ lockedPaths: s.lockedPaths.filter((p) => p !== path) })),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),
}));
