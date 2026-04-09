import React from 'react';
import styles from './DetailSectionCard.module.css';

export interface DetailSectionCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const DetailSectionCard: React.FC<DetailSectionCardProps> = ({ title, children, actions }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
