import type { CSSProperties } from 'react';

import { colors, tableStyles } from '../../theme/theme';

export const styles = {
  ...tableStyles,
  levelChip: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 22,
    height: 22,
    marginRight: 8,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 700,
    color: colors.background,
    background: colors.neon
  },
  rate: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8
  },
  rateTrack: {
    display: 'inline-block',
    width: 48,
    height: 6,
    borderRadius: 3,
    background: colors.surfaceRaised,
    overflow: 'hidden'
  },
  rateFill: {
    display: 'block',
    height: '100%',
    background: colors.neon
  }
} satisfies Record<string, CSSProperties>;
