import {
  gameplayLevels,
  type GameplayLevel,
  type RecordGameplayEventDto,
  type RunOutcome
} from '../dto/gameplay.dto.js';
import { HttpError } from '../errors/httpError.js';

const outcomes: RunOutcome[] = ['complete', 'fail', 'quit'];
const runIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const earliestEvent = Date.parse('2024-01-01T00:00:00Z');

const record = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpError(400, 'Event must be an object.');
  }
  return value as Record<string, unknown>;
};

const level = (value: unknown): GameplayLevel => {
  if (!gameplayLevels.includes(value as GameplayLevel)) {
    throw new HttpError(400, 'Level must be 1, 2, or 3.');
  }
  return value as GameplayLevel;
};

const occurredAt = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < earliestEvent) {
    throw new HttpError(400, 'occurredAt must be a time in milliseconds.');
  }
  if (value > Date.now() + 5 * 60 * 1000) {
    throw new HttpError(400, 'occurredAt cannot be in the future.');
  }
  return value;
};

const runId = (value: unknown): string => {
  if (typeof value !== 'string' || !runIdPattern.test(value)) {
    throw new HttpError(400, 'runId must be a UUID.');
  }
  return value;
};

const wholeNumber = (value: unknown, name: string, minimum: number, maximum: number): number => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > maximum) {
    throw new HttpError(400, `${name} must be a whole number from ${minimum} to ${maximum}.`);
  }
  return value;
};

const progress = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new HttpError(400, 'progress must be a number from 0 to 1.');
  }
  return value;
};

const outcome = (value: unknown): RunOutcome => {
  if (!outcomes.includes(value as RunOutcome)) {
    throw new HttpError(400, 'outcome must be complete, fail, or quit.');
  }
  return value as RunOutcome;
};

export const validateGameplayEvent = (value: unknown): RecordGameplayEventDto => {
  const event = record(value);
  if (event.type === 'sessionEnded') {
    if (event.outcome !== 'quit' && event.outcome !== 'finished') {
      throw new HttpError(400, 'outcome must be quit or finished.');
    }

    return {
      type: 'sessionEnded',
      sessionId: runId(event.sessionId),
      outcome: event.outcome,
      occurredAt: occurredAt(event.occurredAt)
    };
  }

  const shared = {
    sessionId: runId(event.sessionId),
    runId: runId(event.runId),
    level: level(event.level),
    occurredAt: occurredAt(event.occurredAt)
  };

  if (event.type === 'runStarted') return { type: 'runStarted', ...shared };

  if (event.type === 'runEnded') {
    return {
      type: 'runEnded',
      ...shared,
      score: wholeNumber(event.score, 'score', 0, 1_000_000),
      progress: progress(event.progress),
      outcome: outcome(event.outcome),
      durationMs: wholeNumber(event.durationMs, 'durationMs', 0, 24 * 60 * 60 * 1000)
    };
  }

  if (event.type === 'scoreChanged') {
    return {
      type: 'scoreChanged',
      ...shared,
      score: wholeNumber(event.score, 'score', 0, 1_000_000),
      delta: wholeNumber(event.delta, 'delta', -1_000_000, 1_000_000)
    };
  }

  if (event.type === 'progressChanged') {
    return {
      type: 'progressChanged',
      ...shared,
      progress: progress(event.progress),
      collected: wholeNumber(event.collected, 'collected', 0, 1_000),
      target: wholeNumber(event.target, 'target', 1, 1_000)
    };
  }

  throw new HttpError(400, 'type must be runStarted, runEnded, scoreChanged, progressChanged, or sessionEnded.');
};
