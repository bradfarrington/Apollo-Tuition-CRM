import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Settings, Plus, X, Mail, Phone, Check, Columns3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PipelineSettingsModal } from './PipelineSettingsModal';
import styles from './PipelineKanbanPage.module.css';

/* ---- Types ---- */
interface Pipeline {
  id: string;
  name: string;
  entity_type: string;
  allowed_entity_types: string[];
  card_display_fields: Record<string, string[]>;
  is_default: boolean;
  is_active: boolean;
}

interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  sort_order: number;
}

interface PipelineCard {
  id: string;
  pipeline_id: string;
  stage_id: string;
  entity_type: string;
  entity_id: string;
  sort_order: number;
  entity_data?: Record<string, any>;
}

const ENTITY_LABELS: Record<string, string> = {
  enquiry: 'Enquiry',
  parent: 'Parent',
  student: 'Student',
  tutor: 'Tutor',
};

const ENTITY_TABLE: Record<string, string> = {
  enquiry: 'enquiries',
  parent: 'parents',
  student: 'students',
  tutor: 'tutors',
};

const FIELD_ICONS: Record<string, React.ReactNode> = {
  email: <Mail size={11} />,
  phone: <Phone size={11} />,
};

function getEntityTitle(entityType: string, data: Record<string, any>): string {
  if (entityType === 'enquiry') return data.parent_name || 'Unnamed Prospect';
  if (entityType === 'lead') return data.parent_name || 'Unnamed Lead';
  return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unnamed';
}

