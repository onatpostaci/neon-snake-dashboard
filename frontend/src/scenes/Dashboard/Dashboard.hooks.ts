import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchSessions } from '../../api/sessions.api';
import type { GameplaySession } from '../../api/sessions.types';
import { rangeStart, type RangeKey } from './Dashboard.metrics';

const minimumLoadingMs = 600;

const wait = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, milliseconds);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve();
    });
  });

type SessionsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; sessions: GameplaySession[]; range: RangeKey; loadedAt: number };

export const useSessions = (range: RangeKey) => {
  const [state, setState] = useState<SessionsState>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setRefreshing(true);

    const now = Date.now();
    try {
      // Local requests finish in a few ms; waiting a moment keeps the loader from flickering.
      const [sessions] = await Promise.all([
        fetchSessions({ from: rangeStart(range, now), signal: current.signal }),
        wait(minimumLoadingMs, current.signal)
      ]);
      setState({ status: 'ready', sessions, range, loadedAt: now });
    } catch (error) {
      if (current.signal.aborted) return;
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error.' });
    } finally {
      if (controller.current === current) setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
    return () => controller.current?.abort();
  }, [load]);

  return { state, refreshing, reload: load };
};
