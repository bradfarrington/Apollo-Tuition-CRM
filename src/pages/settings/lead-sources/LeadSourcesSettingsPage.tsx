import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Input } from '../../../components/ui/Input';
import { Trash2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import styles from '../subjects/SubjectsSettingsPage.module.css';

interface LeadSource {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

export function LeadSourcesSettingsPage() {
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<LeadSource | undefined>(undefined);
  const [deletingSource, setDeletingSource] = useState<LeadSource | null>(null);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSources = useCallback(async () => {
    const { data } = await supabase
      .from('lead_sources')
      .select('*')
      .order('sort_order');
    setSources(data || []);
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const handleAdd = () => {
    setEditingSource(undefined);
    setFormName('');
    setFormActive(true);
    setIsFormOpen(true);
  };

  const handleEdit = (source: LeadSource) => {
    setEditingSource(source);
    setFormName(source.name);
    setFormActive(source.is_active);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);

    if (editingSource) {
      await supabase.from('lead_sources').update({
        name: formName.trim(),
        is_active: formActive,
        updated_at: new Date().toISOString()
      }).eq('id', editingSource.id);
    } else {
      const nextOrder = sources.length;
      await supabase.from('lead_sources').insert({
        name: formName.trim(),
        is_active: formActive,
        sort_order: nextOrder
      });
    }

    setSaving(false);
    setIsFormOpen(false);
    fetchSources();
  };

  const confirmDelete = async () => {
    if (deletingSource) {
      await supabase.from('lead_sources').delete().eq('id', deletingSource.id);
      setDeletingSource(null);
      fetchSources();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Lead Sources</h1>
          <p className={styles.subtitle}>Manage how parents/guardians hear about your business</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          Add Source
        </Button>
      </header>

      <Card>
        <CardHeader title="All Lead Sources" />
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Source Name</th>
                  <th>Status</th>
                  <th className={styles.actionsCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <div className={styles.subjectName}>
                        {source.name}
                      </div>
                    </td>
                    <td>
                      <StatusBadge
                        status={source.is_active ? 'active' : 'inactive'}
                        label={source.is_active ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionGroup}>
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(source)}>
                          Edit
                        </Button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => setDeletingSource(source)}
                          title="Delete source"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sources.length === 0 && (
                  <tr>
                    <td colSpan={3} className={styles.emptyCell}>
                      No lead sources configured yet. Click "Add Source" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className={styles.confirmOverlay} onClick={() => setIsFormOpen(false)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className={styles.confirmTitle} style={{ margin: 0 }}>{editingSource ? 'Edit Source' : 'Add Source'}</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Source Name *</label>
              <Input 
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Facebook Ads"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formActive} 
                  onChange={e => setFormActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                />
                Active (visible in dropdowns)
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving || !formName.trim()}>
                {saving ? 'Saving...' : editingSource ? 'Save Changes' : 'Add Source'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingSource && (
        <div className={styles.confirmOverlay} onClick={() => setDeletingSource(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Delete Lead Source</h3>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>{deletingSource.name}</strong>? 
              Existing leads using this source will keep their current value.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setDeletingSource(null)}>Cancel</Button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
