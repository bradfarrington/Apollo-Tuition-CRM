import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './StudentForm.module.css';
import { useEffect, useState } from 'react';
import type { Student } from '../../types/students';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Student;
}

export function StudentForm({ isOpen, onClose, initialData }: StudentFormProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialData ? 'Edit Student' : 'New Student'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.row}>
            <div>
              <label htmlFor="first_name" className={styles.label}>First Name *</label>
              <Input id="first_name" placeholder="E.g. Emily" defaultValue={initialData?.first_name} required />
            </div>
            <div>
              <label htmlFor="last_name" className={styles.label}>Last Name *</label>
              <Input id="last_name" placeholder="E.g. Smith" defaultValue={initialData?.last_name} required />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label htmlFor="date_of_birth" className={styles.label}>Date of Birth</label>
              <Input id="date_of_birth" type="date" defaultValue={initialData?.date_of_birth || ''} />
            </div>
            <div>
              <label htmlFor="status" className={styles.label}>Status *</label>
              <select 
                id="status"
                className="ui-input" 
                defaultValue={initialData?.status || 'active'}
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="onboarding">Onboarding</option>
                <option value="graduated">Graduated</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label htmlFor="school_year" className={styles.label}>School Year</label>
              <select 
                id="school_year" 
                className="ui-input" 
                defaultValue={initialData?.school_year || ''}
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="">Select Year...</option>
                <option value="Year 4">Year 4</option>
                <option value="Year 5">Year 5</option>
                <option value="Year 6">Year 6 (11+)</option>
                <option value="Year 7">Year 7</option>
                <option value="Year 8">Year 8</option>
                <option value="Year 9">Year 9</option>
                <option value="Year 10">Year 10 (GCSE)</option>
                <option value="Year 11">Year 11 (GCSE)</option>
                <option value="Year 12">Year 12 (A-Level)</option>
                <option value="Year 13">Year 13 (A-Level)</option>
              </select>
            </div>
            <div>
              <label htmlFor="key_stage" className={styles.label}>Key Stage</label>
              <select 
                id="key_stage" 
                className="ui-input" 
                defaultValue={initialData?.key_stage || ''}
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="">Select KS...</option>
                <option value="KS2">KS2</option>
                <option value="KS3">KS3</option>
                <option value="KS4">KS4</option>
                <option value="KS5">KS5</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Relationships</h3>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label htmlFor="primary_parent_id" className={styles.label}>Primary Parent / Guardian</label>
              {/* This would be a searchable Select in real implementation */}
              <select 
                id="primary_parent_id" 
                className="ui-input" 
                defaultValue={initialData?.primary_parent_id || ''}
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="">Select Parent...</option>
                <option value="1">Sarah Connor</option>
                <option value="2">Kyle Reese</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="tutor_id" className={styles.label}>Assigned Tutor</label>
              <select 
                id="tutor_id" 
                className="ui-input" 
                defaultValue={initialData?.tutor_id || ''}
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value="">Select Tutor...</option>
                <option value="1">John Smith</option>
                <option value="2">Alice Johnson</option>
              </select>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Additional Information</h3>
            <div>
              <label htmlFor="notes" className={styles.label}>Notes</label>
              <textarea 
                id="notes" 
                className="ui-input" 
                placeholder="Medical info, learning requirements..."
                defaultValue={initialData?.notes || ''}
                style={{ width: '100%', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', minHeight: '100px', resize: 'vertical', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>
            {initialData ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </div>
    </div>
  );
}
