import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pipelineId: string, stageId: string) => void;
  entityType?: 'enquiry' | 'lead';
}

export function ReinstateModal({ isOpen, onClose, onConfirm, entityType = 'enquiry' }: Props) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [selectedStageId, setSelectedStageId] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      supabase.from('pipelines').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
         if (data) {
           const valid = data.filter(p => !p.allowed_entity_types || p.allowed_entity_types.includes(entityType));
           setPipelines(valid);
           if (valid.length > 0) setSelectedPipelineId(valid[0].id);
         }
      });
    }
  }, [isOpen, entityType]);

  useEffect(() => {
    if (selectedPipelineId) {
      supabase.from('pipeline_stages').select('*').eq('pipeline_id', selectedPipelineId).order('sort_order').then(({ data }) => {
         if (data) {
           setStages(data);
           if (data.length > 0) setSelectedStageId(data[0].id);
         }
      });
    } else {
      setStages([]);
      setSelectedStageId('');
    }
  }, [selectedPipelineId]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ backgroundColor: 'var(--color-bg-base)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Re-instate Enquiry</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}><X size={18} /></button>
        </div>
        <p style={{ margin: '0 0 var(--spacing-4) 0', color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
          Choose a pipeline and stage to place this enquiry back into active tracking.
        </p>

        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Pipeline</label>
          <select 
            value={selectedPipelineId} 
            onChange={e => setSelectedPipelineId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-base)', fontSize: '14px' }}
          >
            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Stage</label>
          <select 
            value={selectedStageId} 
            onChange={e => setSelectedStageId(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-base)', fontSize: '14px' }}
            disabled={stages.length === 0}
          >
            {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { onConfirm(selectedPipelineId, selectedStageId); onClose(); }} disabled={!selectedPipelineId || !selectedStageId}>
            Re-instate
          </Button>
        </div>
      </div>
    </div>
  );
}
