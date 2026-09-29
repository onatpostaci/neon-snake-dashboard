import type { CSSProperties } from 'react';

import { colors, radius } from '../../theme/theme';

export const styles = {
  notice: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '20px 22px',
    borderRadius: radius,
    background: colors.surface,
    border: `1px solid ${colors.border}`
  },
  error: {
    borderColor: 'rgba(251, 113, 133, 0.45)'
  },
  title: {
    color: colors.text
  },
  errorTitle: {
    color: colors.fail
  },
  body: {
    color: colors.muted
  }
} satisfies Record<string, CSSProperties>;
