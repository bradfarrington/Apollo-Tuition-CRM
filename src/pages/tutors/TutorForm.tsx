import { useState, useEffect } from 'react';
import { X, User, Phone, GraduationCap, BookOpen, ShieldCheck, Settings, AlertCircle, CreditCard, FileSignature, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { AccordionCard } from '../../components/ui/AccordionCard';
import { supabase } from '../../lib/supabase';
import { useSubjects } from '../../contexts/SubjectsContext';
import type { Tutor } from '../../types/tutors';
import styles from '../../components/ui/SlideoverForm.module.css';

interface TutorFormProps {
  isOpen: boolean;
  onClose: () => void;
  tutor?: Tutor;
}

export function TutorForm({ isOpen, onClose, tutor }: TutorFormProps) {
  const isEditing = !!tutor;
  const { activeSubjects } = useSubjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Tutor>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: null,
    gender: '',
    address_line_1: '',
    city: '',
    county: '',
    postal_code: '',
    country: '',
    university: '',
    degree_subject: '',
    degree_grade: '',
    dbs_status: 'pending',
    dbs_certificate_number: '',
    dbs_issue_date: null,
    max_travel_radius_miles: null,
    teaching_format: '',
    hourly_rate: null,
    bio: '',
    availability: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    bank_sort_code: '',
    bank_account_number: '',
    bank_account_name: '',
    national_insurance_number: '',
    active_status: 'onboarding',
    contract_status: 'pending',
    notes: ''
  });

  const [expandedSections, setExpandedSections] = useState({
    personalDetails: true,
    contactDetails: true,
    qualifications: true,
    subjects: true,
    dbs: false,
    teachingPreferences: true,
    emergencyContact: false,
    banking: false,
    status: false,
    notes: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (isOpen) {
      if (tutor) {
        setFormData(tutor);
        // Fetch tutor's subjects
        supabase.from('tutor_subjects').select('subject_id').eq('tutor_id', tutor.id).then(({ data }) => {
          setSelectedSubjectIds((data || []).map(d => d.subject_id));
        });
      } else {
        setFormData({
          first_name: '', last_name: '', email: '', phone: '',
          date_of_birth: null, gender: '',
          address_line_1: '', city: '', county: '', postal_code: '', country: '',
          university: '', degree_subject: '', degree_grade: '',
          dbs_status: 'pending', dbs_certificate_number: '', dbs_issue_date: null,
          max_travel_radius_miles: null, teaching_format: '', hourly_rate: null,
          bio: '', availability: '',
          emergency_contact_name: '', emergency_contact_phone: '',
          bank_sort_code: '', bank_account_number: '', bank_account_name: '', national_insurance_number: '',
          active_status: 'onboarding', contract_status: 'pending', notes: ''
        });
        setSelectedSubjectIds([]);
      }
    }
  }, [tutor, isOpen]);

  const handleChange = (field: keyof Tutor, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean data for DB
    const submitData = { ...formData };
    delete submitData.id;
    delete submitData.created_at;
    delete submitData.updated_at;
    delete submitData.deleted_at;
    delete submitData.active_students_count;
    delete submitData.active_enrolments_count;
    delete submitData.subject_ids;
    delete submitData.subjects;

    // Convert empty strings to null for numeric/date fields
    if (!submitData.hourly_rate) submitData.hourly_rate = null;
    if (!submitData.max_travel_radius_miles) submitData.max_travel_radius_miles = null;
    if (!submitData.date_of_birth) submitData.date_of_birth = null;
    if (!submitData.dbs_issue_date) submitData.dbs_issue_date = null;

    try {
      let tutorId = tutor?.id;

      if (tutor?.id) {
        // Update
        const { error } = await supabase
          .from('tutors')
          .update({ ...submitData, updated_at: new Date().toISOString() })
          .eq('id', tutor.id);
        if (error) throw error;
      } else {
        // Insert
        const { data: newTutor, error } = await supabase
          .from('tutors')
          .insert(submitData)
          .select('id')
          .single();
        if (error) throw error;
        tutorId = newTutor.id;
      }

      // Sync tutor_subjects
      if (tutorId) {
        await supabase.from('tutor_subjects').delete().eq('tutor_id', tutorId);
        if (selectedSubjectIds.length > 0) {
          const links = selectedSubjectIds.map(subjectId => ({
            tutor_id: tutorId!,
            subject_id: subjectId,
          }));
          await supabase.from('tutor_subjects').insert(links);
        }
      }

      onClose();
    } catch (err) {
      console.error('Failed to save tutor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Edit Tutor' : 'Add New Tutor'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} id="tutor-form" onSubmit={handleSubmit}>
          
          <AccordionCard
            title="Personal Information"
            subtitle="Identity"
            icon={<User size={18} />}
            expanded={expandedSections.personalDetails}
            onToggle={() => toggleSection('personalDetails')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>First Name *</label>
                  <Input 
                    value={formData.first_name || ''} 
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>Last Name *</label>
                  <Input 
                    value={formData.last_name || ''} 
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Date of Birth</label>
                  <DatePicker 
                    value={formData.date_of_birth || ''}
                    onChange={(val: string) => handleChange('date_of_birth', val || null)}
                  />
                </div>
                <div>
                  <label className={styles.label}>Gender</label>
                  <Select 
                    value={formData.gender || ''}
                    onChange={(val) => handleChange('gender', val)}
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
            </div>
          </AccordionCard>

          <AccordionCard
            title="Contact Details"
            subtitle="Communication"
            icon={<Phone size={18} />}
            expanded={expandedSections.contactDetails}
            onToggle={() => toggleSection('contactDetails')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Email *</label>
                  <Input 
                    type="email"
                    value={formData.email || ''} 
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>Phone Number</label>
                  <Input 
                    type="tel"
                    value={formData.phone || ''} 
                    onChange={(e) => handleChange('phone', e.target.value)}
                    fullWidth
                  />
                </div>
              </div>
              
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className={styles.label}>Address Line 1</label>
                <Input 
                  value={formData.address_line_1 || ''} 
                  onChange={(e) => handleChange('address_line_1', e.target.value)}
                  fullWidth
                />
              </div>
              
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Town/City</label>
                  <Input 
                    value={formData.city || ''} 
                    onChange={(e) => handleChange('city', e.target.value)}
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>County</label>
                  <Input 
                    value={formData.county || ''} 
                    onChange={(e) => handleChange('county', e.target.value)}
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Postal Code</label>
                  <Input 
                    value={formData.postal_code || ''} 
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    fullWidth
                  />
                </div>
                <div></div>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Qualifications"
            subtitle="Education"
            icon={<GraduationCap size={18} />}
            expanded={expandedSections.qualifications}
            onToggle={() => toggleSection('qualifications')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>University</label>
                  <Input 
                    value={formData.university || ''} 
                    onChange={(e) => handleChange('university', e.target.value)}
                    placeholder="e.g. University of Cambridge"
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>Degree Subject</label>
                  <Input 
                    value={formData.degree_subject || ''} 
                    onChange={(e) => handleChange('degree_subject', e.target.value)}
                    placeholder="e.g. Mathematics"
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Degree Grade</label>
                  <Select 
                    value={formData.degree_grade || ''}
                    onChange={(val) => handleChange('degree_grade', val)}
                    options={[
                      { value: '', label: 'Select...' },
                      { value: '1st', label: 'First Class (1st)' },
                      { value: '2:1', label: 'Upper Second (2:1)' },
                      { value: '2:2', label: 'Lower Second (2:2)' },
                      { value: '3rd', label: 'Third Class' },
                      { value: 'Pass', label: 'Pass' },
                      { value: 'Masters', label: 'Masters' },
                      { value: 'PhD', label: 'PhD' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>
                <div></div>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Subjects Taught"
            subtitle="Curriculum"
            icon={<BookOpen size={18} />}
            expanded={expandedSections.subjects}
            onToggle={() => toggleSection('subjects')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
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
          </AccordionCard>

          <AccordionCard
            title="DBS Check"
            subtitle="Security"
            icon={<ShieldCheck size={18} />}
            expanded={expandedSections.dbs}
            onToggle={() => toggleSection('dbs')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>DBS Status</label>
                  <Select 
                    value={formData.dbs_status || 'pending'}
                    onChange={(val) => handleChange('dbs_status', val)}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'applied', label: 'Applied' },
                      { value: 'clear', label: 'Clear' },
                      { value: 'enhanced', label: 'Enhanced Clear' },
                      { value: 'expired', label: 'Expired' },
                    ]}
                  />
                </div>
                <div>
                  <label className={styles.label}>Certificate Number</label>
                  <Input 
                    value={formData.dbs_certificate_number || ''} 
                    onChange={(e) => handleChange('dbs_certificate_number', e.target.value)}
                    placeholder="e.g. 001234567890"
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Issue Date</label>
                  <DatePicker 
                    value={formData.dbs_issue_date || ''}
                    onChange={(val: string) => handleChange('dbs_issue_date', val || null)}
                  />
                </div>
                <div></div>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Teaching Preferences"
            subtitle="Settings"
            icon={<Settings size={18} />}
            expanded={expandedSections.teachingPreferences}
            onToggle={() => toggleSection('teachingPreferences')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Teaching Format</label>
                  <Select 
                    value={formData.teaching_format || ''}
                    onChange={(val) => handleChange('teaching_format', val)}
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'Online', label: 'Online only' },
                      { value: 'In-person', label: 'In-person only' },
                      { value: 'Both', label: 'Both online & in-person' },
                    ]}
                  />
                </div>
                <div>
                  <label className={styles.label}>Max Travel Radius (miles)</label>
                  <Input 
                    type="number"
                    value={formData.max_travel_radius_miles ?? ''} 
                    onChange={(e) => handleChange('max_travel_radius_miles', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g. 10"
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Hourly Rate (£)</label>
                  <Input 
                    type="number"
                    value={formData.hourly_rate ?? ''} 
                    onChange={(e) => handleChange('hourly_rate', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 35.00"
                    fullWidth
                  />
                </div>
                <div></div>
              </div>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className={styles.label}>Availability</label>
                <textarea 
                  className={styles.textareaInput}
                  value={formData.availability || ''}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  placeholder="e.g. Mon–Fri 4pm–8pm, Saturdays all day..."
                  rows={2}
                />
              </div>
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className={styles.label}>Bio</label>
                <textarea 
                  className={styles.textareaInput}
                  value={formData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="A short bio for parent-facing profiles..."
                  rows={3}
                />
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Emergency Contact"
            subtitle="Safety"
            icon={<AlertCircle size={18} />}
            expanded={expandedSections.emergencyContact}
            onToggle={() => toggleSection('emergencyContact')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Contact Name</label>
                  <Input 
                    value={formData.emergency_contact_name || ''} 
                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                    placeholder="e.g. Jane Doe"
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>Contact Phone</label>
                  <Input 
                    type="tel"
                    value={formData.emergency_contact_phone || ''} 
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    placeholder="07123 456789"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Banking & Payroll"
            subtitle="Finance"
            icon={<CreditCard size={18} />}
            expanded={expandedSections.banking}
            onToggle={() => toggleSection('banking')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Bank Account Name</label>
                  <Input 
                    value={formData.bank_account_name || ''} 
                    onChange={(e) => handleChange('bank_account_name', e.target.value)}
                    placeholder="Account holder name"
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>Sort Code</label>
                  <Input 
                    value={formData.bank_sort_code || ''} 
                    onChange={(e) => handleChange('bank_sort_code', e.target.value)}
                    placeholder="00-00-00"
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Account Number</label>
                  <Input 
                    value={formData.bank_account_number || ''} 
                    onChange={(e) => handleChange('bank_account_number', e.target.value)}
                    placeholder="12345678"
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>National Insurance Number</label>
                  <Input 
                    value={formData.national_insurance_number || ''} 
                    onChange={(e) => handleChange('national_insurance_number', e.target.value)}
                    placeholder="AB 12 34 56 C"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Status & Contract"
            subtitle="Admin"
            icon={<FileSignature size={18} />}
            expanded={expandedSections.status}
            onToggle={() => toggleSection('status')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Active Status</label>
                  <Select 
                    value={formData.active_status || 'onboarding'}
                    onChange={(val) => handleChange('active_status', val as any)}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'onboarding', label: 'Onboarding' }
                    ]}
                  />
                </div>
                <div>
                  <label className={styles.label}>Contract Status</label>
                  <Select 
                    value={formData.contract_status || 'pending'}
                    onChange={(val) => handleChange('contract_status', val as any)}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'signed', label: 'Signed' },
                      { value: 'expired', label: 'Expired' },
                      { value: 'terminated', label: 'Terminated' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard
            title="Additional Information"
            subtitle="Notes"
            icon={<FileText size={18} />}
            expanded={expandedSections.notes}
            onToggle={() => toggleSection('notes')}
          >
            <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
              <div>
                <label className={styles.label}>Notes</label>
                <textarea 
                  className={styles.textareaInput}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </AccordionCard>

        </form>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" type="submit" form="tutor-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Tutor'}
          </Button>
        </div>
      </div>
    </div>
  );
}
