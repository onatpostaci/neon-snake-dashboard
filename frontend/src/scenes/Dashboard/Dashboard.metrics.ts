import type { GameplayLevel, GameplayRun, GameplaySession, RunOutcome } from '../../api/sessions.types';
import { formatDecimal, formatPercent } from '../../utils/format';

export const levels: GameplayLevel[] = [1, 2, 3];

const dayMs = 24 * 60 * 60 * 1000;

export type RangeKey = '7d' | '30d' | 'all';

export const ranges: Array<{ key: RangeKey; label: string; days: number | null }> = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: 'all', label: 'All time', days: null }
];

export type Overview = {
  sessions: number;
  runs: number;
  runsPerSession: number | null;
  finishRate: number | null;
  averageSessionMs: number | null;
  playTimeMs: number;
  bestScore: number | null;
};

export type LevelStats = {
  level: GameplayLevel;
  label: string;
  runs: number;
  complete: number;
  fail: number;
  quit: number;
  successRate: number | null;
  attemptsPerSuccess: number | null;
  averageRunMs: number | null;
  averageFailProgress: number | null;
};

export type FunnelStep = {
  label: string;
  sessions: number;
  share: number;
};

export type ActivityDay = {
  day: number;
  sessions: number;
  runs: number;
};

export type SessionRow = {
  sessionId: string;
  startedAt: number;
  durationMs: number | null;
  runs: number;
  highestLevel: GameplayLevel | null;
  bestScore: number | null;
  status: 'Finished' | 'Quit' | 'In progress';
};

