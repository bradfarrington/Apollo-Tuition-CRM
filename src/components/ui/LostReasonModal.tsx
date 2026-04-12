import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function LostReasonModal({ isOpen, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--color-bg-base)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', width: '100%', maxWidth: '450px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Mark as Lost</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}><X size={18} /></button>
        </div>
        <p style={{ margin: '0 0 var(--spacing-4) 0', color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
          Please provide a reason why this enquiry was lost. This helps with tracking outcomes.
        </p>
        <textarea
           style={{ width: '100%', minHeight: '100px', padding: '12px', boxSizing: 'border-box', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', resize: 'vertical', fontFamily: 'inherit', marginBottom: 'var(--spacing-6)', fontSize: '14px' }}
           placeholder="e.g. They chose another tutor, too expensive, etc..."
           value={reason}
           onChange={e => setReason(e.target.value)}
           autoFocus
        />
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onConfirm(reason); setReason(''); onClose(); }} disabled={!reason.trim()}>
            Save & Update Status
          </Button>
        </div>
      </div>
    </div>
  );
}
