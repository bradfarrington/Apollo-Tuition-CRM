import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { supabase } from '../../lib/supabase';
import type { Lead } from '../../types/leads';
import styles from './LeadForm.module.css';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export function LeadForm({ isOpen, onClose, lead }: LeadFormProps) {
  const isEditing = !!lead;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    parent_name: '',
    email: '',
    phone: '',
    enquiry_type: '',
    message: '',
    pipeline_id: '',
    stage_id: '',
    status: 'open'
  });

  useEffect(() => {
    if (isOpen) {
      if (lead) {
        setFormData({
          parent_name: lead.parent_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          enquiry_type: lead.enquiry_type || '',
          message: lead.message || '',
          pipeline_id: lead.pipeline_stage?.pipeline_id || '',
          stage_id: lead.stage_id || lead.pipeline_stage?.id || '',
          status: lead.status || 'open'
        });
      } else {
        setFormData({
          parent_name: '',
          email: '',
          phone: '',
          enquiry_type: '',
          message: '',
          pipeline_id: '',
          stage_id: '',
          status: 'open'
        });
      }

      // Fetch pipelines
      supabase.from('pipelines').select('id, name').order('sort_order').then(({ data }) => setPipelines(data || []));
    }
  }, [isOpen, lead]);

  // Fetch stages when pipeline changes
  useEffect(() => {
    if (formData.pipeline_id) {
      supabase.from('pipeline_stages').select('id, name').eq('pipeline_id', formData.pipeline_id).order('sort_order').then(({ data }) => setStages(data || []));
    } else {
      setStages([]);
    }
  }, [formData.pipeline_id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = { ...formData };
    // Remove transient properties not in db
    delete (submitData as any).pipeline_id;

    try {
      if (lead?.id) {
        const { error } = await supabase.from('leads').update({ ...submitData, updated_at: new Date().toISOString() }).eq('id', lead.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('leads').insert(submitData);
        if (error) throw error;
      }
      onClose();
    } catch (err) {
      console.error('Failed to save lead:', err);
    } finally {
      setIsSubmitting(false);
    }
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
                <Select 
                  name="pipeline_id"
                  value={formData.pipeline_id}
                  onChange={(val) => handleSelectChange('pipeline_id', val)}
                  options={[
                    { value: '', label: 'Select Pipeline' },
                    ...pipelines.map(p => ({ value: p.id, label: p.name }))
                  ]}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Stage</label>
                <Select 
                  name="stage_id"
                  value={formData.stage_id}
                  onChange={(val) => handleSelectChange('stage_id', val)}
                  options={[
                    { value: '', label: 'Select Stage' },
                    ...stages.map(s => ({ value: s.id, label: s.name }))
                  ]}
                />
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
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" type="submit" form="lead-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Lead'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
