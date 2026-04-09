import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import styles from './PipelinesListPage.module.css';

// Mock data replacing API call
const mockPipelines = [
  {
    id: '1',
    name: 'Standard Lead Flow',
    entity_type: 'lead',
    is_default: true,
    is_active: true,
    sort_order: 0,
  },
  {
    id: '2',
    name: 'Tutor Onboarding (UK)',
    entity_type: 'tutor_onboarding',
    is_default: true,
    is_active: true,
    sort_order: 1,
  },
  {
    id: '3',
    name: 'Archived Lead Flow',
    entity_type: 'lead',
    is_default: false,
    is_active: false,
    sort_order: 2,
  }
];

const entityTypeLabels: Record<string, string> = {
  lead: 'Leads',
  student_onboarding: 'Student Onboarding',
  tutor_onboarding: 'Tutor Onboarding',
  other: 'Other'
};

export function PipelinesListPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pipelines</h1>
          <p className={styles.subtitle}>Manage workflows and stages for different entities</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/settings/pipelines/new')}>
          Add Pipeline
        </Button>
      </header>

      <Card>
        <CardHeader title="All Pipelines" />
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Entity Type</th>
                  <th>Status</th>
                  <th>Default</th>
                  <th className={styles.actionsCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockPipelines.map(pipeline => (
                  <tr key={pipeline.id}>
                    <td>
                      <div className={styles.pipelineName}>{pipeline.name}</div>
                    </td>
                    <td>
                      <Badge variant="neutral">{entityTypeLabels[pipeline.entity_type] || pipeline.entity_type}</Badge>
                    </td>
                    <td>
                      <StatusBadge 
                        status={pipeline.is_active ? 'active' : 'inactive'} 
                        label={pipeline.is_active ? 'Active' : 'Inactive'} 
                      />
                    </td>
                    <td>
                      {pipeline.is_default && <Badge variant="blue">Default</Badge>}
                    </td>
                    <td className={styles.actionsCell}>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => navigate(`/settings/pipelines/${pipeline.id}`)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
