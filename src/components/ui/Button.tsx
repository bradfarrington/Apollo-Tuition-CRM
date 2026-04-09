import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft-purple' | 'soft-blue' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '', 
  ...props 
}: ButtonProps) {
  const variantClass = styles[`variant-${variant}`];
  const sizeClass = styles[`size-${size}`];
  const fullWidthClass = fullWidth ? styles.fullWidth : '';
  
  return (
    <button 
      className={`${styles.button} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
