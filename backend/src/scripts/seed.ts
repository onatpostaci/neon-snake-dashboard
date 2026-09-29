import { randomUUID } from 'node:crypto';

import { config } from '../config/env.js';
import type { GameplayLevel, RecordGameplayEventDto } from '../dto/gameplay.dto.js';
import { gameplayService } from '../services/gameplay.service.js';

if (!config.useEmulator) {
  console.error('Seeding only runs against the local emulator. Unset SQL_CONNECT_EMULATOR=false.');
  process.exit(1);
}

const sessionCount = Number(process.argv[2] ?? 36);
const targets: Record<GameplayLevel, number> = { 1: 5, 2: 7, 3: 9 };
const failChance: Record<GameplayLevel, number> = { 1: 0.3, 2: 0.55, 3: 0.68 };
const secondsPerFruit: Record<GameplayLevel, [number, number]> = { 1: [3, 6], 2: [3.5, 7], 3: [4, 8] };

let state = 20260927;
const random = (): number => {
  state = (state + 0x6d2b79f5) | 0;
  let value = Math.imul(state ^ (state >>> 15), 1 | state);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};
const between = (min: number, max: number): number => min + random() * (max - min);
const chance = (probability: number): boolean => random() < probability;

const simulateSession = (startedAt: number): RecordGameplayEventDto[] => {
  const sessionId = randomUUID();
  const events: RecordGameplayEventDto[] = [];
  let time = startedAt;
  let level: GameplayLevel = 1;
  let scoreAtLevelStart = 0;

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const runId = randomUUID();
    const runStartedAt = time;
    const target = targets[level];
    const dies = chance(failChance[level]);
    const quitsMidRun = !dies && chance(0.06);
    const collected = dies || quitsMidRun ? Math.floor(random() * target) : target;
    let score = scoreAtLevelStart;

    events.push({ type: 'runStarted', sessionId, runId, level, occurredAt: time });

    for (let fruit = 1; fruit <= collected; fruit += 1) {
      time += Math.round(between(...secondsPerFruit[level]) * 1000);
      score += level * 10;
      events.push({ type: 'scoreChanged', sessionId, runId, level, score, delta: level * 10, occurredAt: time });
      events.push({
        type: 'progressChanged',
        sessionId,
        runId,
        level,
        progress: fruit / target,
        collected: fruit,
        target,
        occurredAt: time
      });
    }

    if (dies || quitsMidRun) time += Math.round(between(1, 4) * 1000);
    const outcome = dies ? 'fail' : quitsMidRun ? 'quit' : 'complete';
    events.push({
      type: 'runEnded',
      sessionId,
      runId,
      level,
      score,
      progress: collected / target,
      outcome,
      durationMs: time - runStartedAt,
      occurredAt: time
    });
    time += Math.round(between(2, 6) * 1000);

    if (outcome === 'quit') break;
    if (outcome === 'fail') {
      if (chance(0.22)) break;
      continue;
    }

    if (level === 3) {
      events.push({ type: 'sessionEnded', sessionId, outcome: 'finished', occurredAt: time });
      return events;
    }
    if (chance(0.1)) break;

    scoreAtLevelStart = score;
    level = (level + 1) as GameplayLevel;
  }

  events.push({ type: 'sessionEnded', sessionId, outcome: 'quit', occurredAt: time });
  return events;
};

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;
let written = 0;

for (let index = 0; index < sessionCount; index += 1) {
  const daysAgo = Math.pow(random(), 1.3) * 27.5;
  const startedAt = Math.round(now - daysAgo * dayMs - between(0.5, 2) * 60 * 60 * 1000);

  for (const event of simulateSession(startedAt)) {
    await gameplayService.recordEvent(event);
    written += 1;
  }
}

console.log(`Seeded ${sessionCount} sessions (${written} events) into the local emulator.`);
