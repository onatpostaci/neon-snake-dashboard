import type { DataConnect } from 'firebase-admin/data-connect';

import type {
  GameplayLevel,
  RecordGameplayEventDto,
  RunOutcome,
  SessionOutcome
} from '../dto/gameplay.dto.js';
import { HttpError } from '../errors/httpError.js';
import type { GameplayRunModel, GameplaySessionModel } from '../models/gameplaySession.model.js';

/*
 * The only place the backend talks to the database.
 * It runs the named queries and mutations from dataconnect/connector/operations.gql through SQL Connect,
 * and converts between database rows and the models the rest of the backend uses.
 */

/** Outcome values as the database enums store them (upper case). The API uses lower case. */
type SqlSessionOutcome = 'QUIT' | 'FINISHED';
type SqlRunOutcome = 'COMPLETE' | 'FAIL' | 'QUIT';

/** Minimal session and run info returned by the SessionHead query, used only to validate new events. */
type RunHead = {
  id: string;
  endedAt: string | null;
};

type SessionHead = {
  id: string;
  endedAt: string | null;
  runs: RunHead[];
};

/**
 * Row shapes returned by the ListSessions and GetSession queries.
 * scoreChanges and progressChanges are only present in GetSession.
 */
type ScoreRow = {
  occurredAt: string;
  score: number;
  delta: number;
};

type ProgressRow = {
  occurredAt: string;
  progress: number;
  collected: number;
  target: number;
};

type RunRow = {
  id: string;
  level: number;
  startedAt: string;
  endedAt: string | null;
  outcome: SqlRunOutcome | null;
  score: number | null;
  progress: number | null;
  durationMs: number | null;
  scoreChanges?: ScoreRow[];
  progressChanges?: ProgressRow[];
};

type SessionRow = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  outcome: SqlSessionOutcome | null;
  runs: RunRow[];
};

/** SQL Connect returns UUIDs as 32 hex characters without dashes; this puts the dashes back so ids match what the game sends. */
const uuid = (value: string): string => {
  const hex = value.replace(/-/g, '').toLowerCase();
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/** Milliseconds (what the API uses) → ISO date string (what the database Timestamp type expects). */
const toTimestamp = (milliseconds: number): string => new Date(milliseconds).toISOString();

/** ISO date string from the database → milliseconds for the API. */
const fromTimestamp = (value: string): number => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) throw new HttpError(500, 'Stored time is invalid.');
  return parsed;
};

/** The database stores level as a plain Int; this checks it is really 1, 2 or 3. */
const asLevel = (level: number): GameplayLevel => {
  if (level === 1 || level === 2 || level === 3) return level;
  throw new HttpError(500, 'Stored level is invalid.');
};

/** Database enum → API value when reading (e.g. 'FINISHED' → 'finished'). null means "not ended yet". */
const sessionOutcome = (outcome: SqlSessionOutcome | null): SessionOutcome | null => {
  if (outcome === 'QUIT') return 'quit';
  if (outcome === 'FINISHED') return 'finished';
  return null;
};

const runOutcome = (outcome: SqlRunOutcome | null): RunOutcome | null => {
  if (outcome === 'COMPLETE') return 'complete';
  if (outcome === 'FAIL') return 'fail';
  if (outcome === 'QUIT') return 'quit';
  return null;
};

/** API value → database enum when writing (e.g. 'quit' → 'QUIT'). */
const sqlSessionOutcome = (outcome: SessionOutcome): SqlSessionOutcome => (outcome === 'quit' ? 'QUIT' : 'FINISHED');

const sqlRunOutcome = (outcome: RunOutcome): SqlRunOutcome => {
  if (outcome === 'complete') return 'COMPLETE';
  if (outcome === 'fail') return 'FAIL';
  return 'QUIT';
};

/**
 * Turns one run row into a run model.
 * It also rebuilds the run's event history (started, score and progress changes, ended)
 * from the separate tables, so GET /api/sessions/:id can show the full timeline.
 */
const toRun = (sessionId: string, row: RunRow): GameplayRunModel => {
  const level = asLevel(row.level);
  const startedAt = fromTimestamp(row.startedAt);
  const endedAt = row.endedAt === null ? null : fromTimestamp(row.endedAt);
  const outcome = runOutcome(row.outcome);
  const events: GameplayRunModel['events'] = [
    { type: 'runStarted', sessionId, runId: uuid(row.id), level, occurredAt: startedAt }
  ];

  for (const change of row.scoreChanges ?? []) {
    events.push({
      type: 'scoreChanged',
      sessionId,
      runId: uuid(row.id),
      level,
      score: change.score,
      delta: change.delta,
      occurredAt: fromTimestamp(change.occurredAt)
    });
  }

  for (const change of row.progressChanges ?? []) {
    events.push({
      type: 'progressChanged',
      sessionId,
      runId: uuid(row.id),
      level,
      progress: change.progress,
      collected: change.collected,
      target: change.target,
      occurredAt: fromTimestamp(change.occurredAt)
    });
  }

  if (endedAt !== null && outcome) {
    events.push({
      type: 'runEnded',
      sessionId,
      runId: uuid(row.id),
      level,
      score: row.score ?? 0,
      progress: row.progress ?? 0,
      outcome,
      durationMs: row.durationMs ?? 0,
      occurredAt: endedAt
    });
  }

  return {
    runId: uuid(row.id),
    level,
    startedAt,
    endedAt,
    outcome,
    score: row.score,
    progress: row.progress,
    durationMs: row.durationMs,
    events
  };
};

