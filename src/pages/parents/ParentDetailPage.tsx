import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRelativeTime } from '../../lib/dateUtils';
import { 
  Edit2, Plus, Trash2, PhoneCall, Mail, GraduationCap, 
  CreditCard, FileText, MoreVertical, 
  MessageSquare, Phone, Copy, MapPin,
  ChevronRight, ArrowUpDown, Filter, User, Pencil,
  Clock, CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Parent } from '../../types/parents';
import { ParentForm } from './ParentForm';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { DocumentManager } from '../../components/documents/DocumentManager';
import styles from './ParentDetailPage.module.css';

export function ParentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'students' | 'invoices' | 'contracts' | 'communications'>('students');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info'}>({ isOpen: false, title: '', message: '', type: 'info' });

  const fetchParent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('parents')
      .select(`
        *,
        students(
          id,
          first_name,
          last_name,
          status,
          school_year,
          key_stage
        )
      `)
      .eq('id', id)
      .single();
    if (error) console.error('Failed to fetch parent:', error);
    else setParent(data);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchParent(); }, [fetchParent]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchParent();
  };

  if (loading || !parent) {
    return (
      <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--color-text-tertiary)' }}>
        {loading ? 'Loading parent...' : 'Parent not found.'}
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!id) return;
    const { error } = await supabase.from('parents').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete parent:', error);
      setAlertConfig({ isOpen: true, title: 'Error', message: 'Failed to delete parent.', type: 'error' });
    } else {
      navigate('/parents');
    }
  };

  const initials = `${parent.first_name.charAt(0)}${parent.last_name.charAt(0)}`;
  const fullAddress = [parent.address_line_1, parent.city, parent.postal_code].filter(Boolean).join(', ');

  return (
    <div className={styles.container}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/parents">Parents</Link>
        <ChevronRight size={14} className={styles.breadcrumbSeparator} />
        <span className={styles.breadcrumbCurrent}>{parent.first_name} {parent.last_name}</span>
      </nav>

      {/* Split Layout */}
      <div className={styles.splitLayout}>

        {/* ========== LEFT PROFILE PANEL ========== */}
        <aside className={styles.profilePanel}>
          <div className={styles.profileBanner}>
            <div className={styles.profileBannerAccent} />
          </div>

          <div className={styles.profileIdentity}>
            <div className={styles.avatar}>{initials}</div>
            <h1 className={styles.profileName}>{parent.first_name} {parent.last_name}</h1>
            <div className={styles.profileSubtitle}>
              <span className={`${styles.statusDot} ${styles[parent.status]}`} />
              {parent.status.charAt(0).toUpperCase() + parent.status.slice(1)} Parent
            </div>

            {/* Quick Action Icon Buttons */}
            <div className={styles.quickActionIcons}>
              <button className={styles.iconBtn} data-tooltip="Call">
                <PhoneCall size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="SMS">
                <MessageSquare size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="Email">
                <Mail size={16} />
              </button>
              <button className={`${styles.iconBtn} ${styles.primary}`} data-tooltip="Invoice">
                <CreditCard size={16} />
              </button>
              <button className={styles.iconBtn} data-tooltip="More">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Contact Info */}
          <div className={styles.contactFields}>
            <div className={styles.contactFieldsLabel}>Contact Info</div>
            
            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><Mail size={14} /></div>
              <div className={styles.contactFieldText}>
                <a href={`mailto:${parent.email}`}>{parent.email}</a>
              </div>
              <button className={styles.copyBtn} title="Copy email"><Copy size={13} /></button>
            </div>

            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><Phone size={14} /></div>
              <div className={styles.contactFieldText}>
                <a href={`tel:${parent.phone}`}>{parent.phone}</a>
                <span className={styles.contactFieldHint}>(Primary)</span>
              </div>
              <button className={styles.copyBtn} title="Copy phone"><Copy size={13} /></button>
            </div>

            <div className={styles.contactField}>
              <div className={styles.contactFieldIcon}><MapPin size={14} /></div>
              <div className={styles.contactFieldText}>
                <span>{fullAddress}</span>
              </div>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Metadata */}
          <div className={styles.metadataSection}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Date Created</span>
              <span className={styles.metaValue}>
                {new Date(parent.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Last Connected</span>
              <span className={styles.metaValue}>
                {getRelativeTime(parent.updated_at)}
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Preferred Contact</span>
              <span className={styles.metaValue}>
                <span className={styles.contactMethodBadge}>
                  {parent.preferred_contact_method === 'email' && <Mail size={11} />}
                  {parent.preferred_contact_method === 'phone' && <Phone size={11} />}
                  {parent.preferred_contact_method === 'whatsapp' && <MessageSquare size={11} />}
                  {parent.preferred_contact_method === 'sms' && <MessageSquare size={11} />}
                  {parent.preferred_contact_method ? parent.preferred_contact_method.charAt(0).toUpperCase() + parent.preferred_contact_method.slice(1) : '-'}
                </span>
              </span>
            </div>

            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Lead Status</span>
              <span className={styles.metaValue}>
                <Badge variant={parent.status === 'active' ? 'success' : parent.status === 'inactive' ? 'error' : 'neutral'}>
                  {parent.status.charAt(0).toUpperCase() + parent.status.slice(1)}
                </Badge>
              </span>
            </div>
          </div>

          <div className={styles.panelDivider} />

          {/* Add Property */}
          <button className={styles.addProperty}>
            <Plus size={14} />
            Add a property
          </button>
        </aside>

        {/* ========== RIGHT CONTENT PANEL ========== */}
        <div className={styles.contentPanel}>

          {/* Header */}
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>{parent.first_name} {parent.last_name}</h2>
            <div className={styles.panelActions}>
              <Button variant="secondary" onClick={() => setIsFormOpen(true)}>
                <Edit2 size={15} />
                Edit
              </Button>
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(true)} style={{ color: '#ef4444' }}>
                <Trash2 size={15} />
              </Button>
              <Button variant="primary">
                <Plus size={15} />
                Link Student
              </Button>
            </div>
          </div>

          {/* Tabs Bar */}
          <div className={styles.tabsBar}>
            <button 
              className={`${styles.tab} ${activeTab === 'students' ? styles.active : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <GraduationCap size={15} />
              Students
              <span className={styles.tabCount}>{parent.students?.length || 0}</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'invoices' ? styles.active : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              <CreditCard size={15} />
              Invoices
              <span className={styles.tabCount}>0</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'contracts' ? styles.active : ''}`}
              onClick={() => setActiveTab('contracts')}
            >
              <FileText size={15} />
              Documents
              <span className={styles.tabCount}>0</span>
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'communications' ? styles.active : ''}`}
              onClick={() => setActiveTab('communications')}
            >
              <MessageSquare size={15} />
              Communications
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className={styles.bottomGrid}>

          {/* Tab Content Card */}
          <div className={styles.tabCard} style={{ marginBottom: 0 }}>
            {activeTab === 'students' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Students
                    <span className={styles.tabCount}>{parent.students?.length || 0}</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <button className={styles.sortBtn}><ArrowUpDown size={13} /> Sort</button>
                    <button className={styles.filterBtn}><Filter size={13} /> Filters</button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  {parent.students && parent.students.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px', padding: '16px' }}>
                      {parent.students.map(student => (
                        <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                              {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{student.first_name} {student.last_name}</div>
                              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                {student.school_year || 'Year Unknown'}
                                {student.key_stage && ` • ${student.key_stage}`}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'error' : 'neutral'}>
                              {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                            </Badge>
                            <Button variant="secondary" size="sm" onClick={() => navigate(`/students/${student.id}`)}>
                              View Student
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                      No linked students
                    </div>
                  )}
                </div>
              </>
            )}
            
            {activeTab === 'invoices' && (
              <>
                <div className={styles.tabCardHeader}>
                  <h3 className={styles.tabCardTitle}>
                    Invoices
                    <span className={styles.tabCount}>0</span>
                  </h3>
                  <div className={styles.tabCardActions}>
                    <button className={styles.sortBtn}><ArrowUpDown size={13} /> Sort</button>
                    <button className={styles.filterBtn}><Filter size={13} /> Filters</button>
                  </div>
                </div>
                <div className={styles.tabCardBody}>
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                    No invoices yet
                  </div>
                </div>
              </>
            )}

            {activeTab === 'contracts' && (
              <div style={{ padding: 'var(--spacing-6)' }}>
                <DocumentManager entityType="parent" entityId={parent.id} />
              </div>
            )}

            {activeTab === 'communications' && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <MessageSquare size={24} />
                </div>
                <p className={styles.emptyStateText}>No communications yet</p>
                <p className={styles.emptyStateHint}>Emails, calls, and messages will appear here</p>
              </div>
            )}
          </div>

            {/* Tasks & Notes Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>

              {/* Notes */}
              {parent.notes && (
                <div className={`${styles.sectionCard} ${styles.sectionCardPink}`}>
                  <div className={styles.sectionCardHeader}>
                    <h3 className={styles.sectionCardTitle}>
                      <span className={styles.sectionCardTitleIcon}><FileText size={14} /></span>
                      Notes
                    </h3>
                    <button className={styles.sortBtn}><Edit2 size={13} /> Edit</button>
                  </div>
                  <div className={styles.sectionCardBody}>
                    <div className={styles.notesBox}>
                      {parent.notes}
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div className={`${styles.sectionCard} ${styles.sectionCardGreen}`}>
                <div className={styles.sectionCardHeader}>
                  <h3 className={styles.sectionCardTitle}>
                    <span className={styles.sectionCardTitleIcon}><CheckCircle2 size={14} /></span>
                    Tasks
                  </h3>
                  <Button variant="secondary" size="sm">
                    <Plus size={14} />
                    Add
                  </Button>
                </div>
                <div className={styles.sectionCardBody}>
                  <div style={{ padding: '16px 20px', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                    No tasks
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ParentForm 
        isOpen={isFormOpen} 
        onClose={handleFormClose} 
        parentId={parent.id}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Parent"
        message="Are you sure you want to delete this parent? This action cannot be undone and will remove all associated data."
      />
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
