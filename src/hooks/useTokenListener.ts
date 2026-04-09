import { useEffect } from 'react';
import { useTokenStore } from '../store/useTokenStore';

/**
 * Attempts to set up a Firestore real-time listener for the session.
 * If Firestore is unavailable, silently degrades — the app still works
 * because all edits go through the Zustand store directly.
 */
export function useTokenListener(sessionId: string | null) {
  const setTokenDocId = useTokenStore((s) => s.setTokenDocId);

  useEffect(() => {
    if (!sessionId) return;

    let unsubscribe: (() => void) | undefined;

    // Attempt Firestore listener as best-effort (supports multi-tab sync)
    (async () => {
      try {
        const { firestoreService } = await import('../lib/firestoreService');
        const setTokens = useTokenStore.getState().setTokens;
        unsubscribe = firestoreService.listenToTokens(sessionId, (data) => {
          if (data) {
            setTokenDocId(data.id);
            const tokens = {
              colors: data.colors,
              typography: data.typography,
              spacing: data.spacing,
            };
            if (tokens.colors && tokens.typography && tokens.spacing) {
              setTokens(tokens);
            }
          }
        });
      } catch {
        // Firestore not configured — app works fully in local-only mode
      }
    })();

    return () => unsubscribe?.();
  }, [sessionId, setTokenDocId]);
}
