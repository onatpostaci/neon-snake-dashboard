import type { CSSProperties } from 'react';

import { colors, radius } from '../../theme/theme';

export const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '16px 18px',
    borderRadius: radius,
    background: colors.surface,
    border: `1px solid ${colors.border}`
  },
  cardAccent: {
    borderColor: 'rgba(46, 242, 160, 0.35)'
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.06em'
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.15,
    fontVariantNumeric: 'tabular-nums',
    color: colors.text
  },
  valueAccent: {
    color: colors.neon
  },
  hint: {
    fontSize: 12.5,
    color: colors.faint
  }
} satisfies Record<string, CSSProperties>;
