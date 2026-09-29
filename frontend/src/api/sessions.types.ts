export type GameplayLevel = 1 | 2 | 3;

export type RunOutcome = 'complete' | 'fail' | 'quit';

export type SessionOutcome = 'quit' | 'finished';

export type GameplayRun = {
  runId: string;
  level: GameplayLevel;
  startedAt: number;
  endedAt: number | null;
  outcome: RunOutcome | null;
  score: number | null;
  progress: number | null;
  durationMs: number | null;
};

export type GameplaySession = {
  sessionId: string;
  startedAt: number;
  endedAt: number | null;
  outcome: SessionOutcome | null;
  runs: GameplayRun[];
};
