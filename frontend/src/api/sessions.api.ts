import { getJson } from './client';
import type { GameplaySession } from './sessions.types';

export const sessionLimit = 200;

type FetchSessionsOptions = {
  from?: number;
  signal?: AbortSignal;
};

export const fetchSessions = async ({ from, signal }: FetchSessionsOptions = {}): Promise<GameplaySession[]> => {
  const query = new URLSearchParams({ limit: String(sessionLimit) });
  if (from !== undefined) query.set('from', String(from));

  const body = await getJson<{ sessions: GameplaySession[] }>(`/sessions?${query}`, signal);
  return body.sessions;
};
