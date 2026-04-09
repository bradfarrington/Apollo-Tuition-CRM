import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import styles from './CustomFieldForm.module.css';

interface CustomFieldFormProps {
  onClose: () => void;
  // In a real app we'd pass initialData for editing
}

export function CustomFieldForm({ onClose }: CustomFieldFormProps) {
  const [fieldType, setFieldType] = useState('text');
  const [options, setOptions] = useState<string[]>(['']);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic automatic conversion to api_key
    const generatedApiKey = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');
    const apiKeyInput = document.getElementById('api_key') as HTMLInputElement;
    if (apiKeyInput && !apiKeyInput.dataset.touched) {
      apiKeyInput.value = generatedApiKey;
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index: number) => {
    if (options.length === 1) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.slideOver}>
        <header className={styles.header}>
          <h2 className={styles.title}>Add Custom Field</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <main className={styles.content}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Entity Type</label>
            <Select 
              defaultValue="lead"
              options={[
                { value: 'lead', label: 'Lead' },
                { value: 'parent', label: 'Parent' },
                { value: 'student', label: 'Student' },
                { value: 'tutor', label: 'Tutor' },
                { value: 'enrolment', label: 'Enrolment' }
              ]}
            />
          </div>

          <div className={styles.formGroup}>
            <Input 
              id="label"
              label="Field Label" 
              placeholder="e.g. Dietary Requirements" 
              fullWidth 
              onChange={handleLabelChange}
            />
          </div>

          <div className={styles.formGroup}>
            <Input 
              id="api_key"
              label="API Key" 
              placeholder="e.g. dietary_requirements" 
              fullWidth 
              onFocus={(e) => { e.currentTarget.dataset.touched = 'true'; }}
            />
            <span className={styles.helpText}>Used internally. Must be unique per entity.</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Field Type</label>
            <Select 
              value={fieldType} 
              onChange={setFieldType}
              options={[
                { value: 'text', label: 'Text (Short)' },
                { value: 'textarea', label: 'Textarea (Long)' },
                { value: 'number', label: 'Number' },
                { value: 'date', label: 'Date' },
                { value: 'select', label: 'Dropdown Select' },
                { value: 'multiselect', label: 'Multi-Select' },
                { value: 'checkbox', label: 'Checkbox (Boolean)' }
              ]}
            />
          </div>

          {(fieldType === 'select' || fieldType === 'multiselect') && (
            <div className={styles.optionsSection}>
               <label className={styles.label}>Options</label>
               {options.map((option, idx) => (
                 <div key={idx} className={styles.optionRow}>
                   <Input 
                     value={option}
                     onChange={(e) => handleOptionChange(idx, e.target.value)}
                     placeholder="Option text..."
                     fullWidth
                   />
                   <button 
                     type="button"
                     className={styles.removeOptionBtn} 
                     onClick={() => removeOption(idx)}
                     disabled={options.length === 1}
                   >
                     ×
                   </button>
                 </div>
               ))}
               <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                 + Add Option
               </Button>
            </div>
          )}

          <div className={styles.checkboxGroup}>
            <input type="checkbox" id="is_required" />
            <label htmlFor="is_required">This field is required</label>
          </div>
          <div className={styles.checkboxGroup}>
            <input type="checkbox" id="is_active" defaultChecked />
            <label htmlFor="is_active">Active</label>
          </div>
        </main>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Save Field</Button>
        </footer>
      </div>
    </div>
  );
}
