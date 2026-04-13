import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, ChevronDown, User, FileText, MapPin, AlignLeft, Tag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { supabase } from '../../lib/supabase';
import { useSubjects } from '../../contexts/SubjectsContext';
import type { Lead } from '../../types/leads';
import styles from '../../components/ui/SlideoverForm.module.css';
import { AccordionCard } from '../../components/ui/AccordionCard';

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
    preferred_contact_method: '',
    relationship_to_student: '',
    address_line_1: '',
    city: '',
    postal_code: '',
    how_heard: '',
    message: '',
    tags: [] as string[],
    status: 'open',
  });

  const [enquiry, setEnquiry] = useState({
    enquiry_type: '',
    message: '',
    pipeline_id: '',
    stage_id: '',
    owner_id: '',
    source: '',
    urgency: 'medium',
    preferred_start_date: '',
    lesson_frequency: '',
    lesson_format: '',
    notes: '',
  });

  const [students, setStudents] = useState<any[]>([
    { id: '1', first_name: '', last_name: '', date_of_birth: '', year_group: '', subjects: [], notes: '' }
  ]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>('1');
  const isNewMode = currentMode === 'create' || currentMode === 'add_enquiry';
  const [expandedSections, setExpandedSections] = useState({ 
    contactDetails: !isNewMode, 
    contactAddress: !isNewMode, 
    contactNotes: !isNewMode, 
    contactTags: !isNewMode, 
    students: !isNewMode, 
    enquiry: !isNewMode 
  });

  const [pipelines, setPipelines] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [leadSourceOptions, setLeadSourceOptions] = useState<{ value: string; label: string }[]>([]);
  
  const [availableTags, setAvailableTags] = useState<{name: string, color: string}[]>([]);
  const [tagInputText, setTagInputText] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const isNew = currentMode === 'create' || currentMode === 'add_enquiry';
      setExpandedSections({
        contactDetails: !isNew,
        contactAddress: !isNew,
        contactNotes: !isNew,
        contactTags: !isNew,
        students: !isNew,
        enquiry: !isNew
      });

      // Fetch team members for owner dropdown
      supabase.from('profiles').select('id, full_name').order('full_name').then(({ data }) => {
        setTeamMembers(data || []);
      });

      // Fetch lead sources for dropdown
      supabase.from('lead_sources').select('name').eq('is_active', true).order('sort_order').then(({ data }) => {
        setLeadSourceOptions((data || []).map(s => ({ value: s.name, label: s.name })));
      });

      // Fetch CRM tags
      supabase.from('crm_tags').select('name, color').order('name').then(({ data }) => {
        setAvailableTags(data || []);
      });

      if (currentMode === 'edit_contact' && lead) {
        setFormData({
          parent_name: lead.parent_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          preferred_contact_method: lead.preferred_contact_method || '',
          relationship_to_student: lead.relationship_to_student || '',
          address_line_1: lead.address_line_1 || '',
          city: lead.city || '',
          postal_code: lead.postal_code || '',
          how_heard: lead.how_heard || lead.source || '',
          message: lead.message || '',
          tags: lead.tags || [],
          status: lead.status || 'open',
        });
        setStudents([]);
        setExpandedStudentId(null);
      } else if (currentMode === 'edit_enquiry' && editingEnquiry) {
        setFormData({
          parent_name: lead?.parent_name || '',
          email: lead?.email || '',
          phone: lead?.phone || '',
          preferred_contact_method: lead?.preferred_contact_method || '',
          relationship_to_student: lead?.relationship_to_student || '',
          address_line_1: lead?.address_line_1 || '',
          city: lead?.city || '',
          postal_code: lead?.postal_code || '',
          how_heard: lead?.how_heard || '',
          message: lead?.message || '',
          tags: lead?.tags || [],
          status: lead?.status || 'open',
        });
        setEnquiry({ 
          enquiry_type: editingEnquiry.enquiry_type || '', 
          message: editingEnquiry.message || '', 
          pipeline_id: editingEnquiry.pipeline_id || '', 
          stage_id: editingEnquiry.stage_id || '',
          owner_id: editingEnquiry.owner_id || '',
          source: editingEnquiry.source || '',
          urgency: editingEnquiry.urgency || 'medium',
          preferred_start_date: editingEnquiry.preferred_start_date || '',
          lesson_frequency: editingEnquiry.lesson_frequency || '',
          lesson_format: editingEnquiry.lesson_format || '',
          notes: editingEnquiry.notes || '',
        });
        const initialStudents = editingEnquiry.students && editingEnquiry.students.length > 0 ? editingEnquiry.students : [{ id: Date.now().toString(), first_name: '', last_name: '', date_of_birth: '', year_group: '', subjects: [], notes: '' }];
        setStudents(initialStudents);
        setExpandedStudentId(initialStudents[0].id);
      } else {
        setFormData({ parent_name: '', email: '', phone: '', preferred_contact_method: '', relationship_to_student: '', address_line_1: '', city: '', postal_code: '', how_heard: '', message: '', tags: [], status: 'open' });
        setEnquiry({ enquiry_type: '', message: '', pipeline_id: '', stage_id: '', owner_id: '', source: '', urgency: 'medium', preferred_start_date: '', lesson_frequency: '', lesson_format: '', notes: '' });
        const newId = Date.now().toString();
        setStudents([{ id: newId, first_name: '', last_name: '', date_of_birth: '', year_group: '', subjects: [], notes: '' }]);
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
    setStudents(prev => [...prev, { id: newId, first_name: '', last_name: '', date_of_birth: '', year_group: '', subjects: [], notes: '' }]);
    setExpandedStudentId(newId);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleTagAdd = async (tagName: string) => {
    const name = tagName.trim();
    if (!name || formData.tags?.includes(name)) return;
    
    // Add to formData immediately for responsive UI
    setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), name] }));
    setTagInputText('');
    
    // Check if it exists in availableTags
    if (!availableTags.find(t => t.name.toLowerCase() === name.toLowerCase())) {
      // It's a new tag, create it in DB
      const newTag = { name, color: '#94a3b8' }; // Default color
      setAvailableTags(prev => [...prev, newTag]);
      await supabase.from('crm_tags').insert([newTag]).select();
    }
  };

  const handleTagRemove = (tagName: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tagName) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (currentMode === 'edit_contact' && lead) {
        // Update lead contact details
        const { error } = await supabase.from('leads').update({
          parent_name: formData.parent_name,
          email: formData.email,
          phone: formData.phone,
          preferred_contact_method: formData.preferred_contact_method || null,
          relationship_to_student: formData.relationship_to_student || null,
          address_line_1: formData.address_line_1 || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          how_heard: formData.how_heard || null,
          source: formData.how_heard || null,
          message: formData.message || null,
          tags: formData.tags,
          status: formData.status,
          updated_at: new Date().toISOString()
        }).eq('id', lead.id);
        if (error) throw error;

        // Sync to associated parent (by email match) if they exist
        const matchEmail = lead.email || formData.email;
        if (matchEmail) {
          const nameParts = formData.parent_name.split(' ');
          await supabase.from('parents').update({
            first_name: nameParts[0],
            last_name: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
            email: formData.email || null,
            phone: formData.phone || null,
            preferred_contact_method: formData.preferred_contact_method || null,
            relationship_to_student: formData.relationship_to_student || null,
            address_line_1: formData.address_line_1 || null,
            city: formData.city || null,
            postal_code: formData.postal_code || null,
            how_heard: formData.how_heard || null,
            updated_at: new Date().toISOString()
          }).eq('email', matchEmail);
        }
      } else if (currentMode === 'add_enquiry' && lead) {
        // Create new Enquiry linked to existing lead
        const { data: enquiryData, error: enqError } = await supabase.from('enquiries').insert({
          lead_id: lead.id,
          enquiry_type: enquiry.enquiry_type,
          message: enquiry.message,
          students: students,
          owner_id: enquiry.owner_id || null,
          source: enquiry.source || null,
          urgency: enquiry.urgency || 'medium',
          preferred_start_date: enquiry.preferred_start_date || null,
          lesson_frequency: enquiry.lesson_frequency || null,
          lesson_format: enquiry.lesson_format || null,
          notes: enquiry.notes || null,
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
          owner_id: enquiry.owner_id || null,
          source: enquiry.source || null,
          urgency: enquiry.urgency || 'medium',
          preferred_start_date: enquiry.preferred_start_date || null,
          lesson_frequency: enquiry.lesson_frequency || null,
          lesson_format: enquiry.lesson_format || null,
          notes: enquiry.notes || null,
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
        // Create new Lead + auto-create first Enquiry
        const { data: leadData, error: leadError } = await supabase.from('leads').insert({
          parent_name: formData.parent_name,
          email: formData.email,
          phone: formData.phone,
          preferred_contact_method: formData.preferred_contact_method || null,
          relationship_to_student: formData.relationship_to_student || null,
          address_line_1: formData.address_line_1 || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          how_heard: formData.how_heard || null,
          source: formData.how_heard || null,
          message: formData.message || null,
          enquiry_type: enquiry.enquiry_type,
          tags: formData.tags,
          status: formData.status,
        }).select().single();
        if (leadError) throw leadError;

        // Create first Enquiry
        const { data: enquiryData, error: enqError } = await supabase.from('enquiries').insert({
          lead_id: leadData.id,
          enquiry_type: enquiry.enquiry_type,
          message: enquiry.message,
          students: students,
          owner_id: enquiry.owner_id || null,
          source: enquiry.source || null,
          urgency: enquiry.urgency || 'medium',
          preferred_start_date: enquiry.preferred_start_date || null,
          lesson_frequency: enquiry.lesson_frequency || null,
          lesson_format: enquiry.lesson_format || null,
          notes: enquiry.notes || null,
        }).select().single();
        if (enqError) throw enqError;

        // Place on Kanban board
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

  const basicInformationFields = (
    <>
      <div className={styles.row}>
        <div>
          <label className={styles.label}>Full Name *</label>
          <Input 
            required 
            value={formData.parent_name}
            onChange={e => setFormData({ ...formData, parent_name: e.target.value })}
            fullWidth
          />
        </div>
        <div>
          <label className={styles.label}>Relationship to Student</label>
          <Select 
            value={formData.relationship_to_student}
            onChange={val => setFormData({ ...formData, relationship_to_student: val })}
            options={[
              { value: '', label: 'Select...' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Father', label: 'Father' },
              { value: 'Guardian', label: 'Guardian' },
              { value: 'Grandparent', label: 'Grandparent' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>
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
      <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
        <div>
          <label className={styles.label}>Preferred Contact Method</label>
          <Select 
            value={formData.preferred_contact_method}
            onChange={val => setFormData({ ...formData, preferred_contact_method: val })}
            options={[
              { value: '', label: 'Select...' },
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'sms', label: 'SMS' }
            ]}
          />
        </div>
        <div>
          <label className={styles.label}>How Did They Hear About Us?</label>
          <Select 
            value={formData.how_heard}
            onChange={val => setFormData({ ...formData, how_heard: val })}
            options={[
              { value: '', label: 'Select...' },
              ...leadSourceOptions
            ]}
          />
        </div>
      </div>
    </>
  );

  const addressFields = (
    <>
      <div>
        <label className={styles.label}>Address Line 1</label>
        <Input 
          value={formData.address_line_1}
          onChange={e => setFormData({ ...formData, address_line_1: e.target.value })}
          placeholder="123 Street Name"
          fullWidth
        />
      </div>
      <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
        <div>
          <label className={styles.label}>Town/City</label>
          <Input 
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            fullWidth
          />
        </div>
        <div>
          <label className={styles.label}>Postal Code</label>
          <Input 
            value={formData.postal_code}
            onChange={e => setFormData({ ...formData, postal_code: e.target.value })}
            placeholder="SW1A 1AA"
            fullWidth
          />
        </div>
      </div>
    </>
  );

  const notesFields = (
    <div>
      <label className={styles.label}>Initial Message / Notes</label>
      <textarea 
        className={styles.textareaInput} 
        placeholder="Any notes about this contact..."
        value={formData.message}
        onChange={e => setFormData({ ...formData, message: e.target.value })}
      />
    </div>
  );

  const tagsFields = (
    <div style={{ position: 'relative' }} ref={tagInputRef}>
      <div className={styles.textareaInput} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '42px', alignItems: 'center', padding: '6px 12px' }}>
        {formData.tags?.map(tag => {
            const tagInfo = availableTags.find(t => t.name === tag);
            return (
              <span key={tag} style={{ background: tagInfo?.color ? `${tagInfo.color}22` : '#f1f5f9', color: tagInfo?.color || '#475569', border: `1px solid ${tagInfo?.color || '#cbd5e1'}`, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {tag}
                <button type="button" onClick={() => handleTagRemove(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 0, display: 'flex' }}>
                  <X size={10} />
                </button>
              </span>
            )
        })}
        <input
          type="text"
          value={tagInputText}
          onChange={e => { setTagInputText(e.target.value); setShowTagDropdown(true); }}
          onFocus={() => setShowTagDropdown(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (tagInputText.trim()) {
                handleTagAdd(tagInputText);
              }
            }
          }}
          placeholder={formData.tags?.length ? "Add another tag..." : "Type to create or search tags..."}
          style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, minWidth: '120px', fontSize: '14px' }}
        />
      </div>
      
      {showTagDropdown && (tagInputText || availableTags.length > 0) && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', maxHeight: '200px', overflowY: 'auto', marginTop: '4px' }}>
          {tagInputText && !availableTags.find(t => t.name.toLowerCase() === tagInputText.toLowerCase()) && (
            <div 
              onClick={() => { handleTagAdd(tagInputText); setShowTagDropdown(false); }}
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-accent-blue)', fontSize: '14px', background: 'var(--color-bg-subtle)' }}
            >
              <Plus size={14} /> Create new tag "{tagInputText}"
            </div>
          )}
          {availableTags.filter(t => t.name.toLowerCase().includes(tagInputText.toLowerCase()) && !formData.tags?.includes(t.name)).map(tag => (
            <div 
              key={tag.name}
              onClick={() => { handleTagAdd(tag.name); setShowTagDropdown(false); }}
              style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
              className={styles.dropdownItemHover}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: tag.color }}></div>
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );

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
          
          {/* ========== CONTACT DETAILS ========== */}
          {currentMode !== 'add_enquiry' && currentMode !== 'edit_enquiry' && (
            currentMode === 'edit_contact' ? (
              <>
                <AccordionCard
                  title="Contact Details"
                  subtitle="Parent / Guardian"
                  icon={<User size={18} />}
                  expanded={expandedSections.contactDetails}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, contactDetails: !prev.contactDetails }))}
                  summary={(formData.parent_name || formData.email) ? `${formData.parent_name} ${formData.parent_name && formData.email ? '•' : ''} ${formData.email}` : undefined}
                >
                  <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
                    {basicInformationFields}
                  </div>
                </AccordionCard>

                <AccordionCard
                  title="Address"
                  subtitle="Location"
                  icon={<MapPin size={18} />}
                  expanded={expandedSections.contactAddress}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, contactAddress: !prev.contactAddress }))}
                >
                  <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
                    {addressFields}
                  </div>
                </AccordionCard>

                <AccordionCard
                  title="Notes"
                  subtitle="Initial Message"
                  icon={<AlignLeft size={18} />}
                  expanded={expandedSections.contactNotes}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, contactNotes: !prev.contactNotes }))}
                >
                  <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
                    {notesFields}
                  </div>
                </AccordionCard>

                <AccordionCard
                  title="Tags"
                  subtitle="Categorization"
                  icon={<Tag size={18} />}
                  expanded={expandedSections.contactTags}
                  onToggle={() => setExpandedSections(prev => ({ ...prev, contactTags: !prev.contactTags }))}
                >
                  <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px', overflow: 'visible' }}>
                    {tagsFields}
                  </div>
                </AccordionCard>
              </>
            ) : (
              <AccordionCard
                title="Contact Details"
                subtitle="Parent / Guardian"
                icon={<User size={18} />}
                expanded={expandedSections.contactDetails}
                onToggle={() => setExpandedSections(prev => ({ ...prev, contactDetails: !prev.contactDetails }))}
                summary={(formData.parent_name || formData.email) ? `${formData.parent_name} ${formData.parent_name && formData.email ? '•' : ''} ${formData.email}` : undefined}
              >
                <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
                  <h3 className={styles.groupTitle} style={{ marginTop: 0 }}>Basic Information</h3>
                  {basicInformationFields}
                </div>
                <div className={styles.fieldGroup}>
                  <h3 className={styles.groupTitle}>Address</h3>
                  {addressFields}
                </div>
                <div className={styles.fieldGroup}>
                  <h3 className={styles.groupTitle}>Notes</h3>
                  {notesFields}
                </div>
                <div className={styles.fieldGroup} style={{ overflow: 'visible' }}>
                  <h3 className={styles.groupTitle}>Tags</h3>
                  {tagsFields}
                </div>
              </AccordionCard>
            )
          )}

          {/* ========== STUDENT DETAILS ========== */}
          {currentMode !== 'edit_contact' && (
            <AccordionCard
              title="Student List"
              subtitle="Students"
              icon={<User size={18} />}
              expanded={expandedSections.students}
              onToggle={() => setExpandedSections(prev => ({ ...prev, students: !prev.students }))}
              summary={`${students.length} Student${students.length !== 1 ? 's' : ''}`}
            >
              <div style={{ paddingTop: '16px' }}>
                {students.map((student, index) => {
                  const isInnerExpanded = expandedStudentId === student.id;
                  return (
                  <div key={student.id} style={{
                    marginTop: '16px', 
                    background: 'var(--color-bg-surface)', 
                    border: `1px solid ${isInnerExpanded ? 'var(--color-border-strong, #cbd5e1)' : 'var(--color-border-subtle)'}`, 
                    boxShadow: isInnerExpanded ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    borderRadius: 'var(--radius-md)', 
                    transition: 'all 0.2s ease',
                    overflow: 'visible'
                  }}>
                    <div 
                      onClick={() => setExpandedStudentId(isInnerExpanded ? null : student.id)}
                      style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isInnerExpanded ? 'transparent' : 'var(--color-bg-surface)' }}
                    >
                      <h3 className={styles.groupTitle} style={{ margin: 0, color: isInnerExpanded ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                          {student.first_name || student.last_name ? `${student.first_name} ${student.last_name}`.trim() : `New Student ${index + 1}`}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {students.length > 1 && (
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeStudent(student.id); }} style={{ color: 'var(--color-danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                        <ChevronDown size={18} style={{ color: 'var(--color-text-tertiary)', transform: isInnerExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                      </div>
                    </div>
                    
                    {isInnerExpanded && (
                    <div style={{ padding: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
                      <div className={styles.row}>
                        <div>
                          <label className={styles.label}>First Name</label>
                          <Input value={student.first_name} onChange={e => handleStudentChange(student.id, 'first_name', e.target.value)} fullWidth />
                        </div>
                        <div>
                          <label className={styles.label}>Last Name</label>
                          <Input value={student.last_name} onChange={e => handleStudentChange(student.id, 'last_name', e.target.value)} fullWidth />
                        </div>
                      </div>
                      
                      <div className={styles.row} style={{ marginTop: '12px' }}>
                        <div>
                          <label className={styles.label}>Date of Birth</label>
                          <DatePicker 
                            value={student.date_of_birth || ''}
                            onChange={(val: string) => handleStudentChange(student.id, 'date_of_birth', val)}
                          />
                        </div>
                        <div>
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
                      
                      <div style={{ marginTop: '16px' }}>
                        <label className={styles.label}>Student Profile Notes</label>
                        <textarea 
                          className={styles.textareaInput} 
                          placeholder="Any specific details for this student? (e.g. SEN requirements, current grades...)"
                          value={student.notes || ''}
                          onChange={(e) => handleStudentChange(student.id, 'notes', e.target.value)}
                          style={{ minHeight: '80px' }}
                        />
                      </div>
                    </div>
                    )}
                  </div>
                )})}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button type="button" onClick={addStudent} style={{ color: 'var(--color-primary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-background-elevated)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '10px 20px', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s' }}>
                    <Plus size={16} /> Add Another Student
                  </button>
                </div>
              </div>
            </AccordionCard>
          )}

          {/* ========== ENQUIRY DETAILS ========== */}
          {currentMode !== 'edit_contact' && (
            <AccordionCard
              title="Details & Preferences"
              subtitle="Enquiry"
              icon={<FileText size={18} />}
              expanded={expandedSections.enquiry}
              onToggle={() => setExpandedSections(prev => ({ ...prev, enquiry: !prev.enquiry }))}
              summary={enquiry.enquiry_type || undefined}
            >
              <div className={styles.fieldGroup} style={{ borderTop: 'none', paddingTop: '16px' }}>
                <h3 className={styles.groupTitle}>Pipeline & Assignment</h3>
                <div className={styles.row}>
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
                <div className={styles.row} style={{ marginTop: 'var(--spacing-md)' }}>
                  <div>
                    <label className={styles.label}>Assigned Team Member</label>
                    <Select 
                      value={enquiry.owner_id}
                      onChange={val => setEnquiry({ ...enquiry, owner_id: val })}
                      options={[
                        { value: '', label: 'Unassigned' },
                        ...teamMembers.map(tm => ({ value: tm.id, label: tm.full_name }))
                      ]}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Enquiry Type</label>
                    <Select 
                      value={enquiry.enquiry_type}
                      onChange={val => setEnquiry({ ...enquiry, enquiry_type: val })}
                      options={[
                        { value: '', label: 'Select Type...' },
                        { value: 'New Tuition', label: 'New Tuition' },
                        { value: 'Additional Subject', label: 'Additional Subject' },
                        { value: 'Group Tuition', label: 'Group Tuition' },
                        { value: 'Exam Prep', label: 'Exam Prep' },
                        { value: 'Holiday Intensive', label: 'Holiday Intensive' },
                        { value: 'Assessment', label: 'Assessment' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <h3 className={styles.groupTitle}>Source & Urgency</h3>
                <div className={styles.row}>
                  <div>
                    <label className={styles.label}>Enquiry Source</label>
                    <Select 
                      value={enquiry.source}
                      onChange={val => setEnquiry({ ...enquiry, source: val })}
                      options={[
                        { value: '', label: 'Select...' },
                        { value: 'Phone Call', label: 'Phone Call' },
                        { value: 'Email', label: 'Email' },
                        { value: 'Website Form', label: 'Website Form' },
                        { value: 'WhatsApp', label: 'WhatsApp' },
                        { value: 'Walk-in', label: 'Walk-in' },
                        { value: 'Referral', label: 'Referral' },
                        { value: 'Social Media', label: 'Social Media' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Urgency</label>
                    <Select 
                      value={enquiry.urgency}
                      onChange={val => setEnquiry({ ...enquiry, urgency: val })}
                      options={[
                        { value: 'low', label: '🟢 Low' },
                        { value: 'medium', label: '🟡 Medium' },
                        { value: 'high', label: '🔴 High' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <h3 className={styles.groupTitle}>Lesson Preferences</h3>
                <div className={styles.row}>
                  <div>
                    <label className={styles.label}>Preferred Start Date</label>
                    <DatePicker 
                      id="preferred_start_date"
                      defaultValue={enquiry.preferred_start_date}
                      onChange={(val: string) => setEnquiry({ ...enquiry, preferred_start_date: val })}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Lesson Frequency</label>
                    <Select 
                      value={enquiry.lesson_frequency}
                      onChange={val => setEnquiry({ ...enquiry, lesson_frequency: val })}
                      options={[
                        { value: '', label: 'Select...' },
                        { value: 'Once a week', label: 'Once a week' },
                        { value: 'Twice a week', label: 'Twice a week' },
                        { value: '3+ times a week', label: '3+ times a week' },
                        { value: 'Fortnightly', label: 'Fortnightly' },
                        { value: 'Intensive / Block', label: 'Intensive / Block' },
                        { value: 'Ad hoc', label: 'Ad hoc / As needed' }
                      ]}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <label className={styles.label}>Lesson Format</label>
                  <Select 
                    value={enquiry.lesson_format}
                    onChange={val => setEnquiry({ ...enquiry, lesson_format: val })}
                    options={[
                      { value: '', label: 'Select...' },
                      { value: 'Online', label: 'Online' },
                      { value: 'In-person', label: 'In-person (at student\'s home)' },
                      { value: 'Centre-based', label: 'Centre-based' },
                      { value: 'Hybrid', label: 'Hybrid (mix of online & in-person)' }
                    ]}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <h3 className={styles.groupTitle}>Notes</h3>
                <div>
                  <label className={styles.label}>Parent's Message</label>
                  <textarea 
                    className={styles.textareaInput} 
                    placeholder="What the parent told you about their requirements..."
                    value={enquiry.message}
                    onChange={e => setEnquiry({ ...enquiry, message: e.target.value })}
                  />
                </div>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <label className={styles.label}>Internal Notes</label>
                  <textarea 
                    className={styles.textareaInput} 
                    placeholder="Team-only notes about this enquiry..."
                    value={enquiry.notes}
                    onChange={e => setEnquiry({ ...enquiry, notes: e.target.value })}
                  />
                </div>
              </div>

            </AccordionCard>
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
