import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowLeft, Edit, Mail, Calendar } from 'lucide-react';
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
                  <p>Alice Smith</p>
                </div>
                <div className={styles.field}>
                  <label>Email Address</label>
                  <p>alice.smith@example.com</p>
                </div>
                <div className={styles.field}>
                  <label>Phone Number</label>
                  <p>+44 7700 900077</p>
                </div>
                <div className={styles.field}>
                  <label>Date of Birth</label>
                  <p>May 15, 2010</p>
                </div>
                <div className={styles.fieldFull}>
                  <label>Notes</label>
                  <p>Prefers online sessions during the weekends. Needs focus on A-Level Mathematics.</p>
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
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <Calendar size={14} />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>Attended Mathematics Session</p>
                    <span className={styles.activityTime}>2 days ago</span>
                  </div>
                </div>
                <div className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <Mail size={14} />
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>Contract signed by parent</p>
                    <span className={styles.activityTime}>1 week ago</span>
                  </div>
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
              <div className={styles.relation}>
                <div className={styles.relationAvatar}>SM</div>
                <div>
                  <p className={styles.relationName}>Sarah Smith</p>
                  <p className={styles.relationType}>Parent / Guardian</p>
                </div>
              </div>
              <div className={styles.relation}>
                <div className={styles.relationAvatar}>RJ</div>
                <div>
                  <p className={styles.relationName}>Robert Jones</p>
                  <p className={styles.relationType}>Assigned Tutor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
