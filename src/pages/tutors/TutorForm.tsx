import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { Tutor } from '../../types/tutors';
import styles from './TutorForm.module.css';

interface TutorFormProps {
  isOpen: boolean;
  onClose: () => void;
  tutor?: Tutor;
}

export function TutorForm({ isOpen, onClose, tutor }: TutorFormProps) {
  const isEditing = !!tutor;
  const [formData, setFormData] = useState<Partial<Tutor>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    city: '',
    postal_code: '',
    country: '',
    active_status: 'onboarding',
    contract_status: 'pending',
    notes: ''
  });

  useEffect(() => {
    if (tutor && isOpen) {
      setFormData(tutor);
    } else if (!tutor && isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_line_1: '',
        city: '',
        postal_code: '',
        country: '',
        active_status: 'onboarding',
        contract_status: 'pending',
        notes: ''
      });
    }
  }, [tutor, isOpen]);

  const handleChange = (field: keyof Tutor, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting tutor:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Edit Tutor' : 'Add New Tutor'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} id="tutor-form" onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Personal Information</h3>
            <div className={styles.row}>
              <div>
                <label className={styles.label}>First Name *</label>
                <Input 
                  value={formData.first_name || ''} 
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Last Name *</label>
                <Input 
                  value={formData.last_name || ''} 
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Contact Details</h3>
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Email *</label>
                <Input 
                  type="email"
                  value={formData.email || ''} 
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={styles.label}>Phone Number</label>
                <Input 
                  type="tel"
                  value={formData.phone || ''} 
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className={styles.label}>Address Line 1</label>
              <Input 
                value={formData.address_line_1 || ''} 
                onChange={(e) => handleChange('address_line_1', e.target.value)}
              />
            </div>
            
            <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
              <div>
                <label className={styles.label}>City</label>
                <Input 
                  value={formData.city || ''} 
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div>
                <label className={styles.label}>Postal Code</label>
                <Input 
                  value={formData.postal_code || ''} 
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Status & Contract</h3>
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Active Status</label>
                <select 
                  className={styles.select}
                  value={formData.active_status || 'onboarding'}
                  onChange={(e) => handleChange('active_status', e.target.value as any)}
                  style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Contract Status</label>
                <select 
                  className={styles.select}
                  value={formData.contract_status || 'pending'}
                  onChange={(e) => handleChange('contract_status', e.target.value as any)}
                  style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
                >
                  <option value="pending">Pending</option>
                  <option value="signed">Signed</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Additional Information</h3>
            <div>
              <label className={styles.label}>Notes</label>
              <textarea 
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                style={{ 
                  width: '100%', 
                  padding: 'var(--spacing-sm)', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="tutor-form">
            {isEditing ? 'Save Changes' : 'Create Tutor'}
          </Button>
        </div>
      </div>
    </div>
  );
}
