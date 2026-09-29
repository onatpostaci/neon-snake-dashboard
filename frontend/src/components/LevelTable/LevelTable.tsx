import type { CSSProperties } from 'react';

import { formatDecimal, formatDuration, formatNumber, formatPercent } from '../../utils/format';
import type { LevelStats } from '../../scenes/Dashboard/Dashboard.metrics';
import { styles } from './styles';

type LevelTableProps = {
  stats: LevelStats[];
};

const numericHead = { ...styles.headCell, ...styles.numeric };

export const LevelTable = ({ stats }: LevelTableProps) => (
  <div style={styles.wrap}>
    <table style={styles.table}>
      <thead>
        <tr>
          <th scope="col" style={styles.headCell}>Level</th>
          <th scope="col" style={numericHead}>Attempts</th>
          <th scope="col" style={styles.headCell}>Level success</th>
          <th scope="col" style={numericHead} title="Attempts needed for one level success">Tries / success</th>
          <th scope="col" style={numericHead} title="Average length of a finished attempt">Avg. run</th>
          <th scope="col" style={numericHead} title="Average level progress when the snake died">Death at</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((level, index) => {
          const cell: CSSProperties =
            index === stats.length - 1 ? { ...styles.cell, ...styles.lastRowCell } : styles.cell;
          const numeric = { ...cell, ...styles.numeric };

          return (
            <tr key={level.level}>
              <th scope="row" style={{ ...cell, ...styles.rowHeader }}>
                <span style={styles.levelChip}>{level.level}</span>
                {level.label}
              </th>
              <td style={numeric}>{formatNumber(level.runs)}</td>
              <td style={cell}>
                <div style={styles.rate}>
                  <span style={styles.rateTrack}>
                    <span style={{ ...styles.rateFill, width: `${Math.round((level.successRate ?? 0) * 100)}%` }} />
                  </span>
                  {formatPercent(level.successRate)}
                </div>
              </td>
              <td style={numeric}>{level.attemptsPerSuccess === null ? '–' : formatDecimal(level.attemptsPerSuccess)}</td>
              <td style={numeric}>{formatDuration(level.averageRunMs)}</td>
              <td style={numeric}>{formatPercent(level.averageFailProgress)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
