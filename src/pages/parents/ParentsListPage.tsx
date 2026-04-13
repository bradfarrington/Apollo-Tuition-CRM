import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [studentPopover, setStudentPopover] = useState<{ parentId: string; x: number; y: number } | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    closeTimeoutRef.current = setTimeout(() => setStudentPopover(null), 150);
  };
  const cancelClose = () => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
  };

  const fetchParents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('parents')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          status,
          school_year,
          enrolments (
            id,
            status
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch parents:', error);
    } else {
      const enrichedParents = (data || []).map((parent: any) => {
        const students = parent.students || [];
        let enrolmentsCount = 0;
        
        students.forEach((stu: any) => {
          const activeEnrolments = (stu.enrolments || []).filter((e: any) => e.status === 'active').length;
          enrolmentsCount += activeEnrolments;
        });

        return {
          ...parent,
          linked_students_count: students.length,
          active_enrolments_count: enrolmentsCount
        };
      });
      setParents(enrichedParents);
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
                    <td>
                      {(() => {
                        const students = parent.students || [];
                        if (students.length === 0) return <span className={styles.mutedCell}>-</span>;
                        return (
                          <div
                            className={styles.studentBadgeWrap}
                            onMouseEnter={(e) => {
                              e.stopPropagation();
                              cancelClose();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setStudentPopover({ parentId: parent.id, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
                            }}
                            onMouseLeave={() => scheduleClose()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className={styles.studentBadge}>
                              <GraduationCap size={12} />
                              {parent.linked_students_count}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
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

      {/* Student Tooltip Portal */}
      {studentPopover && (() => {
        const parent = parents.find(p => p.id === studentPopover.parentId);
        const students = parent?.students || [];
        if (students.length === 0) return null;
        return createPortal(
          <div
            className={styles.studentTooltip}
            style={{ left: studentPopover.x, top: studentPopover.y }}
            onMouseEnter={() => cancelClose()}
            onMouseLeave={() => scheduleClose()}
          >
            <div className={styles.studentTooltipHeader}>
              {students.length} Student{students.length === 1 ? '' : 's'}
            </div>
            <div className={styles.studentTooltipBody}>
              {students.map((stu: any) => {
                const statusColor = stu.status === 'active' ? '#10b981' : stu.status === 'inactive' ? '#ef4444' : '#3b82f6';
                const statusLabel = stu.status ? stu.status.charAt(0).toUpperCase() + stu.status.slice(1) : 'Unknown';
                return (
                  <div
                    key={stu.id}
                    className={styles.studentTooltipItem}
                    style={{ borderLeftColor: statusColor }}
                    onClick={() => {
                      setStudentPopover(null);
                      navigate(`/students/${stu.id}`);
                    }}
                  >
                    <div className={styles.studentItemTop}>
                      <span className={styles.studentStatusDot} style={{ background: statusColor }} />
                      <span className={styles.studentStatusLabel} style={{ color: statusColor }}>
                        {statusLabel}
                      </span>
                      {stu.school_year && (
                        <span className={styles.studentTypePill}>{stu.school_year}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {stu.first_name} {stu.last_name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        );
      })()}

      <ParentForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
      />
    </div>
  );
}