/** Turns one session row, with its runs, into a session model. */
const toSession = (row: SessionRow): GameplaySessionModel => ({
  sessionId: uuid(row.id),
  startedAt: fromTimestamp(row.startedAt),
  endedAt: row.endedAt === null ? null : fromTimestamp(row.endedAt),
  outcome: sessionOutcome(row.outcome),
  runs: row.runs.map((run) => toRun(uuid(row.id), run))
});

export class GameplayRepository {
  constructor(private readonly dataConnect: DataConnect) {}

  /**
   * Saves one gameplay event from POST /api/events.
   * It first checks the event makes sense against what is already stored:
   * - 400 if the session or run was never started
   * - 409 if the session or run has already ended
   * Then it runs the matching mutation:
   * runStarted → InsertSession + InsertRun, runEnded → EndRun, scoreChanged → RecordScore,
   * progressChanged → RecordProgress, sessionEnded → EndSession.
   */
  async save(event: RecordGameplayEventDto): Promise<void> {
    if (event.type === 'runStarted') {
      await this.startRun(event);
      return;
    }

    const session = await this.sessionHead(event.sessionId);
    if (!session) throw new HttpError(400, 'This session has not started.');
    if (session.endedAt) throw new HttpError(409, 'This session already ended.');

    if (event.type === 'sessionEnded') {
      await this.mutate('EndSession', {
        id: event.sessionId,
        endedAt: toTimestamp(event.occurredAt),
        outcome: sqlSessionOutcome(event.outcome)
      });
      return;
    }

    const run = session.runs.find((item) => uuid(item.id) === event.runId);
    if (!run) throw new HttpError(400, 'This run has not started.');
    if (run.endedAt) throw new HttpError(409, 'This run already ended.');

    if (event.type === 'runEnded') {
      await this.mutate('EndRun', {
        id: event.runId,
        level: event.level,
        endedAt: toTimestamp(event.occurredAt),
        outcome: sqlRunOutcome(event.outcome),
        score: event.score,
        progress: event.progress,
        durationMs: event.durationMs
      });
      return;
    }

    if (event.type === 'scoreChanged') {
      await this.mutate('RecordScore', {
        runId: event.runId,
        occurredAt: toTimestamp(event.occurredAt),
        score: event.score,
        delta: event.delta
      });
      return;
    }

    await this.mutate('RecordProgress', {
      runId: event.runId,
      occurredAt: toTimestamp(event.occurredAt),
      progress: event.progress,
      collected: event.collected,
      target: event.target
    });
  }

  /** One session with every run and every score/progress change (GetSession query). 404 if it doesn't exist. */
  async getById(sessionId: string): Promise<GameplaySessionModel> {
    const result = await this.query<{ session: SessionRow | null }>('GetSession', { id: sessionId });
    if (!result.session) throw new HttpError(404, 'Session not found.');
    return toSession(result.session);
  }

  /**
   * Sessions started at or after `from` (in ms), newest first, at most `limit` of them,
   * each with its runs but without score/progress history (ListSessions query). Used by the dashboard.
   */
  async listSince(from: number, limit: number): Promise<GameplaySessionModel[]> {
    const result = await this.query<{ sessions: SessionRow[] }>('ListSessions', { from: toTimestamp(from), limit });
    return result.sessions.map(toSession);
  }

  /**
   * Handles runStarted. There is no separate "session started" event: the first run of a session
   * creates the session row, and every run adds a run row.
   */
  private async startRun(event: Extract<RecordGameplayEventDto, { type: 'runStarted' }>): Promise<void> {
    const session = await this.sessionHead(event.sessionId);
    if (session?.endedAt) throw new HttpError(409, 'This session already ended.');
    if (session?.runs.some((run) => uuid(run.id) === event.runId)) {
      throw new HttpError(409, 'This run already started.');
    }

    const startedAt = toTimestamp(event.occurredAt);
    if (!session) {
      await this.mutate('InsertSession', { id: event.sessionId, startedAt });
    }
    await this.mutate('InsertRun', {
      id: event.runId,
      sessionId: event.sessionId,
      level: event.level,
      startedAt
    });
  }

  /** Quick lookup used before saving: does the session exist, has it ended, which runs does it have. */
  private async sessionHead(sessionId: string): Promise<SessionHead | null> {
    const result = await this.query<{ session: SessionHead | null }>('SessionHead', { id: sessionId });
    return result.session;
  }

  /** Runs a read operation from operations.gql by its name and returns its data. */
  private async query<Data>(name: string, variables: object): Promise<Data> {
    const response = await this.dataConnect.executeQuery<Data, object>(name, variables);
    return response.data;
  }

  /** Runs a write operation (mutation) from operations.gql by its name. */
  private async mutate(name: string, variables: object): Promise<void> {
    await this.dataConnect.executeMutation(name, variables);
  }
}
