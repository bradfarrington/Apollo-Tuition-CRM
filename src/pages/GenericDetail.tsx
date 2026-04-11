import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Edit, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './GenericDetail.module.css';

export function GenericDetail({ title = 'Record Detail', type = 'Record' }) {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{title}</h1>
              <Badge variant="success">Active</Badge>
            </div>
            <p className={styles.subtitle}>{type} profile</p>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary">
            <Mail size={16} />
            Message
          </Button>
          <Button variant="primary">
            <Edit size={16} />
            Edit Profile
          </Button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <p>-</p>
                </div>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <p>-</p>
                </div>
                <div className={styles.field}>
                  <label>Phone Number</label>
                  <p>-</p>
                </div>
                <div className={styles.field}>
                  <label>Date of Birth</label>
                  <p>-</p>
                </div>
                <div className={styles.fieldFull}>
                  <label>Notes</label>
                  <p>-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.activityFeed}>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                  No recent activity
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className={styles.sideColumn}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className={styles.quickActions}>
              <Button variant="soft-blue" fullWidth className={styles.sideBtn}>
                Schedule Session
              </Button>
              <Button variant="soft-purple" fullWidth className={styles.sideBtn}>
                Log Interaction
              </Button>
              <Button variant="ghost" fullWidth className={styles.sideBtnText}>
                Generate Initial Invoice
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                No relationships linked
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
