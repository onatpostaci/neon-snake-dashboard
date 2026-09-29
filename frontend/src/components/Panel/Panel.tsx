import type { ReactNode } from 'react';

import { styles } from './styles';

type PanelProps = {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
};

export const Panel = ({ title, description, aside, children }: PanelProps) => (
  <section style={styles.panel}>
    <header style={styles.header}>
      <div>
        <h2 style={styles.title}>{title}</h2>
        {description && <p style={styles.description}>{description}</p>}
      </div>
      {aside}
    </header>
    {children}
  </section>
);
