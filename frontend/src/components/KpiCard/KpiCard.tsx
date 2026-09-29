import { styles } from './styles';

type KpiCardProps = {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
};

export const KpiCard = ({ label, value, hint, accent = false }: KpiCardProps) => (
  <article style={accent ? { ...styles.card, ...styles.cardAccent } : styles.card}>
    <span style={styles.label}>{label}</span>
    <strong style={accent ? { ...styles.value, ...styles.valueAccent } : styles.value}>{value}</strong>
    <span style={styles.hint}>{hint}</span>
  </article>
);
