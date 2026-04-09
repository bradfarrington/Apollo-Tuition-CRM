import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Plus, Filter, MoreVertical, 
  Users, UserCheck, GraduationCap, Clock, ArrowUpDown
} from 'lucide-react';
import type { Student } from '../../types/students';
import { StudentForm } from './StudentForm';
import { useSubjects } from '../../contexts/SubjectsContext';
import { supabase } from '../../lib/supabase';
import { getAcademicDetailsFromCohort } from '../../utils/academicYear';
import styles from './StudentsListPage.module.css';

export function StudentsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { subjects } = useSubjects();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select('*, parents(first_name, last_name), tutors(first_name, last_name), student_subjects(subject_id)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch students:', error);
      setLoading(false);
      return;
    }

    // Map joined data into flat Student shape
    const mapped: Student[] = (data || []).map((row: any) => ({
      ...row,
      primary_parent_name: row.parents
        ? `${row.parents.first_name} ${row.parents.last_name}`
        : undefined,
      assigned_tutor_name: row.tutors
        ? `${row.tutors.first_name} ${row.tutors.last_name}`
        : undefined,
      subject_ids: (row.student_subjects || []).map((ss: any) => ss.subject_id),
    }));

    setStudents(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Resolve subject details from context by IDs
  const resolveSubjects = (ids?: string[]) => {
    if (!ids || ids.length === 0) return [];
    return ids.map(id => subjects.find(s => s.id === id)).filter(Boolean) as typeof subjects;
  };

  const handleRowClick = (id: string) => {
    navigate(`/students/${id}`);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchStudents(); // Refetch after add/edit
  };

  // Filter by search
  const filtered = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(term) ||
      s.last_name.toLowerCase().includes(term) ||
      (s.academic_cohort 
        ? getAcademicDetailsFromCohort(s.academic_cohort).yearGroup.toLowerCase()
        : (s.school_year || '').toLowerCase()).includes(term) ||
      (s.academic_cohort
        ? getAcademicDetailsFromCohort(s.academic_cohort).keyStage.toLowerCase()
        : (s.key_stage || '').toLowerCase()).includes(term) ||
      (s.primary_parent_name || '').toLowerCase().includes(term)
    );
  });

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const onboardingStudents = students.filter(s => s.status === 'onboarding').length;
  const totalEnrolments = students.reduce((sum, s) => sum + (s.active_enrolments_count || 0), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Students</h1>
          <p className={styles.subtitle}>Manage student profiles, tracking, and enrolments.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Add Student
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.statCardIcon}><Users size={18} /></div>
          <span className={styles.statCardValue}>{totalStudents}</span>
          <span className={styles.statCardLabel}>Total Students</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={styles.statCardIcon}><UserCheck size={18} /></div>
          <span className={styles.statCardValue}>{activeStudents}</span>
          <span className={styles.statCardLabel}>Active Students</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPink}`}>
          <div className={styles.statCardIcon}><Clock size={18} /></div>
          <span className={styles.statCardValue}>{onboardingStudents}</span>
          <span className={styles.statCardLabel}>Onboarding</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={styles.statCardIcon}><GraduationCap size={18} /></div>
          <span className={styles.statCardValue}>{totalEnrolments}</span>
          <span className={styles.statCardLabel}>Active Enrolments</span>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search by name, school year..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.toolbarRight}>
            <button className={styles.toolbarBtn}>
              <ArrowUpDown size={13} /> Sort
            </button>
            <button className={styles.toolbarBtn}>
              <Filter size={13} /> Filters
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Level / Stage</th>
                <th>Primary Parent</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading students...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No students found.</td></tr>
              ) : (
                filtered.map((student) => {
                  const initials = `${student.first_name.charAt(0)}${student.last_name.charAt(0)}`;
                  return (
                    <tr key={student.id} onClick={() => handleRowClick(student.id)}>
                      <td>
                        <div className={styles.nameCell}>
                          <div className={styles.avatarSmall}>{initials}</div>
                          <div className={styles.nameText}>
                            <span className={styles.primaryName}>{student.first_name} {student.last_name}</span>
                            <div className={styles.contactLine}>
                              <span className={styles.contactMeta}>
                                <GraduationCap size={11} /> {student.active_enrolments_count || 0} active enrolments
                              </span>
                            </div>
                            {(() => {
                              const resolved = resolveSubjects(student.subject_ids);
                              return resolved.length > 0 ? (
                                <div className={styles.subjectBadges}>
                                  {resolved.map((s) => (
                                    <span
                                      key={s.id}
                                      className={styles.subjectBadge}
                                      style={{
                                        backgroundColor: s.colour + '22',
                                        color: s.colour,
                                      }}
                                    >
                                      {s.name}
                                    </span>
                                  ))}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td>
                        {(() => {
                          const yearInfo = student.academic_cohort 
                            ? getAcademicDetailsFromCohort(student.academic_cohort)
                            : { yearGroup: student.school_year || '-', keyStage: student.key_stage || '-' };
                          
                          return (
                            <>
                              <div className={styles.primaryName}>{yearInfo.yearGroup}</div>
                              <div className={styles.contactMeta}>{yearInfo.keyStage}</div>
                            </>
                          );
                        })()}
                      </td>
                      <td>{student.primary_parent_name || '-'}</td>
                      <td>
                        <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'error' : student.status === 'onboarding' ? 'warning' : 'neutral'}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </Badge>
                      </td>
                      <td className={styles.mutedCell}>
                        {new Date(student.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className={styles.actionsCol}>
                        <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); }}>
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filtered.length} of {filtered.length} records</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>

      <StudentForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
}
