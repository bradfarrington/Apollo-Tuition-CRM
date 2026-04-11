import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { supabase } from '../../lib/supabase';
import { useSubjects } from '../../contexts/SubjectsContext';
import type { Lead } from '../../types/leads';
import styles from '../../components/ui/SlideoverForm.module.css';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
  mode?: 'create' | 'edit_contact' | 'add_enquiry' | 'edit_enquiry';
  editingEnquiry?: any;
}

export function LeadForm({ isOpen, onClose, lead, mode, editingEnquiry }: LeadFormProps) {
  const currentMode = mode || (lead ? 'edit_contact' : 'create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeSubjects } = useSubjects();
  
  const [formData, setFormData] = useState({
    parent_name: '',
    email: '',
    phone: '',
  });

  const [enquiry, setEnquiry] = useState({
    enquiry_type: '',
    message: '',
    pipeline_id: '',
    stage_id: '',
  });

  const [students, setStudents] = useState<any[]>([
    { id: '1', first_name: '', last_name: '', year_group: '', subjects: [] }
  ]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('1');

  const [pipelines, setPipelines] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (currentMode === 'edit_contact' && lead) {
        setFormData({
          parent_name: lead.parent_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
        });
        setEnquiry({
          enquiry_type: lead.enquiry_type || '',
          message: lead.message || '',
          pipeline_id: '',
          stage_id: '',
        });
        setStudents([]); // Hide students when just editing lead contact
        setExpandedStudentId(null);
      } else if (currentMode === 'edit_enquiry' && editingEnquiry) {
        setFormData({
          parent_name: lead?.parent_name || '',
          email: lead?.email || '',
          phone: lead?.phone || '',
        });
        setEnquiry({ 
          enquiry_type: editingEnquiry.enquiry_type || '', 
          message: editingEnquiry.message || '', 
          pipeline_id: editingEnquiry.pipeline_id || '', 
          stage_id: editingEnquiry.stage_id || '' 
        });
        const initialStudents = editingEnquiry.students && editingEnquiry.students.length > 0 ? editingEnquiry.students : [{ id: Date.now().toString(), first_name: '', last_name: '', year_group: '', subjects: [] }];
        setStudents(initialStudents);
        setExpandedStudentId(initialStudents[0].id);
      } else {
        setFormData({ parent_name: '', email: '', phone: '' });
        setEnquiry({ enquiry_type: '', message: '', pipeline_id: '', stage_id: '' });
        const newId = Date.now().toString();
        setStudents([{ id: newId, first_name: '', last_name: '', year_group: '', subjects: [] }]);
        setExpandedStudentId(newId);
      }

      // Fetch pipelines that allow enquiries
      supabase.from('pipelines')
        .select('*')
        .contains('allowed_entity_types', ['enquiry'])
        .order('sort_order')
        .then(({ data }) => {
          setPipelines(data || []);
          if (data && data.length > 0 && currentMode !== 'edit_contact' && currentMode !== 'edit_enquiry') {
            setEnquiry(prev => ({ ...prev, pipeline_id: data[0].id }));
          }
        });
    }
  }, [isOpen, lead, currentMode, editingEnquiry]);

  // Fetch stages when pipeline changes
  useEffect(() => {
    if (enquiry.pipeline_id) {
      supabase.from('pipeline_stages')
        .select('*')
        .eq('pipeline_id', enquiry.pipeline_id)
        .order('sort_order')
        .then(({ data }) => setStages(data || []));
    } else {
      setStages([]);
    }
  }, [enquiry.pipeline_id]);

  if (!isOpen) return null;

  const handleStudentChange = (id: string, field: string, value: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSubjectToggle = (studentId: string, subjectName: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const subjects = s.subjects.includes(subjectName)
        ? s.subjects.filter((sub: string) => sub !== subjectName)
        : [...s.subjects, subjectName];
      return { ...s, subjects };
    }));
  };

  const addStudent = () => {
    const newId = Date.now().toString();
    setStudents(prev => [...prev, { id: newId, first_name: '', last_name: '', year_group: '', subjects: [] }]);
    setExpandedStudentId(newId);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentMode === 'edit_contact' && lead) {
        // Just update contact details
        const { error } = await supabase.from('leads').update({
          ...formData, updated_at: new Date().toISOString()
        }).eq('id', lead.id);
        if (error) throw error;
      } else if (currentMode === 'add_enquiry' && lead) {
        // Create new Enquiry linked to existing lead
        const { data: enquiryData, error: enqError } = await supabase.from('enquiries').insert({
          lead_id: lead.id,
          enquiry_type: enquiry.enquiry_type,
          message: enquiry.message,
          students: students,
        }).select().single();
        if (enqError) throw enqError;

        if (enquiry.pipeline_id && enquiry.stage_id) {
           const { error: pcError } = await supabase.from('pipeline_cards').insert({
             pipeline_id: enquiry.pipeline_id,
             stage_id: enquiry.stage_id,
             entity_type: 'enquiry',
             entity_id: enquiryData.id,
           });
           if (pcError) throw pcError;
        }
      } else if (currentMode === 'edit_enquiry' && editingEnquiry) {
        // Update Enquiry
        const { error: enqError } = await supabase.from('enquiries').update({
          enquiry_type: enquiry.enquiry_type,
          message: enquiry.message,
          students: students,
        }).eq('id', editingEnquiry.id);
        if (enqError) throw enqError;

        if (enquiry.pipeline_id && enquiry.stage_id) {
           if (editingEnquiry.pipeline_card_id) {
             const { error: pcError } = await supabase.from('pipeline_cards').update({
               pipeline_id: enquiry.pipeline_id,
               stage_id: enquiry.stage_id,
             }).eq('id', editingEnquiry.pipeline_card_id);
             if (pcError) throw pcError;
           } else {
             const { error: pcError } = await supabase.from('pipeline_cards').insert({
               pipeline_id: enquiry.pipeline_id,
               stage_id: enquiry.stage_id,
               entity_type: 'enquiry',
               entity_id: editingEnquiry.id,
             });
             if (pcError) throw pcError;
           }
        } else {
           if (editingEnquiry.pipeline_card_id) {
              await supabase.from('pipeline_cards').delete().eq('id', editingEnquiry.pipeline_card_id);
           }
        }
      } else {
        // Create new Lead
        const { data: leadData, error: leadError } = await supabase.from('leads').insert({
          ...formData,
          enquiry_type: enquiry.enquiry_type,
          message: enquiry.message
        }).select().single();
        if (leadError) throw leadError;

        // Create new Enquiry
        const { data: enquiryData, error: enqError } = await supabase.from('enquiries').insert({
          lead_id: leadData.id,
          enquiry_type: enquiry.enquiry_type,
          message: enquiry.message,
          students: students,
        }).select().single();
        if (enqError) throw enqError;

        // Place on Kanban board if pipeline is selected
        if (enquiry.pipeline_id && enquiry.stage_id) {
           const { error: pcError } = await supabase.from('pipeline_cards').insert({
             pipeline_id: enquiry.pipeline_id,
             stage_id: enquiry.stage_id,
             entity_type: 'enquiry',
             entity_id: enquiryData.id,
           });
           if (pcError) throw pcError;
        }
      }
      onClose();
    } catch (err) {
      console.error('Failed to save lead:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{currentMode === 'edit_contact' ? 'Edit Contact' : currentMode === 'edit_enquiry' ? 'Edit Enquiry' : currentMode === 'add_enquiry' ? 'New Enquiry' : 'New Prospect'}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} id="enquiry-form" onSubmit={handleSubmit}>
          
          {currentMode !== 'add_enquiry' && currentMode !== 'edit_enquiry' && (
            <div className={styles.fieldGroup}>
              <h3 className={styles.groupTitle}>Contact Details (Parent/Guardian)</h3>
              <div>
                <label className={styles.label}>Full Name *</label>
                <Input 
                  required 
                  value={formData.parent_name}
                  onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
                  fullWidth
                />
              </div>
              <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                <div>
                  <label className={styles.label}>Email Address</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                  />
                </div>
                <div>
                  <label className={styles.label}>Phone Number</label>
                  <Input 
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          )}

          {currentMode !== 'edit_contact' && (
            <>
              <div className={styles.fieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 className={styles.groupTitle} style={{ margin: 0 }}>Student Details</h3>
                  <button type="button" onClick={addStudent} style={{ color: 'var(--color-primary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    <Plus size={14} /> Add Student
                  </button>
                </div>
                
                {students.map((student, index) => {
                  const isExpanded = expandedStudentId === student.id;
                  return (
                  <div key={student.id} style={{ 
                    background: isExpanded ? 'var(--color-background-elevated)' : 'rgba(138, 148, 255, 0.04)', 
                    border: `1px solid ${isExpanded ? 'var(--color-accent-primary)' : 'rgba(138, 148, 255, 0.3)'}`, 
                    borderRadius: 'var(--radius-lg)', 
                    marginBottom: '16px', 
                    boxShadow: isExpanded ? '-8px 12px 24px rgba(244, 114, 182, 0.12), 0px 16px 24px rgba(167, 139, 250, 0.12), 8px 12px 24px rgba(56, 189, 248, 0.12)' : '-4px 6px 16px rgba(244, 114, 182, 0.06), 0px 8px 16px rgba(167, 139, 250, 0.06), 4px 6px 16px rgba(56, 189, 248, 0.06)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                      style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Avatar */}
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: isExpanded ? 'var(--color-accent-primary)' : 'rgba(138, 148, 255, 0.15)',
                          border: `1px solid ${isExpanded ? 'transparent' : 'rgba(138, 148, 255, 0.3)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isExpanded ? 'white' : 'var(--color-accent-primary)',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}>
                          <User size={18} />
                        </div>
                        {/* Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                         <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Student {index + 1}
                         </div>
                         <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                            {student.first_name || student.last_name ? `${student.first_name} ${student.last_name}` : 'New Student'}
                         </div>
                         {!isExpanded && (student.year_group || student.subjects?.length > 0) && (
                           <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                              {student.year_group} {student.year_group && student.subjects?.length > 0 && '•'} {student.subjects?.join(', ')}
                           </div>
                         )}
                      </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {students.length > 1 && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeStudent(student.id); }} style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <Trash2 size={16} />
                          </button>
                        )}
                        <ChevronDown size={20} style={{ color: 'var(--color-text-tertiary)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div style={{ padding: '0 16px 20px 16px', borderTop: '1px solid var(--color-border-subtle)' }}>
                        <div className={styles.row} style={{ marginTop: '16px' }}>
                          <div>
                            <label className={styles.label}>First Name</label>
                            <Input value={student.first_name} onChange={e => handleStudentChange(student.id, 'first_name', e.target.value)} fullWidth />
                          </div>
                          <div>
                            <label className={styles.label}>Last Name</label>
                            <Input value={student.last_name} onChange={e => handleStudentChange(student.id, 'last_name', e.target.value)} fullWidth />
                          </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                          <label className={styles.label}>School Year</label>
                          <Select 
                            value={student.year_group}
                            onChange={val => handleStudentChange(student.id, 'year_group', val)}
                            options={[
                              { value: '', label: 'Select Year...' },
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
                        <div style={{ marginTop: '12px' }}>
                          <label className={styles.label}>Subjects Required</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                             {activeSubjects.map(sub => {
                               const isSelected = student.subjects.includes(sub.name);
                               return (
                                 <button
                                   key={sub.id}
                                   type="button"
                                   onClick={() => handleSubjectToggle(student.id, sub.name)}
                                   style={{
                                     padding: '6px 12px',
                                     borderRadius: '100px',
                                     fontSize: '13px',
                                     border: `1px solid ${isSelected ? sub.colour : 'var(--color-border)'}`,
                                     backgroundColor: isSelected ? `${sub.colour}22` : 'var(--color-background)',
                                     color: isSelected ? sub.colour : 'var(--color-text-secondary)',
                                     cursor: 'pointer',
                                     transition: 'all 0.2s ease',
                                   }}
                                 >
                                   {sub.name}
                                 </button>
                               );
                             })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )})}
              </div>

              <div className={styles.fieldGroup}>
                <h3 className={styles.groupTitle}>Enquiry Details</h3>
                <div className={styles.row} style={{ marginBottom: '16px' }}>
                  <div>
                    <label className={styles.label}>Pipeline</label>
                    <Select 
                      value={enquiry.pipeline_id}
                      onChange={val => setEnquiry({ ...enquiry, pipeline_id: val, stage_id: '' })}
                      options={[
                        { value: '', label: 'Select Pipeline...' },
                        ...pipelines.map(p => ({ value: p.id, label: p.name }))
                      ]}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Stage</label>
                    <Select 
                      value={enquiry.stage_id}
                      onChange={val => setEnquiry({ ...enquiry, stage_id: val })}
                      options={[
                        { value: '', label: 'Select Stage...' },
                        ...stages.map(s => ({ value: s.id, label: s.name }))
                      ]}
                    />
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Initial Message / Notes</label>
                  <textarea 
                    className={styles.textareaInput} 
                    placeholder="Details about availability, specific goals, etc..."
                    value={enquiry.message}
                    onChange={e => setEnquiry({ ...enquiry, message: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

        </form>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" type="submit" form="enquiry-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : currentMode === 'edit_contact' ? 'Save Changes' : currentMode === 'edit_enquiry' ? 'Save Enquiry' : currentMode === 'add_enquiry' ? 'Add Enquiry' : 'Create Prospect'}
          </Button>
        </div>
      </div>
    </div>
  );
}
