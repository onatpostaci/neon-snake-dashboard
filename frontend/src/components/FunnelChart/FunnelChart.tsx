import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatNumber, formatPercent } from '../../utils/format';
import type { FunnelStep } from '../../scenes/Dashboard/Dashboard.metrics';
import { axisTick, colors, tooltipStyle } from '../../theme/theme';
import { chartHeight, stepColors, styles } from './styles';

type FunnelChartProps = {
  steps: FunnelStep[];
};

export const FunnelChart = ({ steps }: FunnelChartProps) => {
  const data = steps.map((step) => ({
    label: step.label,
    Sessions: step.sessions,
    share: formatPercent(step.share)
  }));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 56, bottom: 0, left: 8 }} barCategoryGap="22%">
        <CartesianGrid stroke={colors.grid} horizontal={false} />
        <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={128}
          tick={styles.categoryTick}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip {...tooltipStyle} formatter={(value) => `${formatNumber(Number(value))} sessions`} />
        <Bar dataKey="Sessions" radius={[0, 6, 6, 0]}>
          {data.map((step, index) => (
            <Cell key={step.label} fill={stepColors[index] ?? colors.neon} fillOpacity={1 - index * 0.12} />
          ))}
          <LabelList dataKey="share" position="right" {...styles.shareLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
