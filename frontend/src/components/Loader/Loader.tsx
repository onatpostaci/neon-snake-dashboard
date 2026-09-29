import { useId } from 'react';

import { loaderColors, styles } from './styles';

type LoaderProps = {
  size?: number;
  label?: string;
};

const center = 32;
const ringRadius = 22;
const segmentCount = 16;
const segmentGapDegrees = 17;

const bodySegments = Array.from({ length: segmentCount }, (_, index) => {
  const angle = (-(index + 1) * segmentGapDegrees * Math.PI) / 180;
  const fade = index / segmentCount;

  return {
    cx: center + ringRadius * Math.cos(angle),
    cy: center + ringRadius * Math.sin(angle),
    r: 4.4 - fade * 2.6,
    opacity: 1 - fade * 0.85
  };
});

export const Loader = ({ size = 72, label }: LoaderProps) => {
  const glowId = `loader-glow-${useId().replace(/:/g, '')}`;

  return (
    <div style={styles.wrapper} role="status" aria-live="polite" aria-label={label ?? 'Loading'}>
      <svg width={size} height={size} viewBox="0 0 64 64" style={styles.svg} aria-hidden="true">
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={center} cy={center} r={ringRadius} fill="none" stroke={loaderColors.track} strokeWidth="1" strokeDasharray="2 4" />

        <circle cx={center} cy={center} r="3.6" fill={loaderColors.fruit} filter={`url(#${glowId})`}>
          <animate attributeName="r" values="3.2;4.2;3.2" dur="1.2s" repeatCount="indefinite" />
        </circle>

        <g filter={`url(#${glowId})`}>
          {bodySegments.map((segment, index) => (
            <circle
              key={index}
              cx={segment.cx}
              cy={segment.cy}
              r={segment.r}
              fill={loaderColors.snake}
              opacity={segment.opacity}
            />
          ))}
          <circle cx={center + ringRadius} cy={center} r="5.4" fill={loaderColors.snake} />
          <circle cx={center + ringRadius + 1.6} cy={center + 1.8} r="1.2" fill={loaderColors.eye} />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${center} ${center}`}
            to={`360 ${center} ${center}`}
            dur="1.4s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
      {label && <span style={styles.label}>{label}</span>}
    </div>
  );
};
