import type { CSSProperties } from 'react';

import { colors, radius } from '../../theme/theme';

export const styles = {
  list: {
    listStyle: 'none',
    margin: 0,
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    borderRadius: radius,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderLeft: `3px solid ${colors.cyan}`
  },
  item: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 11
  },
  dot: {
    flex: '0 0 auto',
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: colors.cyan,
    transform: 'translateY(-1px)'
  }
} satisfies Record<string, CSSProperties>;
