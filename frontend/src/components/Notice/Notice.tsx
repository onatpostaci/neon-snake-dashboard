import type { ReactNode } from 'react';

import { styles } from './styles';

type NoticeProps = {
  title: string;
  tone?: 'info' | 'error';
  children?: ReactNode;
};

export const Notice = ({ title, tone = 'info', children }: NoticeProps) => {
  const isError = tone === 'error';

  return (
    <div style={isError ? { ...styles.notice, ...styles.error } : styles.notice} role={isError ? 'alert' : 'status'}>
      <strong style={isError ? styles.errorTitle : styles.title}>{title}</strong>
      {children && <p style={styles.body}>{children}</p>}
    </div>
  );
};
