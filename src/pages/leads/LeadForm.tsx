import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { Lead } from '../../types/leads';
import styles from './LeadForm.module.css';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export function LeadForm({ isOpen, onClose, lead }: LeadFormProps) {
  const isEditing = !!lead;
  
  const [formData, setFormData] = useState({
    parent_name: lead?.parent_name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    enquiry_type: lead?.enquiry_type || '',
    pipeline_id: lead?.pipeline_id || '',
    stage_id: lead?.stage_id || '',
    message: lead?.message || ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would dispatch a Redux action or call an API
    console.log('Submitting lead:', formData);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.slideover}>
        <header className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Edit Lead' : 'New Lead'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form className={styles.content} id="lead-form" onSubmit={handleSubmit}>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Contact Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input 
                  label="Parent/Guardian Name *" 
                  required 
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div>
                <Input 
                  label="Email Address" 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div>
                <Input 
                  label="Phone Number" 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Enquiry Profile</h3>
            <div className={styles.formGrid}>
              <div className={styles.fullWidth}>
                <Input 
                  label="Enquiry Type" 
                  name="enquiry_type"
                  placeholder="e.g. 11+ Prep, GCSE Science"
                  value={formData.enquiry_type}
                  onChange={handleChange}
                  fullWidth
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Pipeline</label>
                <select 
                  className={styles.select} 
                  name="pipeline_id"
                  value={formData.pipeline_id}
                  onChange={handleChange}
                >
                  <option value="">Select Pipeline</option>
                  <option value="p1">Standard Enquiry</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Initial Stage</label>
                <select 
                  className={styles.select}
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={handleChange}
                >
                  <option value="">Select Stage</option>
                  <option value="s1">New Enquiry</option>
                  <option value="s2">Contacted</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Initial Message / Notes</h3>
            <div className={styles.formGroup}>
              <textarea 
                className={styles.textarea} 
                name="message"
                placeholder="Details of the enquiry..."
                value={formData.message}
                onChange={handleChange}
              />
            </div>
          </div>

        </form>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="lead-form">
            {isEditing ? 'Save Changes' : 'Create Lead'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
