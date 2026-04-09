import { Input } from '../ui/Input';
import styles from './DynamicCustomFields.module.css';

export interface CustomFieldDefinition {
  api_key: string;
  label: string;
  field_type: string;
  is_required: boolean;
  options_json?: string[];
}

export interface DynamicCustomFieldsProps {
  fields: CustomFieldDefinition[];
  values: Record<string, any>;
  onChange: (api_key: string, value: any) => void;
}

export function DynamicCustomFields({ fields, values, onChange }: DynamicCustomFieldsProps) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className={styles.dynamicFieldsGrid}>
      {fields.map((field) => {
        const value = values[field.api_key] || '';

        switch (field.field_type) {
          case 'textarea':
            return (
              <div key={field.api_key} className={`${styles.fieldWrapper} ${styles.fullWidth}`}>
                <label className={styles.label}>
                  {field.label} {field.is_required && <span className={styles.required}>*</span>}
                </label>
                <textarea
                  className={styles.textarea}
                  value={value}
                  onChange={(e) => onChange(field.api_key, e.target.value)}
                  required={field.is_required}
                />
              </div>
            );
          
          case 'select':
            return (
              <div key={field.api_key} className={styles.fieldWrapper}>
                 <label className={styles.label}>
                  {field.label} {field.is_required && <span className={styles.required}>*</span>}
                </label>
                <select
                  className={styles.select}
                  value={value}
                  onChange={(e) => onChange(field.api_key, e.target.value)}
                  required={field.is_required}
                >
                  <option value="" disabled>Select {field.label}...</option>
                  {field.options_json?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );

          case 'checkbox':
            return (
              <div key={field.api_key} className={`${styles.fieldWrapper} ${styles.checkboxWrapper}`}>
                <input 
                  type="checkbox"
                  id={field.api_key}
                  checked={!!value}
                  onChange={(e) => onChange(field.api_key, e.target.checked)}
                  required={field.is_required}
                />
                <label htmlFor={field.api_key}>{field.label}</label>
              </div>
            );

          case 'number':
          case 'date':
          case 'text':
          default:
            return (
              <div key={field.api_key} className={styles.fieldWrapper}>
                <Input
                  label={`${field.label} ${field.is_required ? '*' : ''}`}
                  type={field.field_type === 'text' ? 'text' : field.field_type}
                  value={value}
                  onChange={(e) => onChange(field.api_key, e.target.value)}
                  required={field.is_required}
                  fullWidth
                />
              </div>
            );
        }
      })}
    </div>
  );
}
