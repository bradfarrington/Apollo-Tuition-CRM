import React from 'react';
import styles from './StatCard.module.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.body}>
        <h3 className={styles.value}>{value}</h3>
        {trend && (
          <span className={`${styles.trend} ${styles['trend' + capitalize(trend.direction)]}`}>
            {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '-'} {trend.percentage}
          </span>
        )}
      </div>
    </div>
  );
};

// Helper for dynamic class name
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
