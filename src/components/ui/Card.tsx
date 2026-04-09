import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'gradient' | 'gradient-purple' | 'gradient-pink';
}

export function Card({ children, className = '', noPadding = false, variant = 'default' }: CardProps) {
  const variantClass = variant !== 'default' ? styles[variant] : '';
  
  return (
    <div className={`${styles.card} ${noPadding ? styles.noPadding : ''} ${variantClass} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = '', 
  title, 
  action 
}: { 
  children?: ReactNode; 
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.headerTitleWrap}>
        {title ? <CardTitle>{title}</CardTitle> : null}
        {children}
      </div>
      {action ? <div className={styles.headerAction}>{action}</div> : null}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`${styles.title} ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
}
