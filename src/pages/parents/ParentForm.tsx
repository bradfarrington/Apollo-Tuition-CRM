import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import styles from '../../components/ui/SlideoverForm.module.css';

interface ParentFormProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string; // If provided, we're in edit mode
}

export function ParentForm({ isOpen, onClose, parentId }: ParentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentData, setParentData] = useState<any>(null);
  const [leadSourceOptions, setLeadSourceOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch lead sources
      supabase.from('lead_sources').select('name').eq('is_active', true).order('sort_order').then(({ data }) => {
        setLeadSourceOptions((data || []).map(s => ({ value: s.name, label: s.name })));
      });

      if (parentId) {
        supabase.from('parents').select('*').eq('id', parentId).single().then(({ data }) => setParentData(data));
      } else {
        setParentData(null);
      }
    }
  }, [isOpen, parentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const data = {
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('last_name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value || null,
      secondary_email: (form.elements.namedItem('secondary_email') as HTMLInputElement).value || null,
      secondary_phone: (form.elements.namedItem('secondary_phone') as HTMLInputElement).value || null,
      preferred_contact_method: (form.elements.namedItem('preferred_contact_method') as HTMLSelectElement).value,
      relationship_to_student: (form.elements.namedItem('relationship_to_student') as HTMLSelectElement).value || null,
      occupation: (form.elements.namedItem('occupation') as HTMLInputElement).value || null,
      employer: (form.elements.namedItem('employer') as HTMLInputElement).value || null,
      address_line_1: (form.elements.namedItem('address_line_1') as HTMLInputElement).value || null,
      city: (form.elements.namedItem('city') as HTMLInputElement).value || null,
      county: (form.elements.namedItem('county') as HTMLInputElement).value || null,
      postal_code: (form.elements.namedItem('postal_code') as HTMLInputElement).value || null,
      billing_address_line_1: (form.elements.namedItem('billing_address_line_1') as HTMLInputElement).value || null,
      billing_city: (form.elements.namedItem('billing_city') as HTMLInputElement).value || null,
      billing_postal_code: (form.elements.namedItem('billing_postal_code') as HTMLInputElement).value || null,
      referral_source: (form.elements.namedItem('referral_source') as HTMLInputElement).value || null,
      how_heard: (form.elements.namedItem('how_heard') as HTMLSelectElement).value || null,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      status: (form.elements.namedItem('status') as HTMLSelectElement).value,
    };

    if (parentId) {
      const { error } = await supabase.from('parents').update({ ...data, updated_at: new Date().toISOString() }).eq('id', parentId);
      if (error) console.error('Error updating parent:', error);
    } else {
      const { error } = await supabase.from('parents').insert(data);
      if (error) console.error('Error inserting parent:', error);
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>{parentId ? 'Edit Parent / Guardian' : 'Add New Parent / Guardian'}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {parentId && !parentData ? (
           <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <form id="parent-form" onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Personal Details</h3>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>First Name *</label>
                  <Input name="first_name" defaultValue={parentData?.first_name} placeholder="e.g. Sarah" required />
                </div>
                <div>
                  <label className={styles.label}>Last Name *</label>
                  <Input name="last_name" defaultValue={parentData?.last_name} placeholder="e.g. Connor" required />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Relationship to Student</label>
                  <Select 
                    id="relationship_to_student"
                    defaultValue={parentData?.relationship_to_student || ''}
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'Mother', label: 'Mother' },
                      { value: 'Father', label: 'Father' },
                      { value: 'Guardian', label: 'Guardian' },
                      { value: 'Grandparent', label: 'Grandparent' },
                      { value: 'Step-parent', label: 'Step-parent' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>
                <div>
                  <label className={styles.label}>Occupation</label>
                  <Input name="occupation" defaultValue={parentData?.occupation} placeholder="e.g. Teacher" />
                </div>
              </div>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className={styles.label}>Employer</label>
                <Input name="employer" defaultValue={parentData?.employer} placeholder="e.g. Acme Corp" />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Contact Information</h3>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Email Address *</label>
                  <Input name="email" type="email" defaultValue={parentData?.email} placeholder="sarah@example.com" required />
                </div>
                <div>
                  <label className={styles.label}>Phone Number</label>
                  <Input name="phone" type="tel" defaultValue={parentData?.phone} placeholder="07123 456789" />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Secondary Email</label>
                  <Input name="secondary_email" type="email" defaultValue={parentData?.secondary_email} placeholder="work@example.com" />
                </div>
                <div>
                  <label className={styles.label}>Secondary Phone</label>
                  <Input name="secondary_phone" type="tel" defaultValue={parentData?.secondary_phone} placeholder="Alternative number" />
                </div>
              </div>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className={styles.label}>Preferred Contact Method</label>
                <Select 
                    id="preferred_contact_method"
                    defaultValue={parentData?.preferred_contact_method || 'email'}
                    options={[
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'sms', label: 'SMS' }
                  ]}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Home Address</h3>
              <div>
                <label className={styles.label}>Address Line 1</label>
                <Input name="address_line_1" defaultValue={parentData?.address_line_1} placeholder="123 Street Name" />
              </div>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Town/City</label>
                  <Input name="city" defaultValue={parentData?.city} placeholder="London" />
                </div>
                <div>
                  <label className={styles.label}>County</label>
                  <Input name="county" defaultValue={parentData?.county} placeholder="Greater London" />
                </div>
              </div>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Postal Code</label>
                  <Input name="postal_code" defaultValue={parentData?.postal_code} placeholder="SW1A 1AA" />
                </div>
                <div></div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Billing Address (if different)</h3>
              <div>
                <label className={styles.label}>Address Line 1</label>
                <Input name="billing_address_line_1" defaultValue={parentData?.billing_address_line_1} placeholder="Billing address..." />
              </div>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Town/City</label>
                  <Input name="billing_city" defaultValue={parentData?.billing_city} />
                </div>
                <div>
                  <label className={styles.label}>Postal Code</label>
                  <Input name="billing_postal_code" defaultValue={parentData?.billing_postal_code} />
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Referral & Source</h3>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>How Did They Hear About Us?</label>
                  <Select 
                    id="how_heard"
                    defaultValue={parentData?.how_heard || ''}
                    options={[
                      { value: '', label: 'Select...' },
                      ...leadSourceOptions
                    ]}
                  />
                </div>
                <div>
                  <label className={styles.label}>Referral Source</label>
                  <Input name="referral_source" defaultValue={parentData?.referral_source} placeholder="e.g. Referred by John Smith" />
                </div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Additional Info</h3>
              <div>
                <label className={styles.label}>Notes</label>
                <textarea 
                  name="notes"
                  className={styles.textareaInput} 
                  defaultValue={parentData?.notes}
                  placeholder="Any additional information..."
                ></textarea>
              </div>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className={styles.label}>Status</label>
                  <Select 
                    id="status"
                    defaultValue={parentData?.status || 'active'}
                    options={[
                      { value: 'prospective', label: 'Prospective' },
                      { value: 'onboarding', label: 'Onboarding' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' }
                  ]}
                />
              </div>
            </div>

          </form>
        )}

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="parent-form" disabled={isSubmitting || (parentId && !parentData)}>
            {isSubmitting ? 'Saving...' : 'Save Parent'}
          </Button>
        </div>
      </div>
    </div>
  );
}
