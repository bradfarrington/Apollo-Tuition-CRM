import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import styles from '../../components/ui/SlideoverForm.module.css';
import { useEffect, useState } from 'react';
import type { Student } from '../../types/students';
import { useSubjects } from '../../contexts/SubjectsContext';
import { supabase } from '../../lib/supabase';
import { getAcademicDetailsFromCohort, calculateCohortFromYearGroup, getKeyStageForYearGroup } from '../../utils/academicYear';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Student;
}

export function StudentForm({ isOpen, onClose, initialData }: StudentFormProps) {
  const { activeSubjects } = useSubjects();
  const [isVisible, setIsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    initialData?.subject_ids || []
  );

  // Dynamic academic fields
  const [schoolYear, setSchoolYear] = useState<string>('');
  const [keyStage, setKeyStage] = useState<string>('');

  // Dynamic parent/tutor options from DB
  const [parentOptions, setParentOptions] = useState<{ value: string; label: string }[]>([]);
  const [tutorOptions, setTutorOptions] = useState<{ value: string; label: string }[]>([]);

  // New enriched fields
  const [gender, setGender] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [learningNeeds, setLearningNeeds] = useState('');
  const [goals, setGoals] = useState('');
  const [availability, setAvailability] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setSelectedSubjectIds(initialData?.subject_ids || []);

      if (initialData?.academic_cohort) {
         const { yearGroup, keyStage: ks } = getAcademicDetailsFromCohort(initialData.academic_cohort);
         setSchoolYear(yearGroup !== 'Unknown' && yearGroup !== 'Graduated' ? yearGroup : '');
         setKeyStage(ks !== 'N/A' ? ks : '');
      } else {
         setSchoolYear(initialData?.school_year || '');
         setKeyStage(initialData?.key_stage || '');
      }

      // Set new fields
      setGender(initialData?.gender || '');
      setSchoolName(initialData?.school_name || '');
      setLearningNeeds(initialData?.learning_needs || '');
      setGoals(initialData?.goals || '');
      setAvailability(initialData?.availability || '');
      setMedicalNotes(initialData?.medical_notes || '');

      // Fetch parents and tutors for dropdowns
      supabase.from('parents').select('id, first_name, last_name').order('first_name').then(({ data }) => {
        setParentOptions((data || []).map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` })));
      });
      supabase.from('tutors').select('id, first_name, last_name').order('first_name').then(({ data }) => {
        setTutorOptions((data || []).map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` })));
      });
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData]);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    // Read form values from DOM (uncontrolled inputs)
    const getValue = (id: string) => {
      const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
      return el?.value || '';
    };

    const firstName = getValue('first_name').trim();
    const lastName = getValue('last_name').trim();
    if (!firstName || !lastName) return;

    const year = schoolYear || null;
    const ks = keyStage || null;
    const cohort = calculateCohortFromYearGroup(year);

    const studentData = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: getValue('date_of_birth') || null,
      status: (getValue('status') as Student['status']) || 'active',
      school_year: year,
      key_stage: ks,
      academic_cohort: cohort,
      primary_parent_id: getValue('primary_parent_id') || null,
      tutor_id: getValue('tutor_id') || null,
      gender: gender || null,
      school_name: schoolName || null,
      learning_needs: learningNeeds || null,
      goals: goals || null,
      availability: availability || null,
      medical_notes: medicalNotes || null,
    };

    setSaving(true);

    try {
      let studentId = initialData?.id;

      if (initialData) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update({ ...studentData, updated_at: new Date().toISOString() })
          .eq('id', initialData.id);
        if (error) throw error;
      } else {
        // Insert new student
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert(studentData)
          .select('id')
          .single();
        if (error) throw error;
        studentId = newStudent.id;
      }

      // Sync student_subjects junction table
      if (studentId) {
        // Delete existing subject links
        await supabase.from('student_subjects').delete().eq('student_id', studentId);

        // Insert new subject links
        if (selectedSubjectIds.length > 0) {
          const links = selectedSubjectIds.map(subjectId => ({
            student_id: studentId!,
            subject_id: subjectId,
          }));
          const { error: linkError } = await supabase.from('student_subjects').insert(links);
          if (linkError) console.error('Failed to sync subjects:', linkError);
        }
      }

      onClose();
    } catch (err) {
      console.error('Failed to save student:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{initialData ? 'Edit Student' : 'New Student'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.form}>
          {/* Personal Details */}
          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Personal Details</h3>
            <div className={styles.row}>
              <div>
                <label htmlFor="first_name" className={styles.label}>First Name *</label>
                <Input id="first_name" placeholder="E.g. Emily" defaultValue={initialData?.first_name} required />
              </div>
              <div>
                <label htmlFor="last_name" className={styles.label}>Last Name *</label>
                <Input id="last_name" placeholder="E.g. Smith" defaultValue={initialData?.last_name} required />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="date_of_birth" className={styles.label}>Date of Birth</label>
                <DatePicker 
                  id="date_of_birth" 
                  defaultValue={initialData?.date_of_birth || ''} 
                />
              </div>
              <div>
                <label className={styles.label}>Gender</label>
                <Select 
                  value={gender}
                  onChange={setGender}
                  options={[
                    { value: '', label: 'Select...' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div>
                <label htmlFor="status" className={styles.label}>Status *</label>
                <Select 
                  id="status"
                  defaultValue={initialData?.status || 'active'}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'onboarding', label: 'Onboarding' },
                    { value: 'graduated', label: 'Graduated' },
                    { value: 'paused', label: 'Paused' }
                  ]}
                />
              </div>
              <div></div>
            </div>
          </div>

          {/* Academic Info */}
          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Academic Information</h3>
            <div className={styles.row}>
              <div>
                <label htmlFor="school_year" className={styles.label}>School Year</label>
                <Select 
                  id="school_year" 
                  value={schoolYear}
                  onChange={(val) => {
                    setSchoolYear(val);
                    setKeyStage(getKeyStageForYearGroup(val));
                  }}
                  placeholder="Select Year..."
                  options={[
                    { value: 'Year 4', label: 'Year 4' },
                    { value: 'Year 5', label: 'Year 5' },
                    { value: 'Year 6', label: 'Year 6 (11+)' },
                    { value: 'Year 7', label: 'Year 7' },
                    { value: 'Year 8', label: 'Year 8' },
                    { value: 'Year 9', label: 'Year 9' },
                    { value: 'Year 10', label: 'Year 10 (GCSE)' },
                    { value: 'Year 11', label: 'Year 11 (GCSE)' },
                    { value: 'Year 12', label: 'Year 12 (A-Level)' },
                    { value: 'Year 13', label: 'Year 13 (A-Level)' }
                  ]}
                />
              </div>
              <div>
                <label htmlFor="key_stage" className={styles.label}>Key Stage</label>
                <Select 
                  id="key_stage" 
                  value={keyStage}
                  onChange={setKeyStage}
                  placeholder="Select KS..."
                  options={[
                    { value: 'KS2', label: 'KS2' },
                    { value: 'KS3', label: 'KS3' },
                    { value: 'KS4', label: 'KS4' },
                    { value: 'KS5', label: 'KS5' }
                  ]}
                />
              </div>
            </div>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className={styles.label}>School Name</label>
              <Input 
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="e.g. St Mary's Academy"
              />
            </div>
          </div>

          {/* Subjects Multi-Select */}
          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Subjects</h3>
            <div className={styles.subjectPills}>
              {activeSubjects.map((subject) => {
                const isSelected = selectedSubjectIds.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    type="button"
                    className={`${styles.subjectPill} ${isSelected ? styles.subjectPillSelected : ''}`}
                    style={{
                      backgroundColor: isSelected ? subject.colour + '22' : undefined,
                      borderColor: isSelected ? subject.colour : undefined,
                      color: isSelected ? subject.colour : undefined,
                    }}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    {isSelected && <span className={styles.checkMark}>✓</span>}
                    {subject.name}
                  </button>
                );
              })}
            </div>
            {activeSubjects.length === 0 && (
              <p className={styles.subjectHint}>
                No subjects configured. Add them in Settings → Subjects Offered.
              </p>
            )}
          </div>

          {/* Learning & Goals */}
          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Learning & Goals</h3>
            <div>
              <label className={styles.label}>Learning Needs / SEN</label>
              <textarea 
                className={styles.textareaInput}
                value={learningNeeds}
                onChange={e => setLearningNeeds(e.target.value)}
                placeholder="e.g. Dyslexia, ADHD, visual learner..."
                rows={2}
              />
            </div>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className={styles.label}>Goals</label>
              <textarea 
                className={styles.textareaInput}
                value={goals}
                onChange={e => setGoals(e.target.value)}
                placeholder="e.g. Achieve grade 7 in Maths GCSE, build confidence..."
                rows={2}
              />
            </div>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className={styles.label}>Availability</label>
              <textarea 
                className={styles.textareaInput}
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                placeholder="e.g. Weekdays after 4pm, Saturday mornings..."
                rows={2}
              />
            </div>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label className={styles.label}>Medical Notes</label>
              <textarea 
                className={styles.textareaInput}
                value={medicalNotes}
                onChange={e => setMedicalNotes(e.target.value)}
                placeholder="Any allergies, conditions, or accessibility needs..."
                rows={2}
              />
            </div>
          </div>

          {/* Relationships */}
          <div className={styles.fieldGroup}>
            <h3 className={styles.groupTitle}>Relationships</h3>
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label htmlFor="primary_parent_id" className={styles.label}>Primary Parent / Guardian</label>
              <Select 
                id="primary_parent_id" 
                defaultValue={initialData?.primary_parent_id || ''}
                placeholder="Select Parent..."
                options={parentOptions}
              />
            </div>
            
            <div>
              <label htmlFor="tutor_id" className={styles.label}>Assigned Tutor</label>
              <Select 
                id="tutor_id" 
                defaultValue={initialData?.tutor_id || ''}
                placeholder="Select Tutor..."
                options={tutorOptions}
              />
            </div>
          </div>

        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : initialData ? 'Save Changes' : 'Create Student'}
          </Button>
        </div>
      </div>
    </div>
  );
}
