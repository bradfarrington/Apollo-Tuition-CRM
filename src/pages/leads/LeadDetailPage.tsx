import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Edit2, ArrowRightCircle, Trash2, 
  MessageSquare, PhoneCall, Mail, CheckCircle2,
  User, Calendar, Plus, Pencil, FileText
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { LeadForm } from './LeadForm';
import type { Lead } from '../../types/leads';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { DocumentManager } from '../../components/documents/DocumentManager';
import styles from './LeadDetailPage.module.css';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'timeline' | 'communications' | 'documents'>('timeline');
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchLead = useCallback(async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*, pipeline_stages(*), profiles!leads_owner_id_fkey(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        // Fallback without profile join if FK is missing locally
        const { data: fallback, error: err2 } = await supabase
          .from('leads')
          .select('*, pipeline_stages(*)')
          .eq('id', id)
          .single();
        if (err2) console.error('Failed to fetch lead:', err2);
        else setLead({ ...fallback, pipeline_stage: fallback.pipeline_stages || undefined });
      } else {
        setLead({ ...data, pipeline_stage: data.pipeline_stages || undefined, owner: data.profiles || undefined });
      }
      setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchLead();
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  if (loading || !lead) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--color-text-tertiary)' }}>
        {loading ? 'Loading lead...' : 'Lead not found.'}
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!id) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead.');
    } else {
      navigate('/leads');
    }
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/leads">Leads</Link>
        <ChevronRight size={14} className={styles.breadcrumbSeparator} />
        <span className={styles.breadcrumbCurrent}>{lead.parent_name}</span>
      </nav>

      {/* Split Layout */}
      <div className={styles.splitLayout}>

        {/* ========== LEFT PROFILE PANEL ========== */}
        <aside className={styles.profilePanel}>
          <div className={styles.profileBanner}>
             <div className={styles.profileBannerAccent} />
          </div>

          <div className={styles.profileIdentity}>
            <div className={styles.avatar}>{getInitials(lead.parent_name || 'U')}</div>
            <h1 className={styles.profileName}>{lead.parent_name}</h1>
            <div className={styles.profileSubtitle}>
              <span className={`${styles.statusDot} ${lead.status === 'won' ? styles.active : lead.status === 'lost' ? styles.inactive : styles.onboarding}`} />
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)} Lead
            </div>

            {/* Quick Action Icon Buttons */}
            <div className={styles.quickActionIcons}>
              <button className={styles.iconBtn} data-tooltip="Email">
                <Mail size={16} />
              </button>
              <button className={`${styles.iconBtn} ${styles.primary}`} data-tooltip="Call">
                <PhoneCall size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="Convert">
                <ArrowRightCircle size={16} />
              </button>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Contact Information */}
          <div className={styles.contactFields}>
            <div className={styles.contactFieldsLabel}>Contact Preferences</div>
            
            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><Mail size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{lead.email || '-'}</span>
                <span className={styles.contactFieldHint}>Email Account</span>
              </div>
            </div>

            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><PhoneCall size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{lead.phone || '-'}</span>
                <span className={styles.contactFieldHint}>Primary Phone</span>
              </div>
            </div>
            
            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><CheckCircle2 size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{lead.enquiry_type || '-'}</span>
                <span className={styles.contactFieldHint}>Enquiry Type</span>
              </div>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Metadata */}
          <div className={styles.metadataSection}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Pipeline Stage</span>
              <span className={styles.metaValue}>
                {lead.pipeline_stage ? (
                    <span style={{ backgroundColor: `${lead.pipeline_stage.color}20`, color: lead.pipeline_stage.color, padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        {lead.pipeline_stage.name}
                    </span>
                ) : '-'}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Assigned Team Member</span>
              <span className={styles.metaValue}>{lead.owner?.full_name || 'Unassigned'}</span>
            </div>
            
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date Added</span>
              <span className={styles.metaValue}>
                {new Date(lead.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

        </aside>

        {/* ========== RIGHT CONTENT PANEL ========== */}
        <div className={styles.contentPanel}>

          {/* Header */}
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Lead Profile</h2>
            <div className={styles.panelActions}>
              <Button variant="secondary" onClick={() => setIsFormOpen(true)}>
                <Edit2 size={15} />
                Edit
              </Button>
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(true)} style={{ color: '#ef4444' }}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>

          {/* Tabs Bar */}
          <div className={styles.tabsBar}>
            <button 
              className={`${styles.tab} ${activeTab === 'timeline' ? styles.active : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <MessageSquare size={15} />
              Activity Timeline
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'communications' ? styles.active : ''}`}
              onClick={() => setActiveTab('communications')}
            >
              <Mail size={15} />
              Communications
              <span className={styles.tabCount}>0</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FileText size={15} />
              Documents
            </button>
          </div>

          {/* Tab Content Card */}
          <div className={styles.tabCard}>
            {activeTab === 'timeline' && (
              <div className={styles.tabCardBody} style={{ padding: 'var(--spacing-6)' }}>
                {/* Timeline UI */}
                <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-pastel-blue)', color: 'var(--color-pastel-blue-strong)' }}>
                       <MessageSquare size={14} />
                     </div>
                     <div>
                       <div style={{ fontWeight: 500 }}>Lead created from Web Form</div>
                       <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>Today, 10:00 AM • System updated stage to New Enquiry</div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communications' && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Mail size={24} />
                </div>
                <p className={styles.emptyStateText}>No communications recorded</p>
              </div>
            )}

            {activeTab === 'documents' && (
              <div style={{ padding: 'var(--spacing-6)' }}>
                <DocumentManager entityType="lead" entityId={lead.id} />
              </div>
            )}
          </div>

          {/* Bottom Grid: Detailed Info + Tasks */}
          <div className={styles.bottomGrid}>

            {/* Detailed Information */}
            <div className={`${styles.sectionCard} ${styles.sectionCardBlue}`}>
              <div className={styles.sectionCardHeader}>
                <h3 className={styles.sectionCardTitle}>
                  <span className={styles.sectionCardTitleIcon}><User size={14} /></span>
                  Detailed Information
                </h3>
                <div className={styles.sectionCardActions}>
                  <button className={styles.sortBtn} onClick={() => setIsFormOpen(true)}><Edit2 size={13} /> Edit</button>
                </div>
              </div>
              <div className={styles.sectionCardBody}>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><User size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Contact Name</div>
                    <div className={styles.fieldRowValue}>{lead.parent_name}</div>
                  </div>
                  <button className={styles.fieldRowEdit} onClick={() => setIsFormOpen(true)}><Pencil size={13} /></button>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><Calendar size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Enquiry Type</div>
                    <div className={styles.fieldRowValue}>{lead.enquiry_type || '-'}</div>
                  </div>
                  <button className={styles.fieldRowEdit} onClick={() => setIsFormOpen(true)}><Pencil size={13} /></button>
                </div>
                
                {lead.message && (
                  <div className={styles.fieldRow} style={{ alignItems: 'flex-start' }}>
                    <div className={styles.fieldRowIcon}><MessageSquare size={14} /></div>
                    <div className={styles.fieldRowContent}>
                      <div className={styles.fieldRowLabel}>Initial Message</div>
                      <div className={styles.fieldRowValue} style={{ marginTop: '4px', whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{lead.message}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tasks & Notes Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

              {/* Tasks */}
              <div className={`${styles.sectionCard} ${styles.sectionCardGreen}`}>
                <div className={styles.sectionCardHeader}>
                  <h3 className={styles.sectionCardTitle}>
                    <span className={styles.sectionCardTitleIcon}><CheckCircle2 size={14} /></span>
                    Tasks
                  </h3>
                  <Button variant="secondary" size="sm">
                    <Plus size={14} />
                    Add
                  </Button>
                </div>
                <div className={styles.sectionCardBody}>
                  <div className={styles.taskItem}>
                    <input type="checkbox" className={styles.taskCheckbox} />
                    <div className={styles.taskInfo}>
                      <span className={styles.taskTitle}>Initial Follow-up Call</span>
                      <span className={styles.taskMeta}>Due Tomorrow • Assigned to {lead.owner?.full_name || 'Team Member'}</span>
                    </div>
                  </div>
                  <div className={styles.taskItem}>
                    <input type="checkbox" className={styles.taskCheckbox} checked readOnly />
                    <div className={styles.taskInfo}>
                       <span className={styles.taskTitle} style={{ textDecoration: 'line-through', color: 'var(--color-text-tertiary)' }}>Assign Team Member</span>
                      <span className={styles.taskMeta}>Completed Today</span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <LeadForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        lead={lead as any}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone and will remove all associated data."
      />
    </div>
  );
}