/** Average of a list of numbers. Returns null for an empty list, so the UI can show "–" instead of NaN. */
const average = (values: number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;

/** part ÷ whole. Returns null when whole is 0, so nothing divides by zero. */
const ratio = (part: number, whole: number): number | null => (whole === 0 ? null : part / whole);

/** Rounds a time down to local midnight, so plays can be grouped by calendar day. */
const startOfDay = (time: number): number => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

/** Puts the runs of all sessions into one flat list. */
const allRuns = (sessions: GameplaySession[]): GameplayRun[] => sessions.flatMap((session) => session.runs);

/** Keeps only runs that have finished (cleared, died, or quit). Runs still being played are left out. */
const endedRuns = (runs: GameplayRun[]): Array<GameplayRun & { outcome: RunOutcome }> =>
  runs.filter((run): run is GameplayRun & { outcome: RunOutcome } => run.outcome !== null);

/** Highest score of any run in one session, or null if no run has a score yet. */
const sessionBestScore = (session: GameplaySession): number | null => {
  const scores = session.runs.flatMap((run) => (run.score === null ? [] : [run.score]));
  return scores.length === 0 ? null : Math.max(...scores);
};

/**
 * Start time of the selected range, sent to the backend as `from`.
 * "Last 7 days" means today plus the 6 days before it, starting at midnight.
 * Returns undefined for "All time", so no filter is sent.
 */
export const rangeStart = (range: RangeKey, now: number): number | undefined => {
  const days = ranges.find((item) => item.key === range)?.days ?? null;
  return days === null ? undefined : startOfDay(now) - (days - 1) * dayMs;
};

/**
 * Numbers for the five top cards.
 * - sessions / runs: counts
 * - runsPerSession: runs ÷ sessions
 * - finishRate: ended sessions that cleared all 3 levels ÷ ended sessions
 * - averageSessionMs: average length of ended sessions
 * - playTimeMs: total duration of all runs
 * - bestScore: highest score in any session
 */
export const overview = (sessions: GameplaySession[]): Overview => {
  const runs = allRuns(sessions);
  const ended = sessions.filter((session) => session.endedAt !== null);
  const scores = sessions.flatMap((session) => {
    const best = sessionBestScore(session);
    return best === null ? [] : [best];
  });

  return {
    sessions: sessions.length,
    runs: runs.length,
    runsPerSession: ratio(runs.length, sessions.length),
    finishRate: ratio(ended.filter((session) => session.outcome === 'finished').length, ended.length),
    averageSessionMs: average(ended.map((session) => (session.endedAt ?? session.startedAt) - session.startedAt)),
    playTimeMs: runs.reduce((sum, run) => sum + (run.durationMs ?? 0), 0),
    bestScore: scores.length === 0 ? null : Math.max(...scores)
  };
};

/**
 * Difficulty numbers for each level, used by the "Outcomes by level" chart and the "Level breakdown" table.
 * - runs: attempts on the level
 * - complete / fail / quit: how those attempts ended
 * - successRate ("Level success"): attempts that finished the level ÷ ended attempts
 * - attemptsPerSuccess: ended attempts ÷ successes (how many tries one success takes)
 * - averageRunMs: average length of an ended attempt
 * - averageFailProgress: how far into the level (0–1) the snake usually was when it died
 */
export const levelStats = (sessions: GameplaySession[]): LevelStats[] => {
  const runs = allRuns(sessions);

  return levels.map((level) => {
    const levelRuns = runs.filter((run) => run.level === level);
    const ended = endedRuns(levelRuns);
    const count = (outcome: RunOutcome) => ended.filter((run) => run.outcome === outcome).length;
    const complete = count('complete');
    const failed = ended.filter((run) => run.outcome === 'fail');

    return {
      level,
      label: `Level ${level}`,
      runs: levelRuns.length,
      complete,
      fail: failed.length,
      quit: count('quit'),
      successRate: ratio(complete, ended.length),
      attemptsPerSuccess: ratio(ended.length, complete),
      averageRunMs: average(ended.flatMap((run) => (run.durationMs === null ? [] : [run.durationMs]))),
      averageFailProgress: average(failed.flatMap((run) => (run.progress === null ? [] : [run.progress])))
    };
  });
};

/**
 * How far sessions get, for the "How far sessions get" chart.
 * Each step counts the sessions that reached it (started, cleared level 1, cleared level 2, finished the game),
 * with `share` as a fraction of all sessions.
 */
export const funnel = (sessions: GameplaySession[]): FunnelStep[] => {
  const cleared = (level: GameplayLevel) =>
    sessions.filter((session) => session.runs.some((run) => run.level === level && run.outcome === 'complete'))
      .length;
  const total = sessions.length;
  const step = (label: string, count: number): FunnelStep => ({
    label,
    sessions: count,
    share: total === 0 ? 0 : count / total
  });

  return [
    step('Started a run', total),
    step('Finished level 1', cleared(1)),
    step('Finished level 2', cleared(2)),
    step('Finished the game', cleared(3))
  ];
};

/**
 * Sessions started and runs played on each day of the range, for the "Daily activity" chart.
 * Every day gets an entry, even with zero plays, so quiet days show as gaps instead of disappearing.
 * For "All time", the chart starts on the day of the oldest session.
 */
export const activity = (sessions: GameplaySession[], range: RangeKey, now: number): ActivityDay[] => {
  const today = startOfDay(now);
  const days = ranges.find((item) => item.key === range)?.days ?? null;
  const earliest = sessions.reduce((min, session) => Math.min(min, session.startedAt), today);
  const first = days === null ? startOfDay(earliest) : today - (days - 1) * dayMs;

  const buckets = new Map<number, ActivityDay>();
  // Stepping 25 hours and rounding back to midnight keeps days correct across daylight-saving changes.
  for (let day = first; day <= today; day = startOfDay(day + dayMs + 60 * 60 * 1000)) {
    buckets.set(day, { day, sessions: 0, runs: 0 });
  }

  for (const session of sessions) {
    const bucket = buckets.get(startOfDay(session.startedAt));
    if (bucket) bucket.sessions += 1;

    for (const run of session.runs) {
      const runBucket = buckets.get(startOfDay(run.startedAt));
      if (runBucket) runBucket.runs += 1;
    }
  }

  return [...buckets.values()];
};

/**
 * The newest `count` sessions as rows for the "Recent sessions" table:
 * start time, length, number of runs, highest level reached, best score, and status.
 */
export const recentSessions = (sessions: GameplaySession[], count: number): SessionRow[] =>
  [...sessions]
    .sort((left, right) => right.startedAt - left.startedAt)
    .slice(0, count)
    .map((session) => {
      const reached = session.runs.map((run) => run.level);

      return {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        durationMs: session.endedAt === null ? null : session.endedAt - session.startedAt,
        runs: session.runs.length,
        highestLevel: reached.length === 0 ? null : (Math.max(...reached) as GameplayLevel),
        bestScore: sessionBestScore(session),
        status: session.outcome === 'finished' ? 'Finished' : session.outcome === 'quit' ? 'Quit' : 'In progress'
      };
    });

/**
 * After the snake dies, how often the player starts another run instead of quitting.
 * A death counts as retried when another run follows it in the same session.
 */
const retryRate = (sessions: GameplaySession[]): number | null => {
  let failures = 0;
  let retries = 0;

  for (const session of sessions) {
    const ordered = [...session.runs].sort((left, right) => left.startedAt - right.startedAt);
    ordered.forEach((run, index) => {
      if (run.outcome !== 'fail') return;
      failures += 1;
      if (index < ordered.length - 1) retries += 1;
    });
  }

  return ratio(retries, failures);
};

/**
 * Up to three plain-English findings for the insights box:
 * 1. the hardest level (lowest level success),
 * 2. the funnel step where the biggest share of sessions stops,
 * 3. how often players retry after dying.
 */
export const insights = (sessions: GameplaySession[], stats: LevelStats[], steps: FunnelStep[]): string[] => {
  if (sessions.length === 0) return [];

  const lines: string[] = [];
  const measured = stats.filter((level) => level.successRate !== null);

  if (measured.length > 0) {
    const hardest = measured.reduce((low, level) => ((level.successRate ?? 1) < (low.successRate ?? 1) ? level : low));
    const attempts = hardest.attemptsPerSuccess === null ? 'no successes yet' : `${formatDecimal(hardest.attemptsPerSuccess)} attempts per success`;
    lines.push(`${hardest.label} is the hardest: ${formatPercent(hardest.successRate)} level success (${attempts}).`);
  }

  let biggestDrop: { from: FunnelStep; to: FunnelStep; lost: number } | null = null;
  for (let index = 1; index < steps.length; index += 1) {
    const from = steps[index - 1];
    const to = steps[index];
    const lost = from.sessions === 0 ? 0 : 1 - to.sessions / from.sessions;
    if (!biggestDrop || lost > biggestDrop.lost) biggestDrop = { from, to, lost };
  }
  if (biggestDrop && biggestDrop.lost > 0) {
    lines.push(
      `The biggest drop-off is before “${biggestDrop.to.label.toLowerCase()}”: ${formatPercent(biggestDrop.lost)} of sessions that ${biggestDrop.from.label.toLowerCase()} stop there.`
    );
  }

  const retry = retryRate(sessions);
  if (retry !== null) {
    lines.push(`After a death, players start another run ${formatPercent(retry)} of the time.`);
  }

  return lines;
};
