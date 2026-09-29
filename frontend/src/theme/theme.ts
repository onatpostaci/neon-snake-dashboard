import type { CSSProperties } from 'react';

export const colors = {
  background: '#070b14',
  surface: '#0f1729',
  surfaceRaised: '#131d33',
  border: '#1d2942',
  grid: '#18233a',
  text: '#e6ebf5',
  muted: '#8b97b0',
  faint: '#5d6a85',
  neon: '#2ef2a0',
  cyan: '#38bdf8',
  fruit: '#f472b6',
  complete: '#2ef2a0',
  fail: '#fb7185',
  quit: '#fbbf24'
};

export const radius = 14;

export const fontMono = "ui-monospace, 'SF Mono', Menlo, monospace";

export const axisTick = { fill: colors.muted, fontSize: 12 };

export const legendText: CSSProperties = { color: colors.muted, fontSize: 12 };

export const tooltipStyle = {
  contentStyle: {
    background: '#0b1222',
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    color: colors.text,
    fontSize: 13
  },
  labelStyle: { color: colors.text, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: colors.text, padding: '1px 0' },
  cursor: { fill: 'rgba(56, 189, 248, 0.06)' }
};

export const tableStyles = {
  wrap: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13.5,
    fontVariantNumeric: 'tabular-nums'
  },
  headCell: {
    padding: 8,
    textAlign: 'left',
    fontSize: 11.5,
    fontWeight: 600,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${colors.border}`,
    whiteSpace: 'nowrap'
  },
  cell: {
    padding: '10px 8px',
    textAlign: 'left',
    fontWeight: 400,
    borderBottom: '1px solid rgba(29, 41, 66, 0.6)',
    whiteSpace: 'nowrap'
  },
  rowHeader: {
    fontWeight: 500
  },
  lastRowCell: {
    borderBottom: 0
  },
  numeric: {
    textAlign: 'right'
  }
} satisfies Record<string, CSSProperties>;
