
import { X, Check } from 'lucide-react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function ConvertConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Convert Enquiry', 
  message = 'Are you sure you want to convert this enquiry into active Students and a Parent?' 
}: Props) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--color-bg-base)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}><X size={18} /></button>
        </div>
        <p style={{ margin: '0 0 var(--spacing-6) 0', color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onConfirm(); onClose(); }}>
            <Check size={16} /> Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
