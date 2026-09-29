import type { CSSProperties } from 'react';

import { colors, radius } from '../../theme/theme';

export const styles = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    minWidth: 0,
    padding: '18px 20px 16px',
    borderRadius: radius,
    background: colors.surface,
    border: `1px solid ${colors.border}`
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  title: {
    fontSize: 16,
    fontWeight: 650
  },
  description: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted
  }
} satisfies Record<string, CSSProperties>;
