export const gameplayLevels = [1, 2, 3] as const;

export type GameplayLevel = (typeof gameplayLevels)[number];

export type RunOutcome = 'complete' | 'fail' | 'quit';

export type SessionOutcome = 'quit' | 'finished';

type SessionEvent = {
  sessionId: string;
  occurredAt: number;
};

export type RunStartedDto = SessionEvent & {
  type: 'runStarted';
  runId: string;
  level: GameplayLevel;
};

export type RunEndedDto = SessionEvent & {
  type: 'runEnded';
  runId: string;
  level: GameplayLevel;
  score: number;
  progress: number;
  outcome: RunOutcome;
  durationMs: number;
};

export type ScoreChangedDto = SessionEvent & {
  type: 'scoreChanged';
  runId: string;
  level: GameplayLevel;
  score: number;
  delta: number;
};

export type ProgressChangedDto = SessionEvent & {
  type: 'progressChanged';
  runId: string;
  level: GameplayLevel;
  progress: number;
  collected: number;
  target: number;
};

export type SessionEndedDto = SessionEvent & {
  type: 'sessionEnded';
  outcome: SessionOutcome;
};

export type RecordGameplayEventDto =
  | RunStartedDto
  | RunEndedDto
  | ScoreChangedDto
  | ProgressChangedDto
  | SessionEndedDto;

export type GameplayRunDto = {
  runId: string;
  level: GameplayLevel;
  startedAt: number;
  endedAt: number | null;
  outcome: RunOutcome | null;
  score: number | null;
  progress: number | null;
  durationMs: number | null;
};

export type GameplaySessionDto = {
  sessionId: string;
  startedAt: number;
  endedAt: number | null;
  outcome: SessionOutcome | null;
  runs: GameplayRunDto[];
};
