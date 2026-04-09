import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Plus, Filter, MoreVertical, Mail, Phone, 
  Users, UserCheck, UserPlus, GraduationCap,
  ArrowUpDown
} from 'lucide-react';
import type { Parent } from '../../types/parents';
import { ParentForm } from './ParentForm';
import styles from './ParentsListPage.module.css';

export function ParentsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch parents:', error);
    } else {
      setParents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleRowClick = (id: string) => {
    navigate(`/parents/${id}`);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchParents();
  };

  const filtered = parents.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(term) ||
      p.last_name.toLowerCase().includes(term) ||
      (p.email || '').toLowerCase().includes(term) ||
      (p.phone || '').toLowerCase().includes(term)
    );
  });

  const totalParents = parents.length;
  const activeParents = parents.filter(p => p.status === 'active').length;
  const prospectiveParents = parents.filter(p => p.status === 'prospective').length;
  const totalStudents = parents.reduce((sum, p) => sum + (p.linked_students_count || 0), 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Parents & Guardians</h1>
          <p className={styles.subtitle}>Manage parents, billing contacts, and family relationships.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Add Parent
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.statCardIcon}><Users size={18} /></div>
          <span className={styles.statCardValue}>{totalParents}</span>
          <span className={styles.statCardLabel}>Total Parents</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={styles.statCardIcon}><UserCheck size={18} /></div>
          <span className={styles.statCardValue}>{activeParents}</span>
          <span className={styles.statCardLabel}>Active Parents</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPink}`}>
          <div className={styles.statCardIcon}><UserPlus size={18} /></div>
          <span className={styles.statCardValue}>{prospectiveParents}</span>
          <span className={styles.statCardLabel}>Prospective</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={styles.statCardIcon}><GraduationCap size={18} /></div>
          <span className={styles.statCardValue}>{totalStudents}</span>
          <span className={styles.statCardLabel}>Linked Students</span>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search by name, email or phone..." 
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
                <th>Parent</th>
                <th>Students</th>
                <th>Enrolments</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading parents...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No parents found.</td></tr>
              ) : filtered.map((parent) => {
                const initials = `${parent.first_name.charAt(0)}${parent.last_name.charAt(0)}`;
                return (
                  <tr key={parent.id} onClick={() => handleRowClick(parent.id)}>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatarSmall}>{initials}</div>
                        <div className={styles.nameText}>
                          <span className={styles.primaryName}>{parent.first_name} {parent.last_name}</span>
                          <div className={styles.contactLine}>
                            <span className={styles.contactMeta}>
                              <Mail size={11} />
                              <a href={`mailto:${parent.email}`} onClick={e => e.stopPropagation()}>{parent.email || '-'}</a>
                            </span>
                            <span className={styles.contactMeta}>
                              <Phone size={11} />
                              <a href={`tel:${parent.phone}`} onClick={e => e.stopPropagation()}>{parent.phone || '-'}</a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.numericCell}>{parent.linked_students_count}</td>
                    <td className={styles.numericCell}>{parent.active_enrolments_count}</td>
                    <td>
                      <Badge variant={parent.status === 'active' ? 'success' : parent.status === 'inactive' ? 'error' : 'neutral'}>
                        {parent.status.charAt(0).toUpperCase() + parent.status.slice(1)}
                      </Badge>
                    </td>
                    <td className={styles.mutedCell}>
                      {new Date(parent.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={styles.actionsCol}>
                      <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); }}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to {filtered.length} of {filtered.length} records</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>

      <ParentForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
}
