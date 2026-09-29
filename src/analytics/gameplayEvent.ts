export const gameplayLevels = [1, 2, 3] as const;

export type GameplayLevel = (typeof gameplayLevels)[number];

export type RunOutcome = 'complete' | 'fail' | 'quit';

export type SessionOutcome = 'quit' | 'finished';

type SessionEvent = {
  sessionId: string;
  occurredAt: number;
};

export type GameplayEvent =
  | (SessionEvent & {
      type: 'runStarted';
      runId: string;
      level: GameplayLevel;
    })
  | (SessionEvent & {
      type: 'runEnded';
      runId: string;
      level: GameplayLevel;
      score: number;
      progress: number;
      outcome: RunOutcome;
      durationMs: number;
    })
  | (SessionEvent & {
      type: 'scoreChanged';
      runId: string;
      level: GameplayLevel;
      score: number;
      delta: number;
    })
  | (SessionEvent & {
      type: 'progressChanged';
      runId: string;
      level: GameplayLevel;
      progress: number;
      collected: number;
      target: number;
    })
  | (SessionEvent & {
      type: 'sessionEnded';
      outcome: SessionOutcome;
    });
