import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  ArrowLeft, Edit, MoreVertical, Mail, Phone, ExternalLink, 
  GraduationCap, Calendar, FileText, CheckSquare, MessageSquare, Clock 
} from 'lucide-react';
import { useState } from 'react';
import { StudentForm } from './StudentForm';
import styles from './StudentDetailPage.module.css';
import type { Student } from '../../types/students';

// Mock data matching the schema
const mockStudent: Student = {
  id: '1',
  primary_parent_id: '1',
  first_name: 'John',
  last_name: 'Connor',
  date_of_birth: '2012-05-14',
  school_year: 'Year 9',
  key_stage: 'KS3',
  status: 'active',
  tutor_id: '1',
  notes: 'Needs help with Math and Sciences. Very engaged.',
  created_at: '2026-04-09T10:00:00Z',
  updated_at: '2026-04-09T10:00:00Z'
};

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/students')}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>
              {mockStudent.first_name} {mockStudent.last_name}
              <Badge variant={mockStudent.status === 'active' ? 'success' : 'neutral'}>
                {mockStudent.status.charAt(0).toUpperCase() + mockStudent.status.slice(1)}
              </Badge>
            </h1>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem}>
                <GraduationCap size={14} /> {mockStudent.school_year || 'N/A'} ({mockStudent.key_stage || 'N/A'})
              </span>
              {mockStudent.date_of_birth && (
                <span className={styles.metaItem}>
                  <Calendar size={14} /> DOB: {new Date(mockStudent.date_of_birth).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setIsFormOpen(true)}>
            <Edit size={16} /> Edit
          </Button>
          <button className={styles.iconBtn}>
            <MoreVertical size={16} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Left Column - Details */}
        <div className={styles.mainColumn}>
          
          {/* General Info Card */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Overview</h2>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoGroup}>
                <span className={styles.infoLabel}>Internal ID</span>
                <span className={styles.infoValue}>STU-{id || mockStudent.id.substring(0, 4)}</span>
              </div>
              <div className={styles.infoGroup}>
                <span className={styles.infoLabel}>Added</span>
                <span className={styles.infoValue}>
                  {new Date(mockStudent.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {mockStudent.notes && (
              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <span className={styles.infoLabel} style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>Notes</span>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', whiteSpace: 'pre-wrap' }}>
                  {mockStudent.notes}
                </p>
              </div>
            )}
          </Card>

          {/* Links Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
            
            {/* Parent Link */}
            <Card>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Primary Guardian</h2>
              </div>
              <div className={styles.linkedCard} onClick={() => navigate(`/parents/${mockStudent.primary_parent_id}`)} style={{ cursor: 'pointer' }}>
                <div className={styles.linkedAvatar}>SC</div>
                <div className={styles.linkedInfo}>
                  <div className={styles.linkedName}>Sarah Connor</div>
                  <div className={styles.linkedMeta}>
                    <span className={styles.linkedMetaItem}><Mail size={12} /> sarah@example.com</span>
                    <span className={styles.linkedMetaItem}><Phone size={12} /> 07123456789</span>
                  </div>
                </div>
                <button className={styles.linkedAction}><ExternalLink size={16} /></button>
              </div>
            </Card>

            {/* Tutor Link */}
            <Card>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Assigned Tutor</h2>
              </div>
              {mockStudent.tutor_id ? (
                <div className={styles.linkedCard}>
                  <div className={styles.linkedAvatar} style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>DS</div>
                  <div className={styles.linkedInfo}>
                    <div className={styles.linkedName}>Dr. Silberman</div>
                    <div className={styles.linkedMeta}>
                      <span className={styles.linkedMetaItem}>Maths & Science</span>
                      <span className={styles.linkedMetaItem}><Mail size={12} /> silberman@tutors.com</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic' }}>
                  No tutor assigned
                </div>
              )}
            </Card>
          </div>

          {/* Enrolments */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Enrolments</h2>
              <Button variant="secondary" size="sm">Add Enrolment</Button>
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Frequency</th>
                  <th>Schedule</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Mathematics (KS3)</td>
                  <td>Weekly</td>
                  <td>Tuesdays 17:00</td>
                  <td><Badge variant="success">Active</Badge></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Science (KS3)</td>
                  <td>Weekly</td>
                  <td>Thursdays 18:00</td>
                  <td><Badge variant="success">Active</Badge></td>
                </tr>
              </tbody>
            </table>
          </Card>
          
          {/* Contracts/Documents placeholder */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Documents</h2>
              <Button variant="secondary" size="sm">Upload</Button>
            </div>
            <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <FileText size={24} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>No documents uploaded yet.</p>
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className={styles.sideColumn}>
          
          {/* Tasks */}
          <Card noPadding>
            <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)' }}>
              <div className={styles.sectionHeader} style={{ marginBottom: 0 }}>
                <h2 className={styles.sectionTitle} style={{ fontSize: 'var(--font-size-md)' }}>Tasks</h2>
                <button className={styles.iconBtn} style={{ padding: 'var(--spacing-xs)' }}><CheckSquare size={14} /></button>
              </div>
            </div>
            <div className={styles.taskList} style={{ padding: '0 var(--spacing-lg)' }}>
              <div className={styles.taskItem}>
                <input type="checkbox" style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }} />
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>Send term progress report</div>
                  <div className={styles.taskMeta}>Due tomorrow • Assigned to Admin</div>
                </div>
              </div>
              <div className={styles.taskItem}>
                <input type="checkbox" style={{ accentColor: 'var(--brand-primary)', width: '16px', height: '16px' }} />
                <div className={styles.taskContent}>
                  <div className={styles.taskTitle}>Check Math homework completion</div>
                  <div className={styles.taskMeta}><span className={styles.taskMetaWarning}>Overdue</span> • Assigned to Tutor</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Communication Timeline */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'var(--font-size-md)' }}>Recent Activity</h2>
              <button className={styles.iconBtn} style={{ padding: 'var(--spacing-xs)' }}><MessageSquare size={14} /></button>
            </div>
            
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}><Mail size={14} /></div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineTitle}>Term overview sent to Parent</span>
                    <span className={styles.timelineDate}>Today, 10:30 AM</span>
                  </div>
                  <div className={styles.timelineBody}>
                    Automated email sent to Sarah Connor containing KS3 Mathematics syllabus overview.
                  </div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}><Clock size={14} /></div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineTitle}>Lesson Completed</span>
                    <span className={styles.timelineDate}>Yesterday, 18:00</span>
                  </div>
                  <div className={styles.timelineBody}>
                    Mathematics (KS3) lesson with Dr. Silberman marked as completed.
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

      <StudentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        initialData={mockStudent}
      />
    </div>
  );
}
