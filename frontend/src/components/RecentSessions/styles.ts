import type { CSSProperties } from 'react';

import { colors, tableStyles } from '../../theme/theme';

export const styles = {
  ...tableStyles,
  status: {
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600
  },
  statusFinished: {
    color: colors.neon,
    background: 'rgba(46, 242, 160, 0.12)'
  },
  statusQuit: {
    color: colors.quit,
    background: 'rgba(251, 191, 36, 0.12)'
  },
  statusOpen: {
    color: colors.cyan,
    background: 'rgba(56, 189, 248, 0.12)'
  }
} satisfies Record<string, CSSProperties>;
