import { useEffect } from 'react';
import { firestoreService } from '../lib/firestoreService';
import { useTokenStore } from '../store/useTokenStore';

export function useTokenListener(sessionId: string | null) {
  const setTokens = useTokenStore((s) => s.setTokens);
  const setTokenDocId = useTokenStore((s) => s.setTokenDocId);

  useEffect(() => {
    if (!sessionId) return;

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = firestoreService.listenToTokens(
        sessionId,
        (data) => {
          if (data) {
            setTokenDocId(data.id);
            const tokens = {
              colors: data.colors,
              typography: data.typography,
              spacing: data.spacing,
            };
            // Only update if data is valid
            if (tokens.colors && tokens.typography && tokens.spacing) {
              setTokens(tokens);
            }
          }
        }
      );
    } catch (err) {
      console.warn('Firestore listener failed (non-blocking):', err);
    }

    return () => unsubscribe?.();
  }, [sessionId, setTokens, setTokenDocId]);
}
