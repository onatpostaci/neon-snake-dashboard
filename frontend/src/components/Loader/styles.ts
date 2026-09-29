import type { CSSProperties } from 'react';

import { colors } from '../../theme/theme';

export const loaderColors = {
  snake: colors.neon,
  fruit: colors.fruit,
  eye: '#0b1120',
  track: colors.border
};

export const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12
  },
  svg: {
    display: 'block',
    overflow: 'visible'
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.04em',
    color: colors.muted
  }
} satisfies Record<string, CSSProperties>;
