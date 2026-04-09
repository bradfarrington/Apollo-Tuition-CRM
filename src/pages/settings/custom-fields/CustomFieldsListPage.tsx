import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { CustomFieldForm } from './CustomFieldForm';
import styles from './CustomFieldsListPage.module.css';

export function CustomFieldsListPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('custom_fields').select('*').order('entity_type');
      if (error) console.error('Failed to fetch custom fields:', error);
      else setCustomFields(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  const filteredFields = selectedEntityFilter === 'all' 
    ? customFields 
    : customFields.filter(f => f.entity_type === selectedEntityFilter);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Custom Fields</h1>
          <p className={styles.subtitle}>Define dynamic data points for your CRM entities</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          Add Custom Field
        </Button>
      </header>

      <Card>
        <CardHeader 
          title="Field Definitions" 
          action={
            <select 
              className={styles.filterSelect}
              value={selectedEntityFilter}
              onChange={(e) => setSelectedEntityFilter(e.target.value)}
            >
              <option value="all">All Entities</option>
              <option value="lead">Leads</option>
              <option value="parent">Parents</option>
              <option value="student">Students</option>
              <option value="tutor">Tutors</option>
            </select>
          }
        />
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>API Key</th>
                  <th>Entity</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Status</th>
                  <th className={styles.actionsCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFields.map(field => (
                  <tr key={field.id}>
                    <td>
                      <div className={styles.fieldLabel}>{field.label}</div>
                    </td>
                    <td>
                      <code className={styles.apiKey}>{field.api_key}</code>
                    </td>
                    <td>
                      <Badge variant="neutral">{(field.entity_type || '').charAt(0).toUpperCase() + (field.entity_type || '').slice(1)}</Badge>
                    </td>
                    <td>
                       {field.field_type}
                    </td>
                    <td>
                       {field.is_required ? 'Yes' : 'No'}
                    </td>
                    <td>
                      <StatusBadge 
                        status={field.is_active ? 'active' : 'inactive'} 
                        label={field.is_active ? 'Active' : 'Inactive'} 
                      />
                    </td>
                    <td className={styles.actionsCell}>
                      <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(true)}>Edit</Button>
                    </td>
                  </tr>
                ))}
                {filteredFields.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      No custom fields found for the selected entity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isFormOpen && (
        <CustomFieldForm onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}
