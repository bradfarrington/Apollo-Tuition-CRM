import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Badge } from '../../../components/ui/Badge';
import styles from './PipelinesListPage.module.css';

export function PipelinesListPage() {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('pipelines').select('*').order('sort_order');
      if (error) console.error('Failed to fetch pipelines:', error);
      else setPipelines(data || []);
      setLoading(false);
    })();
  }, []);

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
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-tertiary)' }}>Loading...</td></tr>
                ) : pipelines.map(pipeline => (
                  <tr key={pipeline.id}>
                    <td>
                      <div className={styles.pipelineName}>{pipeline.name}</div>
                    </td>
                    <td>
                      <Badge variant="neutral">{pipeline.entity_type || '-'}</Badge>
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
