import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Plus, Filter, MoreVertical, Mail, Users, 
  UserCheck, Briefcase, UserPlus, ArrowUpDown 
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

  const filtered = leads.filter(l => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (l.parent_name || '').toLowerCase().includes(term) ||
      (l.email || '').toLowerCase().includes(term) ||
      (l.enquiry_type || '').toLowerCase().includes(term)
    );
  });

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
            <button className={styles.toolbarBtn}>
              <ArrowUpDown size={13} /> Sort
            </button>
            <button className={styles.toolbarBtn}>
              <Filter size={13} /> Filters
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Enquiry Type</th>
                <th>Stage</th>
                <th>Assigned Team Member</th>
                <th>Status</th>
                <th>Date Added</th>
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
                  <td>{lead.enquiry_type || '-'}</td>
                  <td>
                    {lead.pipeline_stage ? (
                      <span style={{ backgroundColor: `${lead.pipeline_stage.color}20`, color: lead.pipeline_stage.color, borderColor: `${lead.pipeline_stage.color}40`, padding: '2px 8px', borderRadius: '12px', fontSize: '12px', border: '1px solid', whiteSpace: 'nowrap' }}>
                        {lead.pipeline_stage.name}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {lead.owner ? (
                      <div className={styles.ownerCell} title={lead.owner.full_name}>
                        <div className={styles.avatarSmall} style={{ width: '24px', height: '24px', fontSize: '10px' }}>
                          {getInitials(lead.owner.full_name)}
                        </div>
                        <span style={{ fontSize: '13px' }}>{lead.owner.full_name}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <Badge variant={lead.status === 'won' ? 'success' : lead.status === 'lost' ? 'error' : 'neutral'}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
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
