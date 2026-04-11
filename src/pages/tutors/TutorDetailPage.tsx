import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Edit2, Plus, Trash2, Mail, GraduationCap, 
  FileText, MoreVertical, Phone, Copy, MapPin,
  ChevronRight, User, Pencil, CheckCircle2, MessageSquare, Briefcase
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Tutor } from '../../types/tutors';
import { TutorForm } from './TutorForm';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import styles from './TutorDetailPage.module.css';

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'enrolments' | 'documents'>('students');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock related data for now
  const mockStudents: any[] = [];
  const mockEnrolments: any[] = [];
  const mockDocuments: any[] = [];
  const mockTasks: any[] = [];

  const fetchTutor = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase.from('tutors').select('*').eq('id', id).single();
    if (error) console.error('Failed to fetch tutor:', error);
    else setTutor(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchTutor(); }, [fetchTutor]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchTutor();
  };

  if (loading || !tutor) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--color-text-tertiary)' }}>
        {loading ? 'Loading tutor...' : 'Tutor not found.'}
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!id) return;
    const { error } = await supabase.from('tutors').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete tutor:', error);
      alert('Failed to delete tutor.');
    } else {
      navigate('/tutors');
    }
  };

  // Quick fallback since first_name can contain title
  const rawFirstName = tutor.first_name.replace('Dr. ', '');
  const initials = `${rawFirstName.charAt(0)}${tutor.last_name.charAt(0)}`;

  const getContractStatusBadgeId = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'terminated': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div className={styles.container}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/tutors">Tutors</Link>
        <ChevronRight size={14} className={styles.breadcrumbSeparator} />
        <span className={styles.breadcrumbCurrent}>{tutor.first_name} {tutor.last_name}</span>
      </nav>

      {/* Split Layout */}
      <div className={styles.splitLayout}>

        {/* ========== LEFT PROFILE PANEL ========== */}
        <aside className={styles.profilePanel}>
          <div className={styles.profileBanner}>
            <div className={styles.profileBannerAccent} />
          </div>

          <div className={styles.profileIdentity}>
            <div className={styles.avatar}>{initials}</div>
            <h1 className={styles.profileName}>{tutor.first_name} {tutor.last_name}</h1>
            <div className={styles.profileSubtitle}>
              <span className={`${styles.statusDot} ${styles[tutor.active_status] || styles.inactive}`} />
              {tutor.active_status.charAt(0).toUpperCase() + tutor.active_status.slice(1)} Tutor
            </div>

            {/* Quick Action Icon Buttons */}
            <div className={styles.quickActionIcons}>
              <button className={styles.iconBtn} data-tooltip="Call">
                <Phone size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="Message">
                <MessageSquare size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="Email">
                <Mail size={16} />
              </button>
              <button className={`${styles.iconBtn} ${styles.primary}`} data-tooltip="Assign">
                <Briefcase size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="More">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Contact Info */}
          <div className={styles.contactFields}>
            <div className={styles.contactFieldsLabel}>Contact Info</div>
            
            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><Mail size={14} /></div>
              <div className={styles.contactFieldText}>
                <a href={`mailto:${tutor.email}`}>{tutor.email}</a>
              </div>
              <button className={styles.copyBtn} title="Copy email"><Copy size={13} /></button>
            </div>

            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><Phone size={14} /></div>
              <div className={styles.contactFieldText}>
                <a href={`tel:${tutor.phone}`}>{tutor.phone}</a>
              </div>
              <button className={styles.copyBtn} title="Copy phone"><Copy size={13} /></button>
            </div>

            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><MapPin size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{tutor.address_line_1}, {tutor.city}</span>
              </div>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Metadata */}
          <div className={styles.metadataSection}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Contract Status</span>
              <span className={styles.metaValue}>
                <Badge variant={getContractStatusBadgeId(tutor.contract_status)}>
                  {tutor.contract_status.charAt(0).toUpperCase() + tutor.contract_status.slice(1)} Contract
                </Badge>
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date Added</span>
              <span className={styles.metaValue}>
                {new Date(tutor.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </aside>

        {/* ========== RIGHT CONTENT PANEL ========== */}
        <div className={styles.contentPanel}>

          {/* Header */}
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{tutor.first_name}'s Profile</h2>
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
              className={`${styles.tab} ${activeTab === 'students' ? styles.active : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <GraduationCap size={15} />
              Students
              <span className={styles.tabCount}>{mockStudents.length}</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'enrolments' ? styles.active : ''}`}
              onClick={() => setActiveTab('enrolments')}
            >
              <Briefcase size={15} />
              Enrolments
              <span className={styles.tabCount}>{mockEnrolments.length}</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FileText size={15} />
              Documents
              <span className={styles.tabCount}>{mockDocuments.length}</span>
            </button>
          </div>

          {/* Tab Content Card */}
          <div className={styles.tabCard}>
            {activeTab === 'students' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Assigned Students
                    <span className={styles.tabCount}>{mockStudents.length}</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <button className={styles.filterBtn}><Plus size={13} /> Assign</button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  {mockStudents.length === 0 ? <p className={styles.emptyStateText} style={{padding: '20px', textAlign: 'center'}}>No students assigned.</p> : mockStudents.map(student => (
                    <div className={styles.linkedItem} key={student.id}>
                      <div className={styles.linkedItemLeft}>
                        <div className={`${styles.linkedItemAvatar} ${styles.student}`}>
                          <GraduationCap size={18} />
                        </div>
                        <div className={styles.linkedItemContent}>
                          <span className={styles.linkedItemTitle}>{student.name}</span>
                          <span className={styles.linkedItemMeta}>{student.year} • {student.subject}</span>
                        </div>
                      </div>
                      <div className={styles.linkedItemRight}>
                        <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'enrolments' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Active Enrolments
                    <span className={styles.tabCount}>{mockEnrolments.length}</span>
                  </h3>
                </div>
                <div className={styles.tabCardBody}>
                  {mockEnrolments.length === 0 ? <p className={styles.emptyStateText} style={{padding: '20px', textAlign: 'center'}}>No enrolments.</p> : mockEnrolments.map(enrol => (
                    <div className={styles.linkedItem} key={enrol.id}>
                      <div className={styles.linkedItemLeft}>
                        <div className={`${styles.linkedItemAvatar} ${styles.comm}`}> {/* Re-using comm style for purple icon */}
                          <Briefcase size={18} />
                        </div>
                        <div className={styles.linkedItemContent}>
                          <span className={styles.linkedItemTitle}>{enrol.subject}</span>
                          <span className={styles.linkedItemMeta}>{enrol.student} • {enrol.frequency} at {enrol.rate}/hr</span>
                        </div>
                      </div>
                      <div className={styles.linkedItemRight}>
                        <Badge variant={enrol.status === 'active' ? 'success' : 'neutral'}>{enrol.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Documents & Contracts
                    <span className={styles.tabCount}>{mockDocuments.length}</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <button className={styles.filterBtn}><Plus size={13} /> Upload</button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  {mockDocuments.length === 0 ? <p className={styles.emptyStateText} style={{padding: '20px', textAlign: 'center'}}>No documents.</p> : mockDocuments.map(doc => (
                    <div className={styles.linkedItem} key={doc.id}>
                      <div className={styles.linkedItemLeft}>
                        <div className={`${styles.linkedItemAvatar} ${styles.document}`}>
                          <FileText size={18} />
                        </div>
                        <div className={styles.linkedItemContent}>
                          <span className={styles.linkedItemTitle}>{doc.name}</span>
                          <span className={styles.linkedItemMeta}>{doc.type} • {doc.date}</span>
                        </div>
                      </div>
                      <div className={styles.linkedItemRight}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: doc.status === 'Signed' || doc.status === 'Valid' ? 'var(--color-pastel-green-strong)' : 'var(--color-text-tertiary)' }}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bottom Grid: Detailed Info + Tasks */}
          <div className={styles.bottomGrid}>

            {/* Detailed Information (Jewellery CRM style) */}
            <div className={`${styles.sectionCard} ${styles.sectionCardPurple}`}>
              <div className={styles.sectionCardHeader}>
                <h3 className={styles.sectionCardTitle}>
                  <span className={styles.sectionCardTitleIcon}><User size={14} /></span>
                  Detailed Information
                </h3>
                <div className={styles.sectionCardActions}>
                  <button className={styles.sortBtn}><Edit2 size={13} /> Edit</button>
                </div>
              </div>
              <div className={styles.sectionCardBody}>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><User size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>First Name</div>
                    <div className={styles.fieldRowValue}>{tutor.first_name}</div>
                  </div>
                  <button className={styles.fieldRowEdit}><Pencil size={13} /></button>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><User size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Last Name</div>
                    <div className={styles.fieldRowValue}>{tutor.last_name}</div>
                  </div>
                  <button className={styles.fieldRowEdit}><Pencil size={13} /></button>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><Mail size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Email</div>
                    <div className={styles.fieldRowValue}><a href={`mailto:${tutor.email}`}>{tutor.email}</a></div>
                  </div>
                  <button className={styles.fieldRowEdit}><Pencil size={13} /></button>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><Phone size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Phone Number</div>
                    <div className={styles.fieldRowValue}><a href={`tel:${tutor.phone}`}>{tutor.phone}</a></div>
                  </div>
                  <button className={styles.fieldRowEdit}><Pencil size={13} /></button>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldRowIcon}><MapPin size={14} /></div>
                  <div className={styles.fieldRowContent}>
                    <div className={styles.fieldRowLabel}>Address</div>
                    <div className={styles.fieldRowValue}>
                      {tutor.address_line_1}, {tutor.city}, {tutor.postal_code}
                    </div>
                  </div>
                  <button className={styles.fieldRowEdit}><Pencil size={13} /></button>
                </div>
              </div>
            </div>

            {/* Tasks & Notes Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

              {/* Notes */}
              {tutor.notes && (
                <div className={`${styles.sectionCard} ${styles.sectionCardPink}`}>
                  <div className={styles.sectionCardHeader}>
                    <h3 className={styles.sectionCardTitle}>
                      <span className={styles.sectionCardTitleIcon}><FileText size={14} /></span>
                      Internal Notes
                    </h3>
                    <button className={styles.sortBtn}><Edit2 size={13} /> Edit</button>
                  </div>
                  <div className={styles.sectionCardBody}>
                    <div className={styles.notesBox}>
                      {tutor.notes}
                    </div>
                  </div>
                </div>
              )}

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
                  {mockTasks.length === 0 ? <p className={styles.emptyStateText} style={{padding: '10px 20px', color: 'var(--color-text-tertiary)'}}>No tasks.</p> : mockTasks.map(task => (
                    <div className={styles.taskItem} key={task.id}>
                      <input type="checkbox" className={styles.taskCheckbox} />
                      <div className={styles.taskInfo}>
                        <span className={styles.taskTitle}>{task.title}</span>
                        <span className={styles.taskMeta}>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TutorForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
        tutor={tutor as any}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Tutor"
        message="Are you sure you want to delete this tutor? This action cannot be undone and will remove all associated data."
      />
    </div>
  );
}
