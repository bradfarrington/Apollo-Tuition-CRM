import React from 'react';
import styles from './StageBadge.module.css';

export interface StageBadgeProps {
  stage: string;
  colorHex?: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage, colorHex }) => {
  // If a colour is provided from the DB, we can use it dynamically as an inline style.
  // Otherwise we fall back to a neutral css class.
  const customStyles = colorHex ? {
    backgroundColor: `${colorHex}1A`, // 10% opacity for background (hex shorthand)
    color: colorHex,
    border: `1px solid ${colorHex}33` // 20% opacity for border
  } : {};

  return (
    <span 
      className={`${styles.badge} ${!colorHex ? styles.default : ''}`}
      style={customStyles}
    >
      {stage}
    </span>
  );
};
