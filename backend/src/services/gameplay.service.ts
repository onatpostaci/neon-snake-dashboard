import type { GameplayRunDto, GameplaySessionDto, RecordGameplayEventDto } from '../dto/gameplay.dto.js';
import { HttpError } from '../errors/httpError.js';
import type { GameplayRunModel, GameplaySessionModel } from '../models/gameplaySession.model.js';
import { dataConnect } from '../config/firebase.js';
import { GameplayRepository } from '../repositories/gameplay.repository.js';
import { validateGameplayEvent } from '../validators/gameplayEvent.validator.js';

const repository = new GameplayRepository(dataConnect);
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toRunDto = (run: GameplayRunModel): GameplayRunDto => ({
  runId: run.runId,
  level: run.level,
  startedAt: run.startedAt,
  endedAt: run.endedAt,
  outcome: run.outcome,
  score: run.score,
  progress: run.progress,
  durationMs: run.durationMs
});

const toSessionDto = (session: GameplaySessionModel): GameplaySessionDto => ({
  sessionId: session.sessionId,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
  outcome: session.outcome,
  runs: session.runs.map(toRunDto)
});

const requireId = (id: string): string => {
  if (!idPattern.test(id)) throw new HttpError(400, 'sessionId must be a UUID.');
  return id;
};

export const gameplayService = {
  async recordEvent(body: unknown): Promise<RecordGameplayEventDto> {
    const event = validateGameplayEvent(body);
    await repository.save(event);
    return event;
  },

  async listSessions(from: number, limit: number): Promise<GameplaySessionDto[]> {
    const sessions = await repository.listSince(from, limit);
    return sessions.map(toSessionDto);
  },

  async getSession(sessionId: string): Promise<GameplaySessionDto & { runs: Array<GameplayRunDto & { events: GameplayRunModel['events'] }> }> {
    const session = await repository.getById(requireId(sessionId));
    return {
      ...toSessionDto(session),
      runs: session.runs.map((run) => ({
        ...toRunDto(run),
        events: [...run.events].sort((left, right) => left.occurredAt - right.occurredAt)
      }))
    };
  }
};
