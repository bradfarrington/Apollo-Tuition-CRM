import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { supabase } from '../../lib/supabase';
import type { Tutor } from '../../types/tutors';
import styles from '../../components/ui/SlideoverForm.module.css';

interface TutorFormProps {
  isOpen: boolean;
  onClose: () => void;
  tutor?: Tutor;
}

export function TutorForm({ isOpen, onClose, tutor }: TutorFormProps) {
  const isEditing = !!tutor;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Tutor>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    city: '',
    county: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean data for DB
    const submitData = { ...formData };
    delete submitData.id;
    delete submitData.created_at;
    delete submitData.updated_at;

    try {
      if (tutor?.id) {
        // Update
        const { error } = await supabase
          .from('tutors')
          .update({ ...submitData, updated_at: new Date().toISOString() })
          .eq('id', tutor.id);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('tutors')
          .insert(submitData);
        if (error) throw error;
      }
      onClose();
    } catch (err) {
      console.error('Failed to save tutor:', err);
    } finally {
      setIsSubmitting(false);
    }
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
            
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Town/City</label>
                <Input 
                  value={formData.city || ''} 
                  onChange={(e) => handleChange('city', e.target.value)}
                />
              </div>
              <div>
                <label className={styles.label}>County</label>
                <Input 
                  value={formData.county || ''} 
                  onChange={(e) => handleChange('county', e.target.value)}
                />
              </div>
            </div>
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Postal Code</label>
                <Input 
                  value={formData.postal_code || ''} 
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                />
              </div>
              <div></div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Status & Contract</h3>
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Active Status</label>
                <Select 
                  value={formData.active_status || 'onboarding'}
                  onChange={(val) => handleChange('active_status', val as any)}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'onboarding', label: 'Onboarding' }
                  ]}
                />
              </div>
              <div>
                <label className={styles.label}>Contract Status</label>
                <Select 
                  value={formData.contract_status || 'pending'}
                  onChange={(val) => handleChange('contract_status', val as any)}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'signed', label: 'Signed' },
                    { value: 'expired', label: 'Expired' },
                    { value: 'terminated', label: 'Terminated' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Additional Information</h3>
            <div>
              <label className={styles.label}>Notes</label>
              <textarea 
                className={styles.textareaInput}
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" type="submit" form="tutor-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Tutor'}
          </Button>
        </div>
      </div>
    </div>
  );
}
