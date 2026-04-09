import React from 'react';
import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'danger' | 'warning';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  // Map standard statuses to our generic styling classes
  let statusClass = styles.default;
  switch (status) {
    case 'active':
    case 'success':
      statusClass = styles.success;
      break;
    case 'pending':
    case 'warning':
      statusClass = styles.warning;
      break;
    case 'inactive':
    case 'danger':
      statusClass = styles.danger;
      break;
    default:
      statusClass = styles.default;
  }

  return (
    <span className={`${styles.badge} ${statusClass}`}>
      {label}
    </span>
  );
};
