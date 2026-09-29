import { ranges, type RangeKey } from '../../scenes/Dashboard/Dashboard.metrics';
import { Logo } from '../Logo/Logo';
import { styles } from './styles';

type HeaderProps = {
  range: RangeKey;
  onRangeChange: (range: RangeKey) => void;
  refreshing: boolean;
  onRefresh: () => void;
};

export const Header = ({ range, onRangeChange, refreshing, onRefresh }: HeaderProps) => (
  <header style={styles.header}>
    <div style={styles.brand}>
      <Logo size={40} />
      <div style={styles.brandText}>
        <span style={styles.brandName}>Neon Snake</span>
        <span style={styles.brandSub}>Gameplay analytics</span>
      </div>
    </div>

    <div style={styles.controls}>
      <div style={styles.segmented} role="group" aria-label="Time range">
        {ranges.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={range === item.key}
            style={range === item.key ? { ...styles.segment, ...styles.segmentActive } : styles.segment}
            onClick={() => onRangeChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        style={refreshing ? { ...styles.refresh, ...styles.refreshBusy } : styles.refresh}
        onClick={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  </header>
);
