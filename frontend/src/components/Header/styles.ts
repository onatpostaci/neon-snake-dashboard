import type { CSSProperties } from 'react';

import { colors } from '../../theme/theme';

export const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    padding: '14px 32px',
    background: 'rgba(7, 11, 20, 0.88)',
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${colors.border}`
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2
  },
  brandName: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '0.01em',
    color: colors.neon,
    textShadow: '0 0 14px rgba(46, 242, 160, 0.45)'
  },
  brandSub: {
    fontSize: 12,
    color: colors.muted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 10
  },
  segmented: {
    display: 'inline-flex',
    padding: 3,
    borderRadius: 10,
    background: colors.surface,
    border: `1px solid ${colors.border}`
  },
  segment: {
    border: 0,
    background: 'transparent',
    padding: '6px 12px',
    borderRadius: 7,
    fontSize: 13,
    color: colors.muted
  },
  segmentActive: {
    background: colors.surfaceRaised,
    color: colors.text,
    boxShadow: `inset 0 0 0 1px ${colors.border}`
  },
  refresh: {
    padding: '7px 14px',
    borderRadius: 10,
    border: '1px solid rgba(46, 242, 160, 0.4)',
    background: 'rgba(46, 242, 160, 0.08)',
    color: colors.neon,
    fontSize: 13,
    fontWeight: 600
  },
  refreshBusy: {
    opacity: 0.6,
    cursor: 'progress'
  }
} satisfies Record<string, CSSProperties>;
