import { useState, useEffect, useCallback } from 'react';
// unused import removed
import { supabase } from '../../lib/supabase';
import { Settings, Plus, CheckSquare, Calendar, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TaskSettingsModal } from './TaskSettingsModal';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import type { Task, TaskStage } from '../../types/tasks';
import styles from '../pipelines/PipelineKanbanPage.module.css'; // Reusing pipeline CSS

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ENTITY_TABLE: Record<string, string> = {
  lead: 'leads',
  parent: 'parents',
  student: 'students',
  tutor: 'tutors',
  enquiry: 'enquiries'
};

function getEntityName(entityType: string, data: any): string {
  if (!data) return 'Unknown';
  if (entityType === 'lead') return data.parent_name || data.first_name || 'Unnamed Lead';
  if (entityType === 'enquiry') return data.leads?.parent_name || data.parent_name || 'Unnamed Enquiry';
  return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unnamed';
}

export function TasksKanbanPage() {
  const [stages, setStages] = useState<TaskStage[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Task form modal logic
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [prefilledStageId, setPrefilledStageId] = useState<string | undefined>(undefined);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    // Stages
    const { data: stageData } = await supabase
      .from('task_stages')
      .select('*')
      .order('sort_order');
    setStages(stageData || []);

    // Tasks (joining with assignee profiles)
    const { data: taskData } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assigned_to_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    // Ensure stage_id is valid, otherwise assign to first stage
    let tasksToSet = taskData as any || [];
    if (stageData && stageData.length > 0) {
       const stageIds = stageData.map(s => s.id);
       tasksToSet = tasksToSet.map((t: Task) => {
         if (!t.stage_id || !stageIds.includes(t.stage_id)) {
           return { ...t, stage_id: stageIds[0] };
         }
         return t;
       });
    }

    // Resolve related names
    const resolvedTasks = [...tasksToSet];
    const grouped: Record<string, string[]> = {};
    for (const t of resolvedTasks) {
      if (t.related_type && t.related_id) {
        if (!grouped[t.related_type]) grouped[t.related_type] = [];
        grouped[t.related_type].push(t.related_id);
      }
    }

    const entityDataMap: Record<string, Record<string, any>> = {};
    for (const [entityType, ids] of Object.entries(grouped)) {
      const table = ENTITY_TABLE[entityType];
      if (!table) continue;
      
      let query = supabase.from(table).select('*');
      if (entityType === 'enquiry') {
        query = supabase.from(table).select('*, leads(parent_name)');
      }
      
      const { data: rows } = await query.in('id', Array.from(new Set(ids)));
      if (rows) {
        for (const row of rows) {
          entityDataMap[row.id] = row;
        }
      }
    }

    const finalTasks = resolvedTasks.map((t: any) => ({
      ...t,
      related_name: (t.related_type && t.related_id && entityDataMap[t.related_id]) 
        ? getEntityName(t.related_type, entityDataMap[t.related_id]) 
        : null
    }));

    setTasks(finalTasks);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  /* ---- Drag & Drop ---- */
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
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
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage_id: stageId } : t));
    // Persist
    await supabase.from('tasks').update({ stage_id: stageId }).eq('id', taskId);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setPrefilledStageId(undefined);
    setTaskFormOpen(true);
  };

  const handleAddTask = (stageId?: string) => {
    setEditingTask(undefined);
    setPrefilledStageId(stageId);
    setTaskFormOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTaskId) return;
    const idToDelete = deleteTaskId;
    
    // Optimistic UI update
    setTasks(prev => prev.filter(t => t.id !== idToDelete));
    setDeleteTaskId(null);
    
    const { error } = await supabase.from('tasks').delete().eq('id', idToDelete);
    if (error) {
      console.error('Failed to delete task:', error);
      fetchBoard(); // Revert on failure
    }
  };

  const renderPriorityBadge = (priority: string) => {
    const map: Record<string, { color: string, bg: string, label: string }> = {
      urgent: { color: '#dc2626', bg: '#fef2f2', label: 'Urgent' },
      high: { color: '#ea580c', bg: '#fff7ed', label: 'High' },
      medium: { color: '#2563eb', bg: '#eff6ff', label: 'Medium' },
      low: { color: '#16a34a', bg: '#f0fdf4', label: 'Low' }
    };
    const conf = map[priority] || map.medium;
    return (
       <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: conf.color, background: conf.bg, padding: '2px 6px', borderRadius: '4px' }}>
         {priority === 'urgent' && <AlertCircle size={10} />}
         {conf.label}
       </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Tasks</h1>
          <p className={styles.subtitle}>Manage your tasks and track progress.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => handleAddTask()}>
            <Plus size={16} />
            Add Task
          </Button>
          <Button variant="secondary" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
            Task Board
          </Button>
        </div>
      </header>

      {/* Board */}
      {loading ? (
        <div className={styles.loading}>Loading tasks...</div>
      ) : stages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><CheckSquare size={28} /></div>
          <h2 className={styles.emptyStateTitle}>No task stages</h2>
          <p className={styles.emptyStateText}>Open settings to configure your Task Board stages.</p>
          <Button variant="primary" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} /> Open Board Settings
          </Button>
        </div>
      ) : (
        <div className={styles.board} style={{ marginTop: '16px' }}>
          {stages.map(stage => {
            const stageTasks = tasks.filter(t => t.stage_id === stage.id);
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
                    <span className={styles.columnCount}>{stageTasks.length}</span>
                  </div>
                  <button className={styles.columnAddBtn} onClick={() => handleAddTask(stage.id)} title="Add Task">
                    <Plus size={16} />
                  </button>
                </div>

                <div className={styles.cardsList}>
                  {stageTasks.length === 0 && (
                    <div className={styles.dropPlaceholder}>
                      Drop here or click + to add
                    </div>
                  )}
                  {stageTasks.map(task => (
                    <div
                      key={task.id}
                      className={styles.card}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTaskClick(task)}
                      style={{ padding: '16px', gap: '8px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--color-text-primary)' }}>{task.title}</div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeleteTaskId(task.id); }}
                              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px' }}
                              onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                            >
                              <Trash2 size={13} />
                            </button>
                         </div>
                      
                      {(task as any).related_type && (task as any).related_name && (
                        <div style={{ fontSize: '11px', color: 'var(--color-primary)', display: 'inline-flex', background: 'var(--color-primary-light)15', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                           Related: {(task as any).related_name}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                           {renderPriorityBadge(task.priority)}
                        </div>
                        {task.due_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                            <Calendar size={11} />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '8px' }}>
                         <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                            {task.assignee?.full_name ? task.assignee.full_name : 'Unassigned'}
                         </div>
                         <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                           <Clock size={10} />
                           {timeAgo(task.created_at)}
                         </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Settings Modal */}
      <TaskSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdate={() => { fetchBoard(); }}
      />
      
      {/* Task Form Modal */}
      <TaskFormModal
         isOpen={taskFormOpen}
         onClose={() => setTaskFormOpen(false)}
         onUpdate={() => fetchBoard()}
         task={editingTask}
         prefilledStageId={prefilledStageId}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTaskId}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={executeDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
}
