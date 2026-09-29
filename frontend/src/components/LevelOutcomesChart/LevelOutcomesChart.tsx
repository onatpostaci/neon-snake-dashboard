import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatNumber, formatPercent } from '../../utils/format';
import type { LevelStats } from '../../scenes/Dashboard/Dashboard.metrics';
import { axisTick, colors, tooltipStyle } from '../../theme/theme';
import { chartHeight, styles } from './styles';

type LevelOutcomesChartProps = {
  stats: LevelStats[];
};

export const LevelOutcomesChart = ({ stats }: LevelOutcomesChartProps) => {
  const data = stats.map((level) => ({
    label: level.label,
    Succeeded: level.complete,
    Died: level.fail,
    Quit: level.quit,
    'Level success': level.successRate === null ? null : Math.round(level.successRate * 100)
  }));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap="28%">
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis dataKey="label" tick={axisTick} axisLine={{ stroke: colors.border }} tickLine={false} />
        <YAxis yAxisId="runs" tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          yAxisId="rate"
          orientation="right"
          domain={[0, 100]}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value, name) =>
            name === 'Level success' ? formatPercent(Number(value) / 100) : `${formatNumber(Number(value))} runs`
          }
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={styles.legend}
          formatter={(value) => <span style={styles.legendLabel}>{value}</span>}
        />
        <Bar yAxisId="runs" dataKey="Succeeded" stackId="runs" fill={colors.complete} />
        <Bar yAxisId="runs" dataKey="Died" stackId="runs" fill={colors.fail} />
        <Bar yAxisId="runs" dataKey="Quit" stackId="runs" fill={colors.quit} radius={[6, 6, 0, 0]} />
        <Line
          yAxisId="rate"
          type="monotone"
          dataKey="Level success"
          stroke={colors.cyan}
          strokeWidth={2.5}
          dot={{ r: 4, fill: colors.cyan, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
