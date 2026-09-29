import { useMemo, useState } from 'react';

import { sessionLimit } from '../../api/sessions.api';
import type { GameplaySession } from '../../api/sessions.types';
import { ActivityChart } from '../../components/ActivityChart/ActivityChart';
import { FunnelChart } from '../../components/FunnelChart/FunnelChart';
import { Header } from '../../components/Header/Header';
import { Insights } from '../../components/Insights/Insights';
import { KpiCard } from '../../components/KpiCard/KpiCard';
import { LevelOutcomesChart } from '../../components/LevelOutcomesChart/LevelOutcomesChart';
import { LevelTable } from '../../components/LevelTable/LevelTable';
import { Loader } from '../../components/Loader/Loader';
import { Notice } from '../../components/Notice/Notice';
import { Panel } from '../../components/Panel/Panel';
import { RecentSessions } from '../../components/RecentSessions/RecentSessions';
import { formatDecimal, formatDuration, formatNumber, formatPercent, formatTime } from '../../utils/format';
import {
  activity,
  funnel,
  insights,
  levelStats,
  overview,
  ranges,
  recentSessions,
  type RangeKey
} from './Dashboard.metrics';
import { useSessions } from './Dashboard.hooks';
import { styles } from './styles';

export const DashboardScene = () => {
  const [range, setRange] = useState<RangeKey>('30d');
  const { state, refreshing, reload } = useSessions(range);

  return (
    <div style={styles.page}>
      <Header range={range} onRangeChange={setRange} refreshing={refreshing} onRefresh={() => void reload()} />

      <main style={styles.content}>
        {state.status === 'loading' && (
          <div style={styles.initialLoader}>
            <Loader size={88} label="Loading gameplay data…" />
          </div>
        )}

        {state.status === 'error' && (
          <Notice title="The analytics API is not reachable" tone="error">
            {state.message} Start the emulator with <code style={styles.code}>pnpm emulators</code> and the API with{' '}
            <code style={styles.code}>pnpm backend</code>, then press Refresh.
          </Notice>
        )}

        {state.status === 'ready' && (
          <div style={refreshing ? { ...styles.body, ...styles.bodyBusy } : styles.body} aria-busy={refreshing}>
            <DashboardContent sessions={state.sessions} range={state.range} loadedAt={state.loadedAt} />
          </div>
        )}
      </main>

      {state.status === 'ready' && refreshing && (
        <div style={styles.overlay}>
          <div style={styles.overlayCard}>
            <Loader label="Updating…" />
          </div>
        </div>
      )}
    </div>
  );
};

type DashboardContentProps = {
  sessions: GameplaySession[];
  range: RangeKey;
  loadedAt: number;
};

const DashboardContent = ({ sessions, range, loadedAt }: DashboardContentProps) => {
  const view = useMemo(() => {
    const stats = levelStats(sessions);
    const steps = funnel(sessions);

    return {
      summary: overview(sessions),
      stats,
      steps,
      days: activity(sessions, range, loadedAt),
      notes: insights(sessions, stats, steps),
      recent: recentSessions(sessions, 8)
    };
  }, [sessions, range, loadedAt]);

  const rangeLabel =
    range === 'all' ? 'in total' : `in the ${ranges.find((item) => item.key === range)?.label.toLowerCase() ?? ''}`;
  const capped = sessions.length >= sessionLimit;
  const hasData = sessions.length > 0;

  return (
    <>
      <section style={styles.overview}>
        <div>
          <h1 style={styles.title}>Overview</h1>
          <p style={styles.subtitle}>
            {formatNumber(view.summary.sessions)} sessions {rangeLabel}
            {capped ? ` (showing the latest ${sessionLimit})` : ''}. Updated {formatTime(loadedAt)}.
          </p>
        </div>

        {!hasData && (
          <Notice title="No sessions in this range">
            Play a round of Neon Snake, or load sample data with{' '}
            <code style={styles.code}>pnpm --dir backend seed</code>, then press Refresh.
          </Notice>
        )}

        {hasData && (
          <>
            <div style={styles.kpis}>
              <KpiCard
                accent
                label="Sessions"
                value={formatNumber(view.summary.sessions)}
                hint="From pressing Start until quitting or finishing"
              />
              <KpiCard
                label="Runs"
                value={formatNumber(view.summary.runs)}
                hint={
                  view.summary.runsPerSession === null
                    ? 'Attempts, including retries'
                    : `${formatDecimal(view.summary.runsPerSession)} attempts per session`
                }
              />
              <KpiCard
                label="Game finish rate"
                value={formatPercent(view.summary.finishRate)}
                hint="Ended sessions that cleared all 3 levels"
              />
              <KpiCard
                label="Avg. session length"
                value={formatDuration(view.summary.averageSessionMs)}
                hint={`${formatDuration(view.summary.playTimeMs)} of total play time`}
              />
              <KpiCard
                label="Best score"
                value={view.summary.bestScore === null ? '–' : formatNumber(view.summary.bestScore)}
                hint="Highest score reached in one session"
              />
            </div>

            <Insights notes={view.notes} />
          </>
        )}
      </section>

      {hasData && (
        <>
          <div style={styles.twoColumns}>
            <Panel
              title="Outcomes by level"
              description="How each attempt ended. The line shows level success: the share of attempts that finished the level."
            >
              <LevelOutcomesChart stats={view.stats} />
            </Panel>
            <Panel title="How far sessions get" description="Share of sessions that reach each milestone.">
              <FunnelChart steps={view.steps} />
            </Panel>
          </div>

          <Panel title="Daily activity" description="Sessions started and runs played per day.">
            <ActivityChart days={view.days} />
          </Panel>

          <div style={styles.twoColumns}>
            <Panel title="Level breakdown" description="Difficulty signals for each level.">
              <LevelTable stats={view.stats} />
            </Panel>
            <Panel title="Recent sessions" description="The latest sittings in this range.">
              <RecentSessions rows={view.recent} />
            </Panel>
          </div>
        </>
      )}
    </>
  );
};
