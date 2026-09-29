import { logoColors, styles } from './styles';

type LogoProps = {
  size?: number;
};

export const Logo = ({ size = 40 }: LogoProps) => (
  <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Neon Snake logo" style={styles.svg}>
    <defs>
      <filter id="neon-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="64" height="64" rx="15" fill={logoColors.tile} stroke={logoColors.tileBorder} />
    <g filter="url(#neon-glow)">
      <path
        d="M14 46 H36 a8 8 0 0 0 0-16 H28 a8 8 0 0 1 0-16 H47"
        fill="none"
        stroke={logoColors.snake}
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="14" r="5.5" fill={logoColors.snake} />
      <circle cx="50" cy="46" r="3.8" fill={logoColors.fruit} />
    </g>
    <circle cx="49.6" cy="12.6" r="1.5" fill={logoColors.tile} />
    <path
      d="M53.2 14 h3.4 m0 0 l1.6 -1.6 m-1.6 1.6 l1.6 1.6"
      stroke={logoColors.tongue}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
