import type { GameEventMap } from '../application/gameEvents';
import type { EventBus } from '../core/events/EventBus';
import type { GameSnapshot } from '../game/types';
import { gameplayLevels, type GameplayEvent, type GameplayLevel, type SessionOutcome } from './gameplayEvent';

export interface GameplayAnalyticsClient {
  record(event: GameplayEvent, options?: { keepalive?: boolean }): Promise<void>;
}

type OpenRun = {
  runId: string;
  level: GameplayLevel;
  startedAt: number;
};

const gameplayLevel = (level: number): GameplayLevel | null =>
  gameplayLevels.find((candidate) => candidate === level) ?? null;

export class GameplayAnalytics {
  private sessionId: string | null = null;
  private openRun: OpenRun | null = null;
  private pending = Promise.resolve();

  constructor(
    events: EventBus<GameEventMap>,
    private readonly client: GameplayAnalyticsClient,
    private readonly currentSnapshot: () => GameSnapshot
  ) {
    events.on('runStarted', (event) => {
      const level = gameplayLevel(event.level);
      if (!level) return;

      const runId = crypto.randomUUID();
      this.sessionId ??= crypto.randomUUID();
      this.openRun = { runId, level, startedAt: event.occurredAt };
      this.send({
        type: 'runStarted',
        sessionId: this.sessionId,
        runId,
        level,
        occurredAt: event.occurredAt
      });
    });

    events.on('scoreChanged', (event) => {
      if (!this.openRun || !this.sessionId) return;
      const level = gameplayLevel(event.level);
      if (!level) return;

      this.send({
        type: 'scoreChanged',
        sessionId: this.sessionId,
        runId: this.openRun.runId,
        level,
        score: event.score,
        delta: event.delta,
        occurredAt: Date.now()
      });
    });

    events.on('progressChanged', (event) => {
      if (!this.openRun || !this.sessionId) return;
      const level = gameplayLevel(event.level);
      if (!level) return;

      this.send({
        type: 'progressChanged',
        sessionId: this.sessionId,
        runId: this.openRun.runId,
        level,
        progress: event.progress,
        collected: event.collected,
        target: event.target,
        occurredAt: Date.now()
      });
    });

    events.on('runEnded', (event) => {
      const level = this.openRun?.level ?? gameplayLevel(event.level);
      const runId = this.openRun?.runId;
      const sessionId = this.sessionId;
      this.openRun = null;
      if (!level || !runId || !sessionId) return;

      this.send({
        type: 'runEnded',
        sessionId,
        runId,
        level,
        score: event.score,
        progress: event.progress,
        outcome: event.reason,
        durationMs: event.durationMs,
        occurredAt: event.occurredAt
      });

      if (event.reason === 'quit') this.endSession('quit', event.occurredAt);
    });

    events.on('gameFinished', () => {
      this.endSession('finished', Date.now());
    });

    events.on('stateChanged', (snapshot) => {
      if (snapshot.phase === 'menu') this.endSession('quit', Date.now());
    });
  }

  leaveOpenRun(): void {
    const now = Date.now();
    if (this.openRun && this.sessionId) {
      const run = this.openRun;
      const sessionId = this.sessionId;
      this.openRun = null;
      this.send(
        {
          type: 'runEnded',
          sessionId,
          runId: run.runId,
          level: run.level,
          score: this.currentSnapshot().score,
          progress: this.currentSnapshot().progress,
          outcome: 'quit',
          durationMs: Math.max(0, now - run.startedAt),
          occurredAt: now
        },
        { keepalive: true }
      );
    }

    this.endSession('quit', now, true);
  }

  private send(event: GameplayEvent, options?: { keepalive?: boolean }): void {
    this.pending = this.pending.then(() => this.client.record(event, options)).then(
      () => undefined,
      () => undefined
    );
  }

  private endSession(outcome: SessionOutcome, occurredAt: number, keepalive = false): void {
    if (!this.sessionId) return;

    const sessionId = this.sessionId;
    this.sessionId = null;
    this.send({ type: 'sessionEnded', sessionId, outcome, occurredAt }, { keepalive });
  }
}
