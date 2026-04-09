import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import { CustomFieldForm } from './CustomFieldForm';
import styles from './CustomFieldsListPage.module.css';

const mockCustomFields = [
  { id: '1', entity_type: 'lead', label: 'Dietary Requirements', api_key: 'dietary_requirements', field_type: 'textarea', is_required: false, is_active: true },
  { id: '2', entity_type: 'student', label: 'Medical Conditions', api_key: 'medical_conditions', field_type: 'textarea', is_required: false, is_active: true },
  { id: '3', entity_type: 'tutor', label: 'Subject Specialties', api_key: 'subject_specialties', field_type: 'multiselect', is_required: true, is_active: true },
  { id: '4', entity_type: 'parent', label: 'Preferred Contact Time', api_key: 'preferred_contact_time', field_type: 'select', is_required: false, is_active: true }
];

const entityTypeLabels: Record<string, string> = {
  lead: 'Lead',
  parent: 'Parent',
  student: 'Student',
  tutor: 'Tutor',
  enrolment: 'Enrolment'
};

export function CustomFieldsListPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');

  const filteredFields = selectedEntityFilter === 'all' 
    ? mockCustomFields 
    : mockCustomFields.filter(f => f.entity_type === selectedEntityFilter);

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
                      <Badge variant="neutral">{entityTypeLabels[field.entity_type] || field.entity_type}</Badge>
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
