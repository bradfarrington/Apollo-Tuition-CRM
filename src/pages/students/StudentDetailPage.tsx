import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRelativeTime } from '../../lib/dateUtils';
import { 
  Edit2, Plus, Trash2, Mail, GraduationCap, 
  FileText, MoreVertical, Calendar,
  ChevronRight, User, Pencil,
  CheckCircle2, Briefcase, X, MessageSquare, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Student } from '../../types/students';
import type { Task } from '../../types/tasks';
import { StudentForm } from './StudentForm';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { useSubjects } from '../../contexts/SubjectsContext';
import { getAcademicDetailsFromCohort } from '../../utils/academicYear';
import { DocumentManager } from '../../components/documents/DocumentManager';
import styles from './StudentDetailPage.module.css';

// Note type for the student's educational notes
interface StudentNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'enrolments' | 'documents' | 'communications' | 'tasks' | 'notes'>('enrolments');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { subjects } = useSubjects();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ isOpen: false, title: '', message: '', type: 'info' });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // ---- Fetch Student from Supabase ----
  const fetchStudent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*, parents(first_name, last_name), tutors(first_name, last_name), student_subjects(subject_id)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch student:', error);
      setLoading(false);
      return;
    }

    setStudent({
      ...data,
      primary_parent_name: data.parents ? `${data.parents.first_name} ${data.parents.last_name}` : undefined,
      assigned_tutor_name: data.tutors ? `${data.tutors.first_name} ${data.tutors.last_name}` : undefined,
      subject_ids: (data.student_subjects || []).map((ss: any) => ss.subject_id),
    });

    // Fetch Tasks
    const { data: taskData } = await supabase
      .from('tasks')
      .select(`
        *, 
        task_stages(name, color),
        assignee:profiles!tasks_assigned_to_fkey(full_name)
      `)
      .eq('related_type', 'student')
      .eq('related_id', id)
      .order('created_at', { ascending: false });
    setTasks(taskData || []);

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  // ---- Notes from Supabase ----
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; editingNote?: StudentNote }>({
    isOpen: false,
  });
  const [noteFormTitle, setNoteFormTitle] = useState('');
  const [noteFormContent, setNoteFormContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from('student_notes')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch notes:', error);
      return;
    }
    setNotes(data || []);
  }, [id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const openAddNote = () => {
    setNoteFormTitle('');
    setNoteFormContent('');
    setNoteModal({ isOpen: true });
  };

  const openEditNote = (note: StudentNote) => {
    setNoteFormTitle(note.title);
    setNoteFormContent(note.content);
    setNoteModal({ isOpen: true, editingNote: note });
  };

  const handleSaveNote = async () => {
    if (!noteFormTitle.trim() && !noteFormContent.trim()) return;
    if (noteModal.editingNote) {
      const { error } = await supabase
        .from('student_notes')
        .update({ title: noteFormTitle.trim(), content: noteFormContent.trim(), updated_at: new Date().toISOString() })
        .eq('id', noteModal.editingNote.id);
      if (error) console.error('Failed to update note:', error);
    } else {
      const { error } = await supabase
        .from('student_notes')
        .insert({ student_id: id, title: noteFormTitle.trim() || 'Untitled Note', content: noteFormContent.trim() });
      if (error) console.error('Failed to add note:', error);
    }
    setNoteModal({ isOpen: false });
    fetchNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from('student_notes').delete().eq('id', noteId);
    if (error) console.error('Failed to delete note:', error);
    setDeletingNoteId(null);
    fetchNotes();
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchStudent(); // Refetch student data after edit
  };

  if (loading || !student) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--color-text-tertiary)' }}>
        {loading ? 'Loading student...' : 'Student not found.'}
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!id) return;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete student:', error);
      setAlertConfig({ isOpen: true, title: 'Error', message: 'Failed to delete student.', type: 'error' });
    } else {
      navigate('/students');
    }
  };

  // Resolve student's subjects from context
  const studentSubjects = (student.subject_ids || []).map(sid => subjects.find(s => s.id === sid)).filter(Boolean);

  const initials = `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`;

  const academicInfo = student.academic_cohort 
    ? getAcademicDetailsFromCohort(student.academic_cohort) 
    : { yearGroup: student.school_year || 'Unknown Year', keyStage: student.key_stage || 'Unknown Key Stage' };

  return (
    <div className={styles.container}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/students">Students</Link>
        <ChevronRight size={14} className={styles.breadcrumbSeparator} />
        <span className={styles.breadcrumbCurrent}>{student.first_name} {student.last_name}</span>
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
            <h1 className={styles.profileName}>{student.first_name} {student.last_name}</h1>
            <div className={styles.profileSubtitle}>
              <span className={`${styles.statusDot} ${styles[student.status] || styles.inactive}`} />
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)} Student
            </div>

            {/* Quick Action Icon Buttons */}
            <div className={styles.quickActionIcons}>
              <button className={styles.iconBtn} data-tooltip="Email Parent">
                <Mail size={16} />
              </button>
              <button className={`${styles.iconBtn} ${styles.primary}`} data-tooltip="Enrol">
                <Plus size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="More">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Academic Info */}
          <div className={styles.contactFields}>
            <div className={styles.contactFieldsLabel}>Academic Profile</div>
            
            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><GraduationCap size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{academicInfo.yearGroup}</span>
                <span className={styles.contactFieldHint}>Academic Year</span>
              </div>
            </div>

            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><BookOpen size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{academicInfo.keyStage}</span>
                <span className={styles.contactFieldHint}>Key Stage</span>
              </div>
            </div>

            {/* Subjects */}
            {studentSubjects.length > 0 && (
              <div className={styles.contactField} style={{ alignItems: 'flex-start' }}>
                <div className={styles.contactFieldIcon}><BookOpen size={14} /></div>
                <div className={styles.contactFieldText}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {studentSubjects.map((s) => (
                      <span
                        key={s!.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: s!.colour + '22',
                          color: s!.colour,
                        }}
                      >
                        {s!.name}
                      </span>
                    ))}
                  </div>
                  <span className={styles.contactFieldHint}>Subjects</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.panelDivider} />

          {/* Metadata */}
          <div className={styles.metadataSection}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date of Birth</span>
              <span className={styles.metaValue}>
                {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-GB') : '-'}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date Added</span>
              <span className={styles.metaValue}>
                {new Date(student.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Last Connected</span>
              <span className={styles.metaValue}>
                {getRelativeTime(student.updated_at)}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.metaValue}>
                <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'error' : 'warning'}>
                  {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                </Badge>
              </span>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Core Relationships */}
          <div className={styles.metadataSection} style={{ paddingTop: 'var(--spacing-4)' }}>
            <div className={styles.contactFieldsLabel} style={{ marginBottom: '0' }}>Core Relationships</div>
            
             <Link to={`/parents/${student.primary_parent_id}`} style={{ textDecoration: 'none' }}>
                <div className={styles.contactField} style={{ margin: 0 }}>
                    <div className={styles.contactFieldIcon} style={{ background: 'var(--color-pastel-purple)', color: 'var(--color-pastel-purple-strong)' }}><User size={14} /></div>
                    <div className={styles.contactFieldText}>
                        <span style={{ color: 'var(--color-text-primary)' }}>{student.primary_parent_name || 'Parent'}</span>
                        <span className={styles.contactFieldHint}>Primary Guardian</span>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                </div>
            </Link>

            {student.tutor_id && (
                <Link to={`/tutors/${student.tutor_id}`} style={{ textDecoration: 'none' }}>
                    <div className={styles.contactField} style={{ margin: 0 }}>
                        <div className={styles.contactFieldIcon} style={{ background: 'var(--color-pastel-blue)', color: 'var(--color-pastel-blue-strong)' }}><Briefcase size={14} /></div>
                        <div className={styles.contactFieldText}>
                            <span style={{ color: 'var(--color-text-primary)' }}>{student.assigned_tutor_name || 'Tutor'}</span>
                            <span className={styles.contactFieldHint}>Assigned Tutor</span>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                </Link>
            )}
          </div>
        </aside>

        {/* ========== RIGHT CONTENT PANEL ========== */}
        <div className={styles.contentPanel}>

          {/* Header */}
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{student.first_name}'s Profile</h2>
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
              className={`${styles.tab} ${activeTab === 'enrolments' ? styles.active : ''}`}
              onClick={() => setActiveTab('enrolments')}
            >
              <GraduationCap size={15} />
              Enrolments
              <span className={styles.tabCount}>0</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'documents' ? styles.active : ''}`}
              onClick={() => setActiveTab('documents')}
            >
              <FileText size={15} />
              Documents
              <span className={styles.tabCount}>0</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'communications' ? styles.active : ''}`}
              onClick={() => setActiveTab('communications')}
            >
              <MessageSquare size={15} />
              Activity Stream
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
              {notes.length > 0 && <span className={styles.tabCount}>{notes.length}</span>}
            </button>
          </div>

          {/* Main Content Layout */}
          <div className={styles.bottomGrid}>

          {/* Tab Content Card */}
          <div className={styles.tabCard} style={{ marginBottom: 0 }}>
            {activeTab === 'enrolments' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Active Enrolments
                    <span className={styles.tabCount}>0</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <button className={styles.filterBtn}><Plus size={13} /> Add</button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                    No enrolments yet
                  </div>
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <div style={{ padding: 'var(--spacing-6)' }}>
                <DocumentManager entityType="student" entityId={student.id} />
              </div>
            )}

            {activeTab === 'communications' && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <MessageSquare size={24} />
                </div>
                <p className={styles.emptyStateText}>No activity recorded</p>
              </div>
            )}

            {activeTab === 'notes' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Educational Notes
                    <span className={styles.tabCount}>{notes.length}</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <Button variant="secondary" size="sm" onClick={openAddNote}>
                      <Plus size={14} />
                      Add Note
                    </Button>
                  </div>
                </div>
                <div className={styles.tabCardBody} style={{ padding: 0 }}>
                  {notes.length === 0 ? (
                    <div className={styles.notesEmpty}>
                      <FileText size={24} />
                      <p>No notes yet</p>
                      <span>Click "Add Note" to create one.</span>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className={styles.noteItem}>
                        <div className={styles.noteItemHeader}>
                          <h4 className={styles.noteItemTitle}>{note.title}</h4>
                          <div className={styles.noteItemActions}>
                            <button
                              className={styles.noteActionBtn}
                              onClick={() => openEditNote(note)}
                              title="Edit note"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              className={`${styles.noteActionBtn} ${styles.noteActionBtnDanger}`}
                              onClick={() => setDeletingNoteId(note.id)}
                              title="Delete note"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className={styles.noteItemContent}>{note.content}</p>
                        <span className={styles.noteItemTimestamp}>
                          {new Date(note.updated_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                          {note.updated_at !== note.created_at && ' (edited)'}
                        </span>
                      </div>
                    ))
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

      <StudentForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
        initialData={student}
      />

      {/* ---- Note Add/Edit Modal ---- */}
      {noteModal.isOpen && (
        <div className={styles.noteModalOverlay} onClick={() => setNoteModal({ isOpen: false })}>
          <div className={styles.noteModalPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.noteModalHeader}>
              <h3 className={styles.noteModalTitle}>
                {noteModal.editingNote ? 'Edit Note' : 'Add Note'}
              </h3>
              <button className={styles.noteModalClose} onClick={() => setNoteModal({ isOpen: false })}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.noteModalBody}>
              <div className={styles.noteModalField}>
                <label className={styles.noteModalLabel}>Title</label>
                <input
                  type="text"
                  className={styles.noteModalInput}
                  placeholder="E.g. Learning Requirements"
                  value={noteFormTitle}
                  onChange={(e) => setNoteFormTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={styles.noteModalField}>
                <label className={styles.noteModalLabel}>Content</label>
                <textarea
                  className={styles.noteModalTextarea}
                  placeholder="Write your note here..."
                  value={noteFormContent}
                  onChange={(e) => setNoteFormContent(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            <div className={styles.noteModalFooter}>
              <Button variant="secondary" onClick={() => setNoteModal({ isOpen: false })}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveNote} disabled={!noteFormTitle.trim() && !noteFormContent.trim()}>
                {noteModal.editingNote ? 'Save Changes' : 'Add Note'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Note Delete Confirmation ---- */}
      {deletingNoteId && (
        <div className={styles.noteModalOverlay} onClick={() => setDeletingNoteId(null)}>
          <div className={styles.noteDeleteDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.noteDeleteTitle}>Delete Note</h3>
            <p className={styles.noteDeleteText}>
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className={styles.noteDeleteActions}>
              <Button variant="secondary" onClick={() => setDeletingNoteId(null)}>Cancel</Button>
              <button className={styles.noteDeleteConfirmBtn} onClick={() => handleDeleteNote(deletingNoteId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone and will remove all associated data."
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
        onUpdate={() => fetchStudent()}
        task={editingTask}
        prefilledRelatedType="student"
        prefilledRelatedId={student.id}
      />
    </div>
  );
}

// Needed for custom icon usage locally
function BookOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
