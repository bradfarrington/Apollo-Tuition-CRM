import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ArrowLeft, Plus, Trash2, ChevronRight, Check, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import styles from './PipelineSettingsModal.module.css';

/* ---- Field registry per entity ---- */
const ENTITY_FIELDS: Record<string, { key: string; label: string }[]> = {
  enquiry: [
    { key: 'parent_name', label: 'Contact Name' },
    { key: 'student_summary', label: 'Students' },
    { key: 'enquiry_type', label: 'Enquiry Type' },
    { key: 'message', label: 'Initial Message' },
  ],
  parent: [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
  ],
  student: [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'school_year', label: 'Year Group' },
    { key: 'key_stage', label: 'Key Stage' },
    { key: 'status', label: 'Status' },
  ],
  tutor: [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'active_status', label: 'Status' },
  ],
};

const ENTITY_LABELS: Record<string, string> = {
  enquiry: 'Enquiries',
  parent: 'Parents',
  student: 'Students',
  tutor: 'Tutors',
  student_onboarding: 'Students',
  tutor_onboarding: 'Tutors',
  other: 'Other',
};

/* Only these 4 types are selectable when configuring a pipeline */
const SELECTABLE_TYPES: { key: string; label: string }[] = [
  { key: 'enquiry', label: 'Enquiries' },
  { key: 'parent', label: 'Parents' },
  { key: 'student', label: 'Students' },
  { key: 'tutor', label: 'Tutors' },
];

const DEFAULT_CARD_FIELDS: Record<string, string[]> = {
  enquiry: ['parent_name', 'student_summary'],
  parent: ['first_name', 'last_name', 'email'],
  student: ['first_name', 'last_name', 'school_year'],
  tutor: ['first_name', 'last_name', 'email'],
};

interface Pipeline {
  id: string;
  name: string;
  entity_type: string;
  allowed_entity_types: string[];
  card_display_fields: Record<string, string[]>;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  initialPipelineId?: string;
}

