import { styles } from './styles';

type InsightsProps = {
  notes: string[];
};

export const Insights = ({ notes }: InsightsProps) => {
  if (notes.length === 0) return null;

  return (
    <ul style={styles.list} aria-label="Key insights">
      {notes.map((note) => (
        <li key={note} style={styles.item}>
          <span style={styles.dot} aria-hidden="true" />
          {note}
        </li>
      ))}
    </ul>
  );
};
