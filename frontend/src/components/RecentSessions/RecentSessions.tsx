import type { CSSProperties } from 'react';

import { formatDateTime, formatDuration, formatNumber } from '../../utils/format';
import type { SessionRow } from '../../scenes/Dashboard/Dashboard.metrics';
import { styles } from './styles';

type RecentSessionsProps = {
  rows: SessionRow[];
};

const statusStyle: Record<SessionRow['status'], CSSProperties> = {
  Finished: { ...styles.status, ...styles.statusFinished },
  Quit: { ...styles.status, ...styles.statusQuit },
  'In progress': { ...styles.status, ...styles.statusOpen }
};

const numericHead = { ...styles.headCell, ...styles.numeric };

export const RecentSessions = ({ rows }: RecentSessionsProps) => (
  <div style={styles.wrap}>
    <table style={styles.table}>
      <thead>
        <tr>
          <th scope="col" style={styles.headCell}>Started</th>
          <th scope="col" style={numericHead}>Length</th>
          <th scope="col" style={numericHead}>Runs</th>
          <th scope="col" style={numericHead} title="Highest level reached">Level</th>
          <th scope="col" style={numericHead} title="Best score in the session">Best</th>
          <th scope="col" style={styles.headCell}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const cell: CSSProperties =
            index === rows.length - 1 ? { ...styles.cell, ...styles.lastRowCell } : styles.cell;
          const numeric = { ...cell, ...styles.numeric };

          return (
            <tr key={row.sessionId}>
              <th scope="row" style={{ ...cell, ...styles.rowHeader }} title={row.sessionId}>
                {formatDateTime(row.startedAt)}
              </th>
              <td style={numeric}>{formatDuration(row.durationMs)}</td>
              <td style={numeric}>{formatNumber(row.runs)}</td>
              <td style={numeric}>{row.highestLevel ?? '–'}</td>
              <td style={numeric}>{row.bestScore === null ? '–' : formatNumber(row.bestScore)}</td>
              <td style={cell}>
                <span style={statusStyle[row.status]}>{row.status}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
