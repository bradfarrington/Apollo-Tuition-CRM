import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, CheckSquare, AlignLeft, Calendar, Flag, User as UserIcon, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { ConfirmDeleteModal } from '../ui/ConfirmDeleteModal';
import type { Task, TaskStage, TaskPriority } from '../../types/tasks';
import styles from './TaskFormModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  task?: Task;
  prefilledStageId?: string;
  prefilledRelatedType?: 'parent' | 'student' | 'tutor' | 'lead' | 'invoice' | 'contract';
  prefilledRelatedId?: string;
}

// Staff members fetched from db

export function TaskFormModal({ isOpen, onClose, onUpdate, task, prefilledStageId, prefilledRelatedType, prefilledRelatedId }: Props) {
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stageId, setStageId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [staffMembers, setStaffMembers] = useState<{id: string, name: string}[]>([]);
  
  const [relatedType, setRelatedType] = useState<string>('');
  const [relatedId, setRelatedId] = useState<string>('');
  const [relatedOptions, setRelatedOptions] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      fetchStages();
      fetchStaff();
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setStageId(task.stage_id || '');
        setPriority(task.priority);
        setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '');
        setAssignedTo(task.assigned_to || '');
        setRelatedType(task.related_type || (prefilledRelatedType || ''));
        setRelatedId(task.related_id || (prefilledRelatedId || ''));
      } else {
        setTitle('');
        setDescription('');
        setStageId(prefilledStageId || '');
        setPriority('medium');
        setDueDate('');
        setAssignedTo('');
        setRelatedType(prefilledRelatedType || '');
        setRelatedId(prefilledRelatedId || '');
      }
    }
  }, [isOpen, task, prefilledStageId, prefilledRelatedType, prefilledRelatedId]);

  useEffect(() => {
    async function loadRelated() {
      if (!relatedType) {
        setRelatedOptions([]);
        return;
      }
      
      const tableMap: Record<string, string> = {
        'lead': 'leads',
        'parent': 'parents',
        'student': 'students',
        'tutor': 'tutors',
        'enquiry': 'enquiries'
      };
      const table = tableMap[relatedType];
      if (!table) return;

      let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(200);
      if (relatedType === 'enquiry') {
         query = supabase.from(table).select('*, leads(parent_name)').order('created_at', { ascending: false }).limit(200);
      }
      
      const { data } = await query;
      if (data) {
        const opts = data.map(d => {
           let name = 'Unknown';
           if (relatedType === 'lead') name = d.parent_name || d.first_name || 'Unnamed';
           else if (relatedType === 'enquiry') name = d.leads?.parent_name || d.parent_name || 'Unnamed';
           else name = [d.first_name, d.last_name].filter(Boolean).join(' ');
           return { id: d.id, name };
        });
        setRelatedOptions(opts);
      }
    }
    if (isOpen && relatedType) {
      loadRelated();
    }
  }, [relatedType, isOpen]);

  const fetchStages = async () => {
    const { data } = await supabase.from('task_stages').select('*').order('sort_order');
    if (data) {
      setStages(data);
      if (!task && !prefilledStageId && data.length > 0) {
        setStageId(data[0].id);
      }
    }
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name').order('full_name');
    if (data) {
      setStaffMembers(data.map(p => ({ id: p.id, name: p.full_name || 'Unnamed' })));
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !stageId) return;
    setLoading(true);

    const payload: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      stage_id: stageId,
      priority,
      due_date: dueDate || undefined,
      assigned_to: assignedTo || undefined,
      related_type: prefilledRelatedType ? prefilledRelatedType : (relatedType ? relatedType as any : null),
      related_id: prefilledRelatedId ? prefilledRelatedId : (relatedId ? relatedId : null),
    };

    let result;
    if (task) {
      result = await supabase.from('tasks').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', task.id);
    } else {
      result = await supabase.from('tasks').insert([payload]);
    }

    if (result.error) {
      console.error("Error saving task:", result.error);
      setErrorMsg(result.error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onUpdate();
    onClose();
  };

  const handleDelete = async () => {
    if (!task) return;
    setLoading(true);
    
    const { error } = await supabase.from('tasks').delete().eq('id', task.id);
    
    if (error) {
       console.error("Error deleting task:", error);
       setErrorMsg(error.message);
       setLoading(false);
       setShowDeleteConfirm(false);
       return;
    }

    setLoading(false);
    setShowDeleteConfirm(false);
    onUpdate();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleIcon}><CheckSquare size={18} /></span>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {errorMsg && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 500, border: '1px solid #f87171' }}>
              Failed to save task: {errorMsg}
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Task Title *</label>
            <Input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="What needs to be done?" 
              fullWidth 
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><AlignLeft size={14} /> Description</label>
            <textarea 
              className={styles.textarea}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Add additional details or context..." 
            />
          </div>

          <div className={`${styles.fieldGroup} ${styles.row}`}>
            <div>
              <label className={styles.label}>Stage *</label>
              <Select 
                value={stageId} 
                onChange={setStageId} 
                options={stages.map(s => ({ value: s.id, label: s.name }))}
                fullWidth 
              />
            </div>
            <div>
              <label className={styles.label}><Flag size={14} /> Priority</label>
              <Select 
                value={priority} 
                onChange={(val) => setPriority(val as TaskPriority)} 
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' }
                ]}
                fullWidth 
              />
            </div>
          </div>

          <div className={`${styles.fieldGroup} ${styles.row}`}>
            <div>
              <label className={styles.label}><Calendar size={14} /> Due Date</label>
              <DatePicker 
                value={dueDate}
                onChange={setDueDate}
                fullWidth 
                placeholder="dd/mm/yyyy"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <UserIcon size={14} style={{ marginRight: '6px' }} />
                Assigned To
              </label>
              <Select 
                value={assignedTo} 
                onChange={setAssignedTo}
                options={[
                  {value: '', label: 'Unassigned'},
                  ...staffMembers.map(s => ({ value: s.id, label: s.name }))
                ]}
              />
            </div>
          </div>

          {/* Dynamic Related Linking */}
          {!prefilledRelatedType && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Related To</label>
                <Select 
                  value={relatedType} 
                  onChange={(val) => { setRelatedType(val); setRelatedId(''); }}
                  options={[
                    {value: '', label: 'General Task (None)'},
                    {value: 'lead', label: 'Lead'},
                    {value: 'parent', label: 'Parent'},
                    {value: 'student', label: 'Student'},
                    {value: 'tutor', label: 'Tutor'}
                  ]}
                />
              </div>
              
              {relatedType && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Search {relatedType.charAt(0).toUpperCase() + relatedType.slice(1)}</label>
                  <Select 
                    value={relatedId} 
                    onChange={setRelatedId}
                    options={[
                      {value: '', label: 'Select...'},
                      ...relatedOptions.map(o => ({ value: o.id, label: o.name }))
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div>
            {task && (
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(true)} 
                disabled={loading}
                style={{ color: '#ef4444', borderColor: '#fecaca', backgroundColor: '#fef2f2' }}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={loading || !title.trim() || !stageId}>
              {loading ? 'Saving...' : 'Save Task'}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}
