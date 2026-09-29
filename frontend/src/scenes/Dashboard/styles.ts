import type { CSSProperties } from 'react';

import { colors } from '../../theme/theme';

export const styles = {
  page: {
    minHeight: '100vh',
    background: colors.background
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 1280,
    margin: '0 auto',
    padding: '28px 32px 48px'
  },
  initialLoader: {
    display: 'flex',
    justifyContent: 'center',
    padding: '120px 0'
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    transition: 'opacity 200ms ease, filter 200ms ease'
  },
  bodyBusy: {
    opacity: 0.35,
    filter: 'blur(1px)',
    pointerEvents: 'none'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  overlayCard: {
    padding: '22px 30px 18px',
    borderRadius: 18,
    background: 'rgba(15, 23, 41, 0.92)',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 0 40px rgba(46, 242, 160, 0.12), 0 12px 40px rgba(0, 0, 0, 0.5)'
  },
  overview: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 700
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted
  },
  kpis: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
    gap: 14
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
    gap: 20
  },
  code: {
    fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
    fontSize: '0.9em',
    padding: '1px 6px',
    borderRadius: 6,
    background: colors.surfaceRaised,
    border: `1px solid ${colors.border}`,
    color: colors.neon
  }
} satisfies Record<string, CSSProperties>;