function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PipelineKanbanPage() {
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [cards, setCards] = useState<PipelineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addEntityModal, setAddEntityModal] = useState<{ stageId: string } | null>(null);
  const [addEntityTab, setAddEntityTab] = useState('lead');
  const [addEntitySearch, setAddEntitySearch] = useState('');
  const [addEntityResults, setAddEntityResults] = useState<any[]>([]);
  const [existingEntityIds, setExistingEntityIds] = useState<Set<string>>(new Set());
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  /* ---- Fetch pipelines ---- */
  const fetchPipelines = useCallback(async () => {
    const { data } = await supabase.from('pipelines').select('*').eq('is_active', true).order('sort_order');
    const pList = data || [];
    setPipelines(pList);
    if (pList.length > 0 && (!selectedPipelineId || !pList.find(p => p.id === selectedPipelineId))) {
      setSelectedPipelineId(pList[0].id);
    }
  }, [selectedPipelineId]);

  /* ---- Fetch stages + cards for selected pipeline ---- */
  const fetchBoard = useCallback(async () => {
    if (!selectedPipelineId) { setLoading(false); return; }
    setLoading(true);
    // Stages
    const { data: stageData } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('pipeline_id', selectedPipelineId)
      .order('sort_order');
    setStages(stageData || []);

    // Cards
    const { data: cardData } = await supabase
      .from('pipeline_cards')
      .select('*')
      .eq('pipeline_id', selectedPipelineId)
      .order('sort_order');

    if (cardData && cardData.length > 0) {
      // Group by entity type and batch-fetch entity data
      const grouped: Record<string, string[]> = {};
      for (const c of cardData) {
        if (!grouped[c.entity_type]) grouped[c.entity_type] = [];
        grouped[c.entity_type].push(c.entity_id);
      }

      const entityDataMap: Record<string, Record<string, any>> = {};
      for (const [entityType, ids] of Object.entries(grouped)) {
        const table = ENTITY_TABLE[entityType];
        if (!table) continue;
        
        let query = supabase.from(table).select('*');
        if (entityType === 'enquiry') {
          query = supabase.from(table).select('*, leads(parent_name, email, phone)');
        }
        
        const { data: rows } = await query.in('id', ids);
        if (rows) {
          for (const row of rows) {
            if (entityType === 'enquiry') {
               // Flatten joined fields to match existing Kanban property rendering
               row.parent_name = row.leads?.parent_name;
               row.email = row.leads?.email;
               row.phone = row.leads?.phone;
               const stu = row.students || [];
               row.student_summary = stu.map((s: any) => `${s.first_name || 'Unnamed'} (${s.year_group || '?'})`).join(', ') || 'No students';
            }
            entityDataMap[row.id] = row;
          }
        }
      }

      setCards(cardData.map(c => ({
        ...c,
        entity_data: entityDataMap[c.entity_id] || {},
      })));
      setExistingEntityIds(new Set(cardData.map(c => c.entity_id)));
    } else {
      setCards([]);
      setExistingEntityIds(new Set());
    }
    setLoading(false);
  }, [selectedPipelineId]);

  useEffect(() => { fetchPipelines(); }, []);
  useEffect(() => { if (selectedPipelineId) fetchBoard(); }, [selectedPipelineId, fetchBoard]);

  /* ---- Drag & Drop ---- */
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => target.classList.add(styles.dragging), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove(styles.dragging);
    setDragOverStageId(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStageId(stageId);
  };

  const handleColumnDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleColumnDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;

    // Optimistic update
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, stage_id: stageId } : c));
    // Persist
    await supabase.from('pipeline_cards').update({ stage_id: stageId }).eq('id', cardId);
  };

  /* ---- Add Entity Modal ---- */
  const openAddEntity = (stageId: string) => {
    const allowedTypes = selectedPipeline?.allowed_entity_types || ['enquiry'];
    setAddEntityTab(allowedTypes[0] || 'enquiry');
    setAddEntitySearch('');
    setAddEntityResults([]);
    setAddEntityModal({ stageId });
    searchEntities(allowedTypes[0] || 'enquiry', '');
  };

  const searchEntities = async (entityType: string, term: string) => {
    const table = ENTITY_TABLE[entityType];
    if (!table) return;
    let query = supabase.from(table).select('*').limit(20);
    if (entityType === 'enquiry') {
      // Need to query leads via a join or fetch enquiries and join leads
      query = supabase.from('enquiries').select('*, leads!inner(parent_name, email, phone)').limit(20);
      if (term) query = query.ilike('leads.parent_name', `%${term}%`);
    } else if (entityType === 'lead') {
      query = query.is('deleted_at', null);
      if (term) query = query.ilike('parent_name', `%${term}%`);
    } else {
      query = query.is('deleted_at', null);
      if (term) query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%`);
    }
    const { data } = await query.order('created_at', { ascending: false });
    setAddEntityResults(data || []);
  };

  const handleAddEntityTabChange = (type: string) => {
    setAddEntityTab(type);
    setAddEntitySearch('');
    searchEntities(type, '');
  };

  const handleAddEntitySearch = (term: string) => {
    setAddEntitySearch(term);
    searchEntities(addEntityTab, term);
  };

  const handleAddEntityToStage = async (entityId: string) => {
    if (!addEntityModal || !selectedPipelineId) return;
    const stageCards = cards.filter(c => c.stage_id === addEntityModal.stageId);
    await supabase.from('pipeline_cards').insert({
      pipeline_id: selectedPipelineId,
      stage_id: addEntityModal.stageId,
      entity_type: addEntityTab,
      entity_id: entityId,
      sort_order: stageCards.length,
    });
    setAddEntityModal(null);
    fetchBoard();
  };

  const handleRemoveCard = async (cardId: string) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    await supabase.from('pipeline_cards').delete().eq('id', cardId);
  };

  const handleCardClick = (card: PipelineCard) => {
    if (card.entity_type === 'enquiry') {
      // Enquiries live under their parent lead – navigate to the lead and
      // pass the enquiry id so the sidebar auto-opens for that enquiry.
      const leadId = card.entity_data?.lead_id;
      if (leadId) {
        navigate(`/leads/${leadId}`, { state: { openEnquiryId: card.entity_id } });
      }
      return;
    }
    const routes: Record<string, string> = {
      lead: '/leads',
      parent: '/parents',
      student: '/students',
      tutor: '/tutors',
    };
    const base = routes[card.entity_type] || '/leads';
    navigate(`${base}/${card.entity_id}`);
  };

  /* ---- Render ---- */
  const cardDisplayFields = selectedPipeline?.card_display_fields || {};

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Pipelines</h1>
          <p className={styles.subtitle}>Drag and drop contacts between stages to track progress.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
            Settings
          </Button>
        </div>
      </header>

      {/* Pipeline Switcher */}
      {pipelines.length > 0 && (
        <div className={styles.pipelineSwitcher}>
          <span className={styles.switcherLabel}>Pipeline:</span>
          <div className={styles.switcherTabs}>
            {pipelines.map(p => (
              <button
                key={p.id}
                className={`${styles.switcherTab} ${p.id === selectedPipelineId ? styles.active : ''}`}
                onClick={() => setSelectedPipelineId(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
          {selectedPipeline && (
            <div className={styles.entityBadges}>
              {(selectedPipeline.allowed_entity_types || [selectedPipeline.entity_type]).map(t => (
                <span key={t} className={`${styles.entityTypeBadge} ${styles[t]}`}>
                  {ENTITY_LABELS[t]}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Board */}
      {loading ? (
        <div className={styles.loading}>Loading pipeline...</div>
      ) : pipelines.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Columns3 size={28} /></div>
          <h2 className={styles.emptyStateTitle}>No pipelines yet</h2>
          <p className={styles.emptyStateText}>Create your first pipeline to start tracking contacts through stages.</p>
          <Button variant="primary" onClick={() => setSettingsOpen(true)}>
            <Plus size={16} /> Create Pipeline
          </Button>
        </div>
      ) : stages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><Columns3 size={28} /></div>
          <h2 className={styles.emptyStateTitle}>No stages configured</h2>
          <p className={styles.emptyStateText}>Open settings to add stages to this pipeline.</p>
          <Button variant="primary" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} /> Open Settings
          </Button>
        </div>
      ) : (
        <div className={styles.board}>
          {stages.map(stage => {
            const stageCards = cards.filter(c => c.stage_id === stage.id);
            const isDragOver = dragOverStageId === stage.id;
            return (
              <div
                key={stage.id}
                className={`${styles.column} ${isDragOver ? styles.dragOver : ''}`}
                onDragOver={e => handleColumnDragOver(e, stage.id)}
                onDragLeave={handleColumnDragLeave}
                onDrop={e => handleColumnDrop(e, stage.id)}
              >
                <div className={styles.columnHeader}>
                  <div className={styles.columnHeaderLeft}>
                    <span className={styles.columnColorDot} style={{ backgroundColor: stage.color || '#6b7280' }} />
                    <span className={styles.columnName}>{stage.name}</span>
                    <span className={styles.columnCount}>{stageCards.length}</span>
                  </div>
                  <button className={styles.columnAddBtn} onClick={() => openAddEntity(stage.id)} title="Add contact">
                    <Plus size={16} />
                  </button>
                </div>

                <div className={styles.cardsList}>
                  {stageCards.length === 0 && (
                    <div className={styles.dropPlaceholder}>
                      Drop here or click + to add
                    </div>
                  )}
                  {stageCards.map(card => {
                    const data = card.entity_data || {};
                    const title = getEntityTitle(card.entity_type, data);
                    const fields = cardDisplayFields[card.entity_type] || [];
                    const displayFields = fields.filter(f => {
                      if (card.entity_type === 'enquiry' && f === 'parent_name') return false;
                      if (card.entity_type === 'lead' && f === 'parent_name') return false;
                      if (card.entity_type !== 'lead' && card.entity_type !== 'enquiry' && (f === 'first_name' || f === 'last_name')) return false;
                      return true;
                    });

                    return (
                      <div
                        key={card.id}
                        className={styles.card}
                        draggable
                        onDragStart={e => handleDragStart(e, card.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleCardClick(card)}
                      >
                        <div className={styles.cardActions}>
                          <button
                            className={styles.cardActionBtn}
                            onClick={e => { e.stopPropagation(); handleRemoveCard(card.id); }}
                            title="Remove from pipeline"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <span className={`${styles.cardEntityBadge} ${styles[card.entity_type]}`}>
                          {ENTITY_LABELS[card.entity_type]}
                        </span>
                        <div className={styles.cardTitle}>{title}</div>
                        <div className={styles.cardFields}>
                          {displayFields.map(field => (
                            <div key={field} className={styles.cardField}>
                              {FIELD_ICONS[field] || null}
                              <span>{data[field] || '-'}</span>
                            </div>
                          ))}
                        </div>
                        {data.created_at && (
                          <div className={styles.cardTimestamp}>{timeAgo(data.created_at)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Entity Modal */}
      {addEntityModal && selectedPipeline && (
        <div className={styles.addEntityOverlay} onClick={() => setAddEntityModal(null)}>
          <div className={styles.addEntityModal} onClick={e => e.stopPropagation()}>
            <div className={styles.addEntityHeader}>
              <h3>Add to Stage</h3>
              <button className={styles.addEntityCloseBtn} onClick={() => setAddEntityModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.addEntitySearch}>
              <Input
                placeholder={`Search ${ENTITY_LABELS[addEntityTab]?.toLowerCase() || 'contacts'}...`}
                value={addEntitySearch}
                onChange={e => handleAddEntitySearch(e.target.value)}
                fullWidth
              />
            </div>
            <div className={styles.addEntityTabs}>
              {(selectedPipeline.allowed_entity_types || [selectedPipeline.entity_type]).map(et => (
                <button
                  key={et}
                  className={`${styles.addEntityTab} ${addEntityTab === et ? styles.active : ''}`}
                  onClick={() => handleAddEntityTabChange(et)}
                >
                  {ENTITY_LABELS[et]}s
                </button>
              ))}
            </div>
            <div className={styles.addEntityList}>
              {addEntityResults.map(entity => {
                const name = (addEntityTab === 'enquiry' || addEntityTab === 'lead')
                  ? (entity.leads?.parent_name || entity.parent_name || 'Unnamed Prospect')
                  : [entity.first_name, entity.last_name].filter(Boolean).join(' ') || 'Unnamed';
                const isAlreadyAdded = existingEntityIds.has(entity.id);
                return (
                  <button
                    key={entity.id}
                    className={styles.addEntityItem}
                    onClick={() => !isAlreadyAdded && handleAddEntityToStage(entity.id)}
                    disabled={isAlreadyAdded}
                    style={isAlreadyAdded ? { opacity: 0.5 } : {}}
                  >
                    <div className={`${styles.addEntityItemAvatar} ${styles[addEntityTab]}`}>
                      {getInitials(name)}
                    </div>
                    <div className={styles.addEntityItemInfo}>
                      <div className={styles.addEntityItemName}>{name}</div>
                      <div className={styles.addEntityItemMeta}>
                        {addEntityTab === 'enquiry' ? (entity.leads?.email || entity.leads?.phone || '-') : (entity.email || entity.phone || '-')}
                      </div>
                    </div>
                    {isAlreadyAdded && (
                      <span className={styles.addEntityItemCheck}><Check size={16} /></span>
                    )}
                  </button>
                );
              })}
              {addEntityResults.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                  No {ENTITY_LABELS[addEntityTab]?.toLowerCase()}s found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <PipelineSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdate={() => { fetchPipelines(); fetchBoard(); }}
      />
    </div>
  );
}
