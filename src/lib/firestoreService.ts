import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { DesignTokens } from '../types';

export const firestoreService = {
  // Create a new scrape session
  async createScrapeSession(url: string): Promise<string> {
    const ref = await addDoc(collection(db, 'scraped_sites'), {
      url,
      timestamp: serverTimestamp(),
      extractionStatus: 'pending',
    });
    return ref.id;
  },

  // Save extracted tokens
  async saveTokens(
    siteId: string,
    sessionId: string,
    tokens: DesignTokens
  ): Promise<string> {
    const ref = await addDoc(collection(db, 'design_tokens'), {
      siteId,
      sessionId,
      ...tokens,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    // Mark site as success
    await updateDoc(doc(db, 'scraped_sites', siteId), {
      extractionStatus: 'success',
    });
    // Log initial version history
    await addDoc(collection(db, 'version_history'), {
      sessionId,
      tokenPath: 'all',
      previousValue: null,
      newValue: 'initial extraction',
      changedAt: serverTimestamp(),
      changeType: 'scraped',
    });
    return ref.id;
  },

  // Mark scrape as failed
  async markScrapeFailed(siteId: string, errorMessage: string) {
    await updateDoc(doc(db, 'scraped_sites', siteId), {
      extractionStatus: 'failed',
      errorMessage,
    });
  },

  // Get tokens for a session
  async getTokens(sessionId: string) {
    const q = query(
      collection(db, 'design_tokens'),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
  },

  // Update a single token field
  async updateToken(
    sessionId: string,
    tokenDocId: string,
    tokenPath: string,
    newValue: string | number | number[],
    previousValue: string | number | number[] | null
  ) {
    await updateDoc(doc(db, 'design_tokens', tokenDocId), {
      [tokenPath]: newValue,
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'version_history'), {
      sessionId,
      tokenPath,
      previousValue: previousValue != null ? String(previousValue) : null,
      newValue: String(newValue),
      changedAt: serverTimestamp(),
      changeType: 'user_edit',
    });
  },

  // Lock a token
  async lockToken(sessionId: string, tokenPath: string, value: string) {
    const lockId = `${sessionId}_${tokenPath.replace(/\./g, '_')}`;
    await setDoc(doc(db, 'locked_tokens', lockId), {
      sessionId,
      tokenPath,
      lockedValue: value,
      lockedAt: serverTimestamp(),
    });
    await addDoc(collection(db, 'version_history'), {
      sessionId,
      tokenPath,
      previousValue: value,
      newValue: value,
      changedAt: serverTimestamp(),
      changeType: 'locked',
    });
  },

  // Unlock a token
  async unlockToken(sessionId: string, tokenPath: string) {
    const lockId = `${sessionId}_${tokenPath.replace(/\./g, '_')}`;
    await deleteDoc(doc(db, 'locked_tokens', lockId));
    await addDoc(collection(db, 'version_history'), {
      sessionId,
      tokenPath,
      previousValue: null,
      newValue: 'unlocked',
      changedAt: serverTimestamp(),
      changeType: 'unlocked',
    });
  },

  // Get all locked token paths for a session
  async getLockedPaths(sessionId: string): Promise<string[]> {
    const q = query(
      collection(db, 'locked_tokens'),
      where('sessionId', '==', sessionId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().tokenPath);
  },

  // Get version history
  async getHistory(sessionId: string) {
    const q = query(
      collection(db, 'version_history'),
      where('sessionId', '==', sessionId),
      orderBy('changedAt', 'desc'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },

  // Real-time listener for tokens
  listenToTokens(sessionId: string, callback: (tokens: any) => void) {
    const q = query(
      collection(db, 'design_tokens'),
      where('sessionId', '==', sessionId),
      limit(1)
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty)
        callback({ id: snap.docs[0].id, ...snap.docs[0].data() });
    });
  },
};
