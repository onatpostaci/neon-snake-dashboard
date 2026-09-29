import type { CSSProperties } from 'react';

import { axisTick, colors } from '../../theme/theme';

export const chartHeight = 300;

export const stepColors = [colors.cyan, colors.neon, colors.neon, colors.fruit];

export const styles = {
  categoryTick: {
    ...axisTick,
    fill: colors.text
  },
  shareLabel: {
    fill: colors.text,
    fontSize: 12,
    fontWeight: 600
  }
} satisfies Record<string, CSSProperties>;
