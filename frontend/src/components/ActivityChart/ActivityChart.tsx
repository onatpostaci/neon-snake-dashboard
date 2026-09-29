import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatDay, formatNumber } from '../../utils/format';
import type { ActivityDay } from '../../scenes/Dashboard/Dashboard.metrics';
import { axisTick, colors, tooltipStyle } from '../../theme/theme';
import { chartHeight, styles } from './styles';

type ActivityChartProps = {
  days: ActivityDay[];
};

export const ActivityChart = ({ days }: ActivityChartProps) => {
  const data = days.map((day) => ({ day: day.day, Runs: day.runs, Sessions: day.sessions }));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={(value: number) => formatDay(value)}
          tick={axisTick}
          axisLine={{ stroke: colors.border }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ stroke: colors.border }}
          labelFormatter={(value) => formatDay(Number(value))}
          formatter={(value, name) => `${formatNumber(Number(value))} ${String(name).toLowerCase()}`}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={styles.legend}
          formatter={(value) => <span style={styles.legendLabel}>{value}</span>}
        />
        <Area type="monotone" dataKey="Runs" stroke={colors.neon} strokeWidth={2} fill={colors.neon} fillOpacity={0.12} />
        <Area
          type="monotone"
          dataKey="Sessions"
          stroke={colors.cyan}
          strokeWidth={2}
          fill={colors.cyan}
          fillOpacity={0.12}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
