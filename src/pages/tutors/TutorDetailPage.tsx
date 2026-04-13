import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Edit2, Plus, Trash2, Mail, GraduationCap, 
  FileText, MoreVertical, Phone, Copy, MapPin,
  ChevronRight, User, CheckCircle2, MessageSquare, Briefcase,
  Calendar, AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Tutor } from '../../types/tutors';
import type { Task } from '../../types/tasks';
import { TutorForm } from './TutorForm';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { AlertModal } from '../../components/ui/AlertModal';
import styles from './TutorDetailPage.module.css';

export function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'enrolments' | 'documents' | 'tasks' | 'notes'>('students');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ isOpen: false, title: '', message: '', type: 'info' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Mock related data for now
  const mockStudents: any[] = [];
  const mockEnrolments: any[] = [];
  const mockDocuments: any[] = [];

  const fetchTutor = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase.from('tutors').select('*').eq('id', id).single();
    if (error) console.error('Failed to fetch tutor:', error);
    else setTutor(data);

    // Fetch Tasks
    const { data: taskData } = await supabase
      .from('tasks')
      .select(`
        *, 
        task_stages(name, color),
        assignee:profiles!tasks_assigned_to_fkey(full_name)
      `)
      .eq('related_type', 'tutor')
      .eq('related_id', id)
      .order('created_at', { ascending: false });
    setTasks(taskData || []);

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
      setAlertConfig({ isOpen: true, title: 'Error', message: 'Failed to delete tutor.', type: 'error' });
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
            <button 
              className={`${styles.tab} ${activeTab === 'tasks' ? styles.active : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              <CheckCircle2 size={15} />
              Tasks
              {tasks.length > 0 && <span className={styles.tabCount}>{tasks.length}</span>}
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'notes' ? styles.active : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FileText size={15} />
              Notes
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className={styles.bottomGrid}>

          {/* Tab Content Card */}
          <div className={styles.tabCard} style={{ marginBottom: 0 }}>
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

            {activeTab === 'notes' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Internal Notes
                  </h3>
                  <div className={styles.tabCardActions}>
                    <button className={styles.filterBtn} onClick={() => setIsFormOpen(true)}><Edit2 size={13} /> Edit Tutor</button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  {tutor.notes ? (
                    <div style={{ padding: '24px' }}>
                      <div className={styles.notesBox} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                        {tutor.notes}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                      No notes recorded.
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'tasks' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Tasks
                    <span className={styles.tabCount}>{tasks.length}</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <Button variant="secondary" size="sm" onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}>
                      <Plus size={14} />
                      Add Task
                    </Button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  {tasks.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                      No tasks
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {tasks.map(task => {
                        const priorityColors: Record<string, { color: string, bg: string, label: string }> = {
                          urgent: { color: '#dc2626', bg: '#fef2f2', label: 'Urgent' },
                          high: { color: '#ea580c', bg: '#fff7ed', label: 'High' },
                          medium: { color: '#2563eb', bg: '#eff6ff', label: 'Medium' },
                          low: { color: '#16a34a', bg: '#f0fdf4', label: 'Low' }
                        };
                        const pConf = task.priority ? (priorityColors[task.priority] || priorityColors.medium) : null;
                        return (
                          <div 
                            key={task.id} 
                            style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: 'pointer', transition: 'background-color 0.15s ease' }} 
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                          >
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                              <div style={{ marginTop: '2px', color: task.task_stages?.color || 'var(--color-text-tertiary)', flexShrink: 0 }}>
                                <CheckCircle2 size={18} />
                              </div>
                              <div style={{ minWidth: 0, paddingRight: '16px' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: task.description ? '4px' : '0' }}>{task.title}</div>
                                {task.description && (
                                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                                    {task.description}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>
                              {task.task_stages && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: task.task_stages.color || 'var(--color-text-secondary)', background: task.task_stages.color ? `${task.task_stages.color}1A` : 'var(--color-bg-base)', padding: '2px 8px', borderRadius: '12px' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: task.task_stages.color || 'var(--color-text-tertiary)' }} />
                                  {task.task_stages.name}
                                </div>
                              )}
                              {task.due_date && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '12px' }}>
                                  <Calendar size={11} />
                                  {new Date(task.due_date).toLocaleDateString()}
                                </div>
                              )}
                              {task.assignee?.full_name && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#6366f1', background: '#e0e7ff', padding: '2px 8px', borderRadius: '12px' }}>
                                  <User size={11} />
                                  {task.assignee.full_name}
                                </div>
                              )}
                              {pConf && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: pConf.color, background: pConf.bg, padding: '2px 8px', borderRadius: '12px' }}>
                                  {task.priority === 'urgent' && <AlertCircle size={10} />}
                                  {pConf.label}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

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
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onUpdate={() => fetchTutor()}
        task={editingTask}
        prefilledRelatedType="tutor"
        prefilledRelatedId={tutor.id}
      />
    </div>
  );
}
