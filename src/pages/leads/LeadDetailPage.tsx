import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit2, ArrowRightCircle, Trash2, MessageSquare, PhoneCall, Mail, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Lead } from '../../types/leads';
import styles from './LeadDetailPage.module.css';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'timeline' | 'communications'>('timeline');

  // Mock data for preview
  const lead: Lead = {
    id: id || '1',
    parent_name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '07123456789',
    enquiry_type: 'Math Tutoring',
    message: 'Looking for a math tutor for my son John (Year 9). He needs help catching up with algebra before his upcoming mocks.',
    status: 'open',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:00:00Z',
    pipeline_stage: { id: 's1', pipeline_id: 'p1', name: 'New Enquiry', color: '#3b82f6', sort_order: 1, is_active: true },
    owner: { id: 'u1', full_name: 'John Doe', email: 'john@example.com', role: 'admin' }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/leads" className={styles.backLink}>
            <ChevronLeft size={16} />
            Back to Leads
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{lead.parent_name}</h1>
            <span style={{ backgroundColor: `${lead.pipeline_stage?.color}20`, color: lead.pipeline_stage?.color, borderColor: `${lead.pipeline_stage?.color}40`, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: '1px solid', whiteSpace: 'nowrap' }}>
              {lead.pipeline_stage?.name}
            </span>
            <Badge variant={lead.status === 'won' ? 'success' : lead.status === 'lost' ? 'error' : 'neutral'}>
              {lead.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary">
            <Edit2 size={16} />
            Edit
          </Button>
          <Button variant="secondary" style={{ color: 'var(--color-danger)' }}>
            <Trash2 size={16} />
          </Button>
          <Button variant="primary">
            <ArrowRightCircle size={16} />
            Convert Lead
          </Button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        
        {/* Left Column (Overview & Timeline) */}
        <div className={styles.overviewSection}>
          
          <Card>
            <h2 className={styles.sectionTitle}>Overview</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}><a href={`mailto:${lead.email}`}>{lead.email}</a></span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}><a href={`tel:${lead.phone}`}>{lead.phone}</a></span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Enquiry Type</span>
                <span className={styles.detailValue}>{lead.enquiry_type}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Owner</span>
                <span className={styles.detailValue}>{lead.owner?.full_name || 'Unassigned'}</span>
              </div>
            </div>
            
            {lead.message && (
              <div className={styles.messageBox}>
                <strong>Initial Message:</strong><br />
                <span style={{ color: 'var(--color-foreground-muted)' }}>{lead.message}</span>
              </div>
            )}
          </Card>

          <Card>
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                Activity Timeline
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'communications' ? styles.active : ''}`}
                onClick={() => setActiveTab('communications')}
              >
                Communications (0)
              </button>
            </div>

            {activeTab === 'timeline' && (
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>
                    <MessageSquare size={14} />
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineTitle}>Lead created from Web Form</span>
                      <span className={styles.timelineDate}>Today, 10:00 AM</span>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-foreground-muted)' }}>
                      System updated stage to New Enquiry
                    </span>
                  </div>
                </div>
                
                {/* Manual Add Note input could go here */}
              </div>
            )}
            {activeTab === 'communications' && (
              <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
                No communications logged yet.
              </div>
            )}
          </Card>
          
        </div>

        {/* Right Column (Tasks & Actions) */}
        <div className={styles.actionSection}>
          
          <Card>
            <h2 className={styles.sectionTitle}>
              Tasks
              <Button variant="secondary" size="sm">Add</Button>
            </h2>
            <div className={styles.taskItem}>
              <input type="checkbox" className={styles.taskCheckbox} />
              <div className={styles.taskInfo}>
                <span className={styles.taskTitle}>Initial Follow-up Call</span>
                <span className={styles.taskMeta}>Due Tomorrow • Assigned to {lead.owner?.full_name}</span>
              </div>
            </div>
            <div className={styles.taskItem}>
               <input type="checkbox" className={styles.taskCheckbox} disabled checked />
              <div className={styles.taskInfo}>
                <span className={styles.taskTitle} style={{ textDecoration: 'line-through', color: 'var(--color-foreground-muted)' }}>Assign Owner</span>
                <span className={styles.taskMeta}>Completed Today</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <PhoneCall size={16} /> Log a Call
              </Button>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Mail size={16} /> Send Email
              </Button>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <CheckCircle2 size={16} /> Change Stage
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
