import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Plus, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { HexColorPicker } from 'react-colorful';
import type { TaskStage } from '../../types/tasks';
import styles from './TaskSettingsModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function TaskSettingsModal({ isOpen, onClose, onUpdate }: Props) {
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStages();
    }
  }, [isOpen]);

  const fetchStages = async () => {
    const { data } = await supabase.from('task_stages').select('*').order('sort_order');
    setStages(data || []);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const existingIds = stages.filter(s => !s.id.startsWith('new-')).map(s => s.id);
    // Delete removed stages
    const { data: dbStages } = await supabase.from('task_stages').select('id');
    const toDelete = (dbStages || []).filter(s => !existingIds.includes(s.id)).map(s => s.id);
    if (toDelete.length) {
      await supabase.from('task_stages').delete().in('id', toDelete);
    }
    
    // Upsert stages
    for (const stage of stages) {
      if (stage.id.startsWith('new-')) {
        await supabase.from('task_stages').insert({
          name: stage.name,
          color: stage.color,
          sort_order: stage.sort_order,
          is_active: true,
        });
      } else {
        await supabase.from('task_stages').update({
          name: stage.name,
          color: stage.color,
          sort_order: stage.sort_order,
        }).eq('id', stage.id);
      }
    }

    setSaving(false);
    await fetchStages();
    onUpdate();
    onClose();
  };

  const addStage = () => {
    setStages(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: '',
      color: '#6b7280',
      sort_order: prev.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TaskStage]);
  };

  const updateStage = (index: number, updates: Partial<TaskStage>) => {
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
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Task Board Stages</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.content}>
          <div className={styles.editSection}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
              Drag to reorder. Each stage becomes a column on the Tasks tab.
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
                  
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        backgroundColor: stage.color || '#6b7280',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      onClick={() => setActiveColorPicker(activeColorPicker === stage.id ? null : stage.id)}
                    />
                    
                    {activeColorPicker === stage.id && (
                      <>
                        <div 
                          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} 
                          onClick={() => setActiveColorPicker(null)} 
                        />
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '8px',
                          zIndex: 20,
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-lg)'
                        }}>
                          <HexColorPicker color={stage.color || '#6b7280'} onChange={(c) => updateStage(index, { color: c })} />
                        </div>
                      </>
                    )}
                  </div>

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
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