export function PipelineSettingsModal({ isOpen, onClose, onUpdate, initialPipelineId }: Props) {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [fieldConfigTab, setFieldConfigTab] = useState('enquiry');
  const [saving, setSaving] = useState(false);
  // Track local edits
  const [editName, setEditName] = useState('');
  const [editEntityTypes, setEditEntityTypes] = useState<string[]>([]);
  const [editCardFields, setEditCardFields] = useState<Record<string, string[]>>({});
  const [editIsDefault, setEditIsDefault] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPipelines();
      if (initialPipelineId) {
        // Open directly to edit view
        loadPipeline(initialPipelineId);
      } else {
        setView('list');
      }
    }
  }, [isOpen]);

  const fetchPipelines = async () => {
    const { data } = await supabase.from('pipelines').select('*').order('sort_order');
    setPipelines(data || []);
  };

  const loadPipeline = async (id: string) => {
    const [pRes, sRes] = await Promise.all([
      supabase.from('pipelines').select('*').eq('id', id).single(),
      supabase.from('pipeline_stages').select('*').eq('pipeline_id', id).order('sort_order'),
    ]);
    if (pRes.data) {
      const p = pRes.data as Pipeline;
      setEditingPipeline(p);
      setEditName(p.name);
      setEditEntityTypes(p.allowed_entity_types || [p.entity_type]);
      setEditCardFields(p.card_display_fields || DEFAULT_CARD_FIELDS);
      setEditIsDefault(p.is_default);
      setEditIsActive(p.is_active);
      setFieldConfigTab((p.allowed_entity_types || [p.entity_type])[0] || 'enquiry');
    }
    setStages(sRes.data || []);
    setView('edit');
  };

  const handleCreatePipeline = async () => {
    const { data, error } = await supabase.from('pipelines').insert({
      name: 'New Pipeline',
      entity_type: 'enquiry',
      allowed_entity_types: ['enquiry'],
      card_display_fields: DEFAULT_CARD_FIELDS,
      is_default: false,
      is_active: true,
      sort_order: pipelines.length,
    }).select().single();
    if (error) { console.error(error); return; }
    if (data) {
      // Create default stages
      await supabase.from('pipeline_stages').insert([
        { pipeline_id: data.id, name: 'New', color: '#3b82f6', sort_order: 0, is_active: true },
        { pipeline_id: data.id, name: 'In Progress', color: '#f59e0b', sort_order: 1, is_active: true },
        { pipeline_id: data.id, name: 'Complete', color: '#10b981', sort_order: 2, is_active: true },
      ]);
      await fetchPipelines();
      loadPipeline(data.id);
      onUpdate();
    }
  };

  const handleSave = async () => {
    if (!editingPipeline) return;
    setSaving(true);
    // Save pipeline
    await supabase.from('pipelines').update({
      name: editName,
      allowed_entity_types: editEntityTypes,
      card_display_fields: editCardFields,
      is_default: editIsDefault,
      is_active: editIsActive,
      updated_at: new Date().toISOString(),
    }).eq('id', editingPipeline.id);

    // Save stages — upsert existing, delete removed
    const existingIds = stages.filter(s => !s.id.startsWith('new-')).map(s => s.id);
    // Delete removed stages
    if (editingPipeline.id) {
      const { data: dbStages } = await supabase.from('pipeline_stages').select('id').eq('pipeline_id', editingPipeline.id);
      const toDelete = (dbStages || []).filter(s => !existingIds.includes(s.id)).map(s => s.id);
      if (toDelete.length) {
        await supabase.from('pipeline_stages').delete().in('id', toDelete);
      }
    }
    // Upsert stages
    for (const stage of stages) {
      if (stage.id.startsWith('new-')) {
        await supabase.from('pipeline_stages').insert({
          pipeline_id: editingPipeline.id,
          name: stage.name,
          color: stage.color,
          sort_order: stage.sort_order,
          is_active: true,
        });
      } else {
        await supabase.from('pipeline_stages').update({
          name: stage.name,
          color: stage.color,
          sort_order: stage.sort_order,
        }).eq('id', stage.id);
      }
    }

    setSaving(false);
    await fetchPipelines();
    onUpdate();
    setView('list');
  };

  const handleDeletePipeline = async (id: string) => {
    await supabase.from('pipeline_cards').delete().eq('pipeline_id', id);
    await supabase.from('pipelines').delete().eq('id', id);
    await fetchPipelines();
    setDeleteConfirm(null);
    setView('list');
    onUpdate();
  };

  const toggleEntityType = (type: string) => {
    setEditEntityTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCardField = (entityType: string, field: string) => {
    setEditCardFields(prev => {
      const current = prev[entityType] || [];
      const updated = current.includes(field)
        ? current.filter(f => f !== field)
        : [...current, field];
      return { ...prev, [entityType]: updated };
    });
  };

  const addStage = () => {
    setStages(prev => [...prev, {
      id: `new-${Date.now()}`,
      pipeline_id: editingPipeline?.id || '',
      name: '',
      color: '#6b7280',
      sort_order: prev.length,
      is_active: true,
    }]);
  };

  const updateStage = (index: number, updates: Partial<Stage>) => {
    setStages(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const removeStage = (index: number) => {
    setStages(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, sort_order: i })));
  };

  const handleStageDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('stageIndex', index.toString());
  };

  const handleStageDrop = (e: React.DragEvent, destIndex: number) => {
    e.preventDefault();
    const srcIndex = parseInt(e.dataTransfer.getData('stageIndex'), 10);
    if (srcIndex === destIndex) return;
    const newStages = [...stages];
    const [moved] = newStages.splice(srcIndex, 1);
    newStages.splice(destIndex, 0, moved);
    setStages(newStages.map((s, i) => ({ ...s, sort_order: i })));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {view === 'edit' && (
              <button className={styles.backBtn} onClick={() => { setView('list'); setEditingPipeline(null); }}>
                <ArrowLeft size={18} />
              </button>
            )}
            <h2 className={styles.title}>
              {view === 'list' ? 'Pipeline Settings' : `Edit: ${editName}`}
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {view === 'list' ? (
            <>
              <div className={styles.pipelineList}>
                {pipelines.map(p => (
                  <div key={p.id} className={styles.pipelineItem} onClick={() => loadPipeline(p.id)}>
                    <div className={styles.pipelineItemLeft}>
                      <div className={styles.pipelineItemName}>{p.name}</div>
                      <div className={styles.pipelineItemMeta}>
                        {(p.allowed_entity_types || [p.entity_type]).map(t => ENTITY_LABELS[t] || t).join(', ')}
                      </div>
                    </div>
                    <div className={styles.pipelineItemActions}>
                      <button className={`${styles.pipelineItemBtn} ${styles.danger}`} onClick={e => { e.stopPropagation(); setDeleteConfirm(p.id); }}>
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.addPipelineBtn} onClick={handleCreatePipeline}>
                <Plus size={16} /> Create New Pipeline
              </button>
            </>
          ) : editingPipeline && (
            <>
              {/* Pipeline Name */}
              <div className={styles.editSection}>
                <h3 className={styles.editSectionTitle}>Pipeline Details</h3>
                <div className={styles.editField}>
                  <label className={styles.editFieldLabel}>Name</label>
                  <Input value={editName} onChange={e => setEditName(e.target.value)} fullWidth />
                </div>
              </div>

              {/* Entity Types */}
              <div className={styles.editSection}>
                <h3 className={styles.editSectionTitle}>Contact Types</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                  Choose which types of contacts can be added to this pipeline.
                </p>
                <div className={styles.entityToggles}>
                  {SELECTABLE_TYPES.map(({ key, label }) => (
                    <button
                      key={key}
                      className={`${styles.entityToggle} ${editEntityTypes.includes(key) ? styles.active : ''}`}
                      onClick={() => toggleEntityType(key)}
                    >
                      <span className={styles.toggleCheckbox}>
                        {editEntityTypes.includes(key) && <Check size={10} />}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Display Fields */}
              <div className={styles.editSection}>
                <h3 className={styles.editSectionTitle}>Card Display Fields</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                  Choose which data fields appear on kanban cards for each contact type.
                </p>
                {editEntityTypes.length > 0 && (
                  <div className={styles.fieldConfigSection}>
                    {editEntityTypes.length > 1 && (
                      <div className={styles.fieldConfigEntityTab}>
                        {editEntityTypes.map(et => (
                          <button
                            key={et}
                            className={`${styles.fieldConfigEntityTabBtn} ${fieldConfigTab === et ? styles.active : ''}`}
                            onClick={() => setFieldConfigTab(et)}
                          >
                            {ENTITY_LABELS[et]}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className={styles.fieldToggles}>
                      {(ENTITY_FIELDS[fieldConfigTab] || []).map(field => {
                        const isOn = (editCardFields[fieldConfigTab] || []).includes(field.key);
                        return (
                          <div key={field.key} className={`${styles.fieldToggle} ${isOn ? styles.active : ''}`}>
                            <div className={styles.fieldToggleLeft}>
                              <span className={styles.fieldToggleName}>{field.label}</span>
                            </div>
                            <button
                              className={`${styles.switch} ${isOn ? styles.on : ''}`}
                              onClick={() => toggleCardField(fieldConfigTab, field.key)}
                            >
                              <span className={styles.switchDot} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Stages */}
              <div className={styles.editSection}>
                <h3 className={styles.editSectionTitle}>Pipeline Stages</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 12px 0' }}>
                  Drag to reorder. Each stage becomes a column on the kanban board.
                </p>
                <div className={styles.stagesList}>
                  {stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={styles.stageItem}
                      draggable
                      onDragStart={e => handleStageDragStart(e, index)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleStageDrop(e, index)}
                    >
                      <span className={styles.stageDragHandle}><GripVertical size={14} /></span>
                      <input
                        type="color"
                        value={stage.color || '#6b7280'}
                        onChange={e => updateStage(index, { color: e.target.value })}
                        className={styles.stageColorInput}
                      />
                      <input
                        type="text"
                        value={stage.name}
                        onChange={e => updateStage(index, { name: e.target.value })}
                        placeholder="Stage name..."
                        className={styles.stageNameInput}
                      />
                      <button className={styles.stageRemoveBtn} onClick={() => removeStage(index)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button className={styles.addStageBtn} onClick={addStage}>
                  <Plus size={14} /> Add Stage
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {view === 'edit' && (
          <div className={styles.footer}>
            <Button variant="secondary" onClick={() => { setView('list'); setEditingPipeline(null); }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeletePipeline(deleteConfirm)}
        title="Delete Pipeline"
        message="Are you sure you want to delete this pipeline? All stages and cards within it will be permanently removed."
      />
    </div>
  );
}
