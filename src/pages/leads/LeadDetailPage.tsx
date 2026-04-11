import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Edit2, ArrowRightCircle, Trash2, 
  MessageSquare, PhoneCall, Mail, CheckCircle2,
  User, Calendar, Plus, Pencil, FileText, Briefcase
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { LeadForm } from './LeadForm';
import type { Lead } from '../../types/leads';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { DocumentManager } from '../../components/documents/DocumentManager';
import { useSubjects } from '../../contexts/SubjectsContext';
import { calculateCohortFromYearGroup, getKeyStageForYearGroup } from '../../utils/academicYear';
import styles from './LeadDetailPage.module.css';

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'enquiries' | 'timeline' | 'communications' | 'documents'>('enquiries');
  const [lead, setLead] = useState<Lead | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit_contact' | 'add_enquiry' | 'edit_enquiry'>('edit_contact');
  const [editingEnquiry, setEditingEnquiry] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { activeSubjects } = useSubjects();

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

      // Fetch Enquiries
      const { data: enqData } = await supabase
        .from('enquiries')
        .select('*')
        .eq('lead_id', id)
        .order('created_at', { ascending: false });
        
      if (enqData && enqData.length > 0) {
        // Fetch pipeline placements for these enquiries
        const { data: pcData } = await supabase
          .from('pipeline_cards')
          .select('id, entity_id, pipeline_id, stage_id, pipelines(name), pipeline_stages(name, color)')
          .eq('entity_type', 'enquiry')
          .in('entity_id', enqData.map(e => e.id));
          
        const pcMap = (pcData || []).reduce((acc: any, pc: any) => {
          acc[pc.entity_id] = pc;
          return acc;
        }, {});
        
        setEnquiries(enqData.map((e: any) => ({
          ...e,
          pipeline_card_id: pcMap[e.id]?.id,
          pipeline_id: pcMap[e.id]?.pipeline_id,
          stage_id: pcMap[e.id]?.stage_id,
          pipelines: pcMap[e.id]?.pipelines,
          pipeline_stages: pcMap[e.id]?.pipeline_stages
        })));
      } else {
        setEnquiries([]);
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

  const handleConvertEnquiry = async (enquiry: any) => {
    if (!confirm('Are you sure you want to convert this enquiry into active Students and a Parent?')) return;
    
    try {
      // 1. Create Parent record using the Lead's information
      const nameParts = lead?.parent_name?.split(' ') || ['Unknown'];
      const { data: parent, error: parentError } = await supabase.from('parents').insert({
        first_name: nameParts[0],
        last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
        email: lead?.email,
        phone: lead?.phone,
        status: 'onboarding'
      }).select().single();
      
      if (parentError) throw parentError;

      // 2. Loop through enquiry.students and create Student records
      const students = enquiry.students || [];
      for (const stu of students) {
         const cohort = calculateCohortFromYearGroup(stu.year_group);
         const ks = getKeyStageForYearGroup(stu.year_group);

         const { data: newStudent, error: studentError } = await supabase.from('students').insert({
           first_name: stu.first_name,
           last_name: stu.last_name,
           status: 'onboarding',
           school_year: stu.year_group,
           key_stage: ks === 'N/A' ? null : ks,
           academic_cohort: cohort,
           primary_parent_id: parent.id
         }).select().single();

         if (studentError) { console.error('Error creating student:', studentError); continue; }
         
         // 3. Handle Subjects
         if (stu.subjects && stu.subjects.length > 0) {
            const matchedSubjects = activeSubjects.filter(sub => stu.subjects.includes(sub.name));
            if (matchedSubjects.length > 0) {
              const links = matchedSubjects.map(sub => ({
                student_id: newStudent.id,
                subject_id: sub.id
              }));
              await supabase.from('student_subjects').insert(links);
            }
         }
      }

      // 4. Mark Enquiry as Won
      await supabase.from('enquiries').update({ status: 'won' }).eq('id', enquiry.id);
      
      // Update Pipeline Card to move to the last stage (optional, depending on business logic)
      
      alert('Enquiry successfully converted!');
      fetchLead(); // refresh
    } catch (err) {
      console.error(err);
      alert('Failed to convert enquiry.');
    }
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

          {/* Tabs Bar & Actions */}
          <div className={styles.tabsBar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-1)', marginBottom: '-1px' }}>
            <button 
              className={`${styles.tab} ${activeTab === 'enquiries' ? styles.active : ''}`}
              onClick={() => setActiveTab('enquiries')}
            >
              <Briefcase size={15} />
              Enquiries
              <span className={styles.tabCount}>{enquiries.length}</span>
            </button>
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

            <div className={styles.panelActions} style={{ paddingBottom: '8px' }}>
              <Button variant="secondary" onClick={() => { setFormMode('edit_contact'); setIsFormOpen(true); }}>
                <Edit2 size={15} />
                Edit
              </Button>
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(true)} style={{ color: '#ef4444' }}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>

          {/* Tab Content Card */}
          <div className={styles.tabCard}>
            {activeTab === 'enquiries' && (
              <div className={styles.tabCardBody} style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <Button variant="primary" onClick={() => { setFormMode('add_enquiry'); setEditingEnquiry(null); setIsFormOpen(true); }}>
                    <Plus size={16} style={{ marginRight: '8px' }} />
                    New Enquiry
                  </Button>
                </div>
                {enquiries.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                    No enquiries recorded. Use the "New Enquiry" button above to add one.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {enquiries.map(enq => (
                      <div 
                        key={enq.id} 
                        style={{ 
                          border: '1px solid var(--color-border)', 
                          borderLeft: `4px solid ${enq.pipeline_stages?.color || 'var(--color-border-strong)'}`,
                          borderRadius: 'var(--radius-md)', 
                          padding: '16px', 
                          background: enq.pipeline_stages?.color ? `${enq.pipeline_stages.color}0A` : '#f8fafc',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px'
                        }}
                        onClick={() => { setFormMode('edit_enquiry'); setEditingEnquiry(enq); setIsFormOpen(true); }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = enq.pipeline_stages?.color || 'var(--color-primary-light)';
                          e.currentTarget.style.background = enq.pipeline_stages?.color ? `${enq.pipeline_stages.color}15` : '#f1f5f9';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.borderLeftColor = enq.pipeline_stages?.color || 'var(--color-border-strong)';
                          e.currentTarget.style.background = enq.pipeline_stages?.color ? `${enq.pipeline_stages.color}0A` : '#f8fafc';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                             <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '14px' }}>
                               {enq.pipelines?.name || 'No Pipeline'} · <span style={{ color: 'var(--color-primary)' }}>{enq.pipeline_stages?.name || 'No Stage'}</span>
                             </div>
                             <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                               Added {new Date(enq.created_at).toLocaleDateString()}
                             </div>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8, fontWeight: 500, background: 'var(--color-primary-light)20', padding: '4px 8px', borderRadius: '12px' }}>
                             <Pencil size={12} /> Edit
                          </span>
                        </div>
                        
                        {enq.message && (
                          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                            "{enq.message}"
                          </div>
                        )}

                        {enq.students && enq.students.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                             {enq.students.map((stu: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', border: '1px solid var(--color-border)', borderRadius: '100px', padding: '3px 8px', background: 'var(--color-background-elevated)' }}>
                                   <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{stu.first_name}</span>
                                   {stu.year_group && <span style={{ color: 'var(--color-text-tertiary)' }}>• {stu.year_group}</span>}
                                   {stu.subjects && stu.subjects.length > 0 && <span style={{ color: 'var(--color-text-tertiary)' }}>• {stu.subjects.join(', ')}</span>}
                                </div>
                             ))}
                          </div>
                        )}

                        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                           {enq.status === 'won' ? (
                             <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#10b981', padding: '8px', background: '#ecfdf5', borderRadius: 'var(--radius-md)' }}>
                               <CheckCircle2 size={16} /> Converted
                             </span>
                           ) : (
                             <Button variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center', background: 'var(--color-background-elevated)' }} onClick={(e) => { e.stopPropagation(); handleConvertEnquiry(enq); }}>
                                Convert to Students
                             </Button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className={styles.tabCardBody} style={{ padding: 'var(--spacing-6)' }}>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                  No activity recorded
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
                  <button className={styles.sortBtn} onClick={() => { setFormMode('edit_contact'); setIsFormOpen(true); }}><Edit2 size={13} /> Edit</button>
                </div>
              </div>
              <div className={styles.sectionCardBody}>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><User size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Contact Name</div>
                    <div className={styles.fieldRowValue}>{lead.parent_name}</div>
                  </div>
                  <button className={styles.fieldRowEdit} onClick={() => { setFormMode('edit_contact'); setIsFormOpen(true); }}><Pencil size={13} /></button>
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><Calendar size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Enquiry Type</div>
                    <div className={styles.fieldRowValue}>{lead.enquiry_type || '-'}</div>
                  </div>
                  <button className={styles.fieldRowEdit} onClick={() => { setFormMode('edit_contact'); setIsFormOpen(true); }}><Pencil size={13} /></button>
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
                  <div style={{ padding: '16px 20px', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                    No tasks
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <LeadForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
        lead={lead} 
        mode={formMode}
        editingEnquiry={editingEnquiry}
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
