import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from './Button';
import styles from './AlertModal.module.css';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={24} />;
      case 'error':
        return <AlertCircle size={24} />;
      case 'info':
      default:
        return <Info size={24} />;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.iconWrapper} ${styles[type]}`}>
          {getIcon()}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button variant="primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
