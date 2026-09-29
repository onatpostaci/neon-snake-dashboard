import type {
  GameplayLevel,
  RecordGameplayEventDto,
  RunOutcome,
  SessionOutcome
} from '../dto/gameplay.dto.js';

export type GameplayRunModel = {
  runId: string;
  level: GameplayLevel;
  startedAt: number;
  endedAt: number | null;
  outcome: RunOutcome | null;
  score: number | null;
  progress: number | null;
  durationMs: number | null;
  events: Array<Exclude<RecordGameplayEventDto, { type: 'sessionEnded' }>>;
};

export type GameplaySessionModel = {
  sessionId: string;
  startedAt: number;
  endedAt: number | null;
  outcome: SessionOutcome | null;
  runs: GameplayRunModel[];
};
