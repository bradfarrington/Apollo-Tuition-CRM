import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { X } from 'lucide-react';
import styles from './ParentForm.module.css';

interface ParentFormProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string; // If provided, we're in edit mode
}

export function ParentForm({ isOpen, onClose }: ParentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.slideover}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add New Parent / Guardian</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <form id="parent-form" onSubmit={handleSubmit} className={styles.section}>
            
            <h3 className={styles.sectionTitle}>Personal Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name *</label>
                <Input placeholder="e.g. Sarah" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name *</label>
                <Input placeholder="e.g. Connor" required />
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Contact Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address *</label>
                <Input type="email" placeholder="sarah@example.com" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <Input type="tel" placeholder="07123 456789" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Preferred Contact Method</label>
                <select className={styles.select}>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Address</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Address Line 1</label>
                <Input placeholder="123 Street Name" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <Input placeholder="London" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Postal Code</label>
                <Input placeholder="SW1A 1AA" />
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Additional Info</h3>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Notes</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Any additional information..."
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select className={styles.select} defaultValue="active">
                  <option value="prospective">Prospective</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="parent-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Parent'}
          </Button>
        </div>
      </div>
    </div>
  );
}
