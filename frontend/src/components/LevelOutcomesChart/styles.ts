import type { CSSProperties } from 'react';

import { legendText } from '../../theme/theme';

export const chartHeight = 300;

export const styles = {
  legend: {
    ...legendText,
    paddingTop: 8
  },
  legendLabel: legendText
} satisfies Record<string, CSSProperties>;
