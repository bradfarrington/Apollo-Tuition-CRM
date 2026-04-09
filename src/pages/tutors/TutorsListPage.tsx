import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Plus, Filter, MoreVertical, Mail, Phone,
  Users, UserCheck, Briefcase, UserPlus,
  ArrowUpDown
} from 'lucide-react';
import type { Tutor } from '../../types/tutors';
import { TutorForm } from './TutorForm';
import styles from './TutorsListPage.module.css';

export function TutorsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTutors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tutors')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Failed to fetch tutors:', error);
    } else {
      setTutors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTutors(); }, []);

  const handleRowClick = (id: string) => {
    navigate(`/tutors/${id}`);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchTutors();
  };

  const filtered = tutors.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.first_name.toLowerCase().includes(term) ||
      t.last_name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term)
    );
  });

  const totalTutors = tutors.length;
  const activeTutors = tutors.filter(t => t.active_status === 'active').length;
  const pendingContracts = tutors.filter(t => t.contract_status === 'pending').length;
  const totalEnrolments = tutors.reduce((sum, t) => sum + (t.active_enrolments_count || 0), 0);

  const getContractStatusBadgeId = (status: string) => {
    switch (status) {
      case 'signed': return 'success';
      case 'pending': return 'warning';
      case 'expired': return 'error';
      case 'terminated': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Tutors</h1>
          <p className={styles.subtitle}>Manage your teaching roster, contracts, and assignments.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Add Tutor
          </Button>
        </div>
      </header>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statCardBlue}`}>
          <div className={styles.statCardIcon}><Users size={18} /></div>
          <span className={styles.statCardValue}>{totalTutors}</span>
          <span className={styles.statCardLabel}>Total Tutors</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPurple}`}>
          <div className={styles.statCardIcon}><UserCheck size={18} /></div>
          <span className={styles.statCardValue}>{activeTutors}</span>
          <span className={styles.statCardLabel}>Active Tutors</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardPink}`}>
          <div className={styles.statCardIcon}><UserPlus size={18} /></div>
          <span className={styles.statCardValue}>{pendingContracts}</span>
          <span className={styles.statCardLabel}>Pending Contracts</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardGreen}`}>
          <div className={styles.statCardIcon}><Briefcase size={18} /></div>
          <span className={styles.statCardValue}>{totalEnrolments}</span>
          <span className={styles.statCardLabel}>Tutor Enrolments</span>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search by name, email, subject..." 
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
                <th>Tutor</th>
                <th>Capacity</th>
                <th>Account Status</th>
                <th>Contract Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>Loading tutors...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>No tutors found.</td></tr>
              ) : filtered.map((tutor) => {
                const initials = `${tutor.first_name.charAt(0)}${tutor.last_name.charAt(0)}`;
                return (
                  <tr key={tutor.id} onClick={() => handleRowClick(tutor.id)}>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatarSmall}>{initials}</div>
                        <div className={styles.nameText}>
                          <span className={styles.primaryName}>{tutor.first_name} {tutor.last_name}</span>
                          <div className={styles.contactLine}>
                            <span className={styles.contactMeta}>
                              <Mail size={11} />
                              <a href={`mailto:${tutor.email}`} onClick={e => e.stopPropagation()}>{tutor.email || '-'}</a>
                            </span>
                            <span className={styles.contactMeta}>
                              <Phone size={11} />
                              <a href={`tel:${tutor.phone}`} onClick={e => e.stopPropagation()}>{tutor.phone || '-'}</a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.numericCell}>{tutor.active_students_count} students</div>
                      <div className={styles.contactMeta}><Briefcase size={11} /> {tutor.active_enrolments_count} enrolments</div>
                    </td>
                    <td>
                      <Badge variant={tutor.active_status === 'active' ? 'success' : tutor.active_status === 'inactive' ? 'error' : 'warning'}>
                        {tutor.active_status.charAt(0).toUpperCase() + tutor.active_status.slice(1)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={getContractStatusBadgeId(tutor.contract_status)}>
                        {tutor.contract_status.charAt(0).toUpperCase() + tutor.contract_status.slice(1)}
                      </Badge>
                    </td>
                    <td className={styles.mutedCell}>
                      {new Date(tutor.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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

      <TutorForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
}
