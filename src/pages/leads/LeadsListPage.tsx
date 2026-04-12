import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import { 
  Plus, Filter, MoreVertical, Mail, Users, 
  UserCheck, Briefcase, UserPlus, ChevronsUpDown, ChevronUp, ChevronDown
} from 'lucide-react';
import type { Lead } from '../../types/leads';
import { LeadForm } from './LeadForm';
import styles from './LeadsListPage.module.css';

export function LeadsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({ source: '', status: '', enquiry_type: '', city: '', tag: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*, pipeline_stages(*), profiles!leads_owner_id_fkey(*)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      // Fallback without profile join if FK name differs
      const { data: fallback, error: err2 } = await supabase
        .from('leads')
        .select('*, pipeline_stages(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (err2) console.error('Failed to fetch leads:', err2);
      else {
        setLeads((fallback || []).map((r: any) => ({
          ...r,
          pipeline_stage: r.pipeline_stages || undefined,
          owner: r.profiles || undefined,
        })));
      }
    } else {
      setLeads((data || []).map((r: any) => ({
        ...r,
        pipeline_stage: r.pipeline_stages || undefined,
        owner: r.profiles || undefined,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchLeads();
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  let filtered = leads.filter(l => {
    if (filters.source && l.source !== filters.source) return false;
    if (filters.status && l.status !== filters.status) return false;
    if (filters.enquiry_type && l.enquiry_type !== filters.enquiry_type) return false;
    if (filters.city && l.city !== filters.city) return false;
    if (filters.tag && (!l.tags || !l.tags.includes(filters.tag))) return false;
    
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.parent_name || '').toLowerCase().includes(term) ||
      (l.email || '').toLowerCase().includes(term) ||
      (l.phone || '').toLowerCase().includes(term)
    );
  });

  filtered = filtered.sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aVal: any = a[key as keyof Lead];
    let bVal: any = b[key as keyof Lead];

    if (key === 'contact') {
      aVal = a.parent_name || '';
      bVal = b.parent_name || '';
    }
    if (key === 'created_at') {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    }
    if (key === 'tags') {
      aVal = (a.tags || []).join(', ').toLowerCase();
      bVal = (b.tags || []).join(', ').toLowerCase();
    }

    if (!aVal && !bVal) return 0;
    if (!aVal) return direction === 'asc' ? 1 : -1;
    if (!bVal) return direction === 'asc' ? -1 : 1;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
  });

  const uniqueSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean))) as string[];
  const uniqueStatuses = Array.from(new Set(leads.map(l => l.status).filter(Boolean))) as string[];
  const uniqueTypes = Array.from(new Set(leads.map(l => l.enquiry_type).filter(Boolean))) as string[];
  const uniqueCities = Array.from(new Set(leads.map(l => l.city).filter(Boolean))) as string[];
  const uniqueTags = Array.from(new Set(leads.flatMap(l => l.tags || []))).filter(Boolean) as string[];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ChevronsUpDown size={12} style={{ marginLeft: '4px', opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={12} style={{ marginLeft: '4px', color: 'var(--color-accent-blue)' }} />
      : <ChevronDown size={12} style={{ marginLeft: '4px', color: 'var(--color-accent-blue)' }} />;
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleRowClick = (id: string) => {
    navigate(`/leads/${id}`);
  };

  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;
  const openLeads = totalLeads - wonLeads - lostLeads;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Leads</h1>
          <p className={styles.subtitle}>Manage incoming enquiries and prospective students.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            New Lead
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.statCardIcon}><Users size={18} /></div>
          <span className={styles.statCardValue}>{totalLeads}</span>
          <span className={styles.statCardLabel}>Total Leads</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={styles.statCardIcon}><UserCheck size={18} /></div>
          <span className={styles.statCardValue}>{openLeads}</span>
          <span className={styles.statCardLabel}>Open Leads</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPink}`}>
          <div className={styles.statCardIcon}><UserPlus size={18} /></div>
          <span className={styles.statCardValue}>{wonLeads}</span>
          <span className={styles.statCardLabel}>Won Leads</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={styles.statCardIcon}><Briefcase size={18} /></div>
          <span className={styles.statCardValue}>{lostLeads}</span>
          <span className={styles.statCardLabel}>Lost Leads</span>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search leads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.toolbarRight}>
            <button 
              className={`${styles.filterToggleButton} ${isFilterOpen ? styles.filterToggleButtonActive : ''}`} 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={13} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>

        {isFilterOpen && (
          <div className={styles.filterBar}>
            <select 
              className={styles.filterSelect}
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            >
              <option value="">All Sources</option>
              {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            <select 
              className={styles.filterSelect}
              value={filters.enquiry_type}
              onChange={(e) => setFilters({ ...filters, enquiry_type: e.target.value })}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              className={styles.filterSelect}
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            >
              <option value="">All Locations</option>
              {uniqueCities.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              className={styles.filterSelect}
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="">All Tags</option>
              {uniqueTags.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {activeFilterCount > 0 && (
              <button 
                className={styles.clearFiltersBtn} 
                onClick={() => setFilters({ source: '', status: '', enquiry_type: '', city: '', tag: '' })}
              >
                Clear All
              </button>
            )}
          </div>
        )}

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('contact')} className={styles.sortableHeader}>Contact {renderSortIcon('contact')}</th>
                <th onClick={() => handleSort('phone')} className={styles.sortableHeader}>Phone {renderSortIcon('phone')}</th>
                <th onClick={() => handleSort('source')} className={styles.sortableHeader}>Source {renderSortIcon('source')}</th>
                <th onClick={() => handleSort('city')} className={styles.sortableHeader}>Location {renderSortIcon('city')}</th>
                <th onClick={() => handleSort('tags')} className={styles.sortableHeader}>Tags {renderSortIcon('tags')}</th>
                <th onClick={() => handleSort('created_at')} className={styles.sortableHeader}>Date Added {renderSortIcon('created_at')}</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading leads...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No leads found.</td></tr>
              ) : filtered.map((lead) => (
                <tr key={lead.id} onClick={() => handleRowClick(lead.id)}>
                  <td>
                    <div className={styles.nameCell}>
                      <div className={styles.avatarSmall}>{getInitials(lead.parent_name || 'U')}</div>
                      <div className={styles.nameText}>
                        <span className={styles.primaryName}>{lead.parent_name}</span>
                        <div className={styles.contactLine}>
                          <span className={styles.contactMeta}>
                            <Mail size={11} /> {lead.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{lead.phone || '-'}</td>
                  <td>
                    {lead.source ? (
                      <span className={styles.sourceTag}>{lead.source}</span>
                    ) : '-'}
                  </td>
                  <td>{lead.city || '-'}</td>
                  <td>
                    {lead.tags && lead.tags.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {lead.tags.map(tag => (
                          <span key={tag} style={{ background: 'var(--color-bg-subtle)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-subtle)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : <span className={styles.mutedCell}>-</span>}
                  </td>
                  <td className={styles.mutedCell}>
                    {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className={styles.actionsCol}>
                    <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); /* Menu */ }}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filtered.length} of {filtered.length} entries</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>

      <LeadForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
}
