import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Edit2, Plus, Trash2, PhoneCall, Mail, GraduationCap, CreditCard, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { Parent } from '../../types/parents';
import { ParentForm } from './ParentForm';
import styles from './ParentDetailPage.module.css';

export function ParentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'students' | 'invoices' | 'contracts' | 'communications'>('students');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Mock data for preview
  const parent: Parent = {
    id: id || '1',
    first_name: 'Sarah',
    last_name: 'Connor',
    email: 'sarah@example.com',
    phone: '07123456789',
    address_line_1: '123 Cyber Street',
    city: 'London',
    postal_code: 'SW1A 1AA',
    country: 'UK',
    preferred_contact_method: 'email',
    status: 'active',
    notes: 'Needs regular updates on John\'s progress in Math.',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:00:00Z',
    custom_fields: {
      'marketing_opt_in': true,
      'how_heard': 'Google Search'
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/parents" className={styles.backLink}>
            <ChevronLeft size={16} />
            Back to Parents
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{parent.first_name} {parent.last_name}</h1>
            <Badge variant={parent.status === 'active' ? 'success' : parent.status === 'inactive' ? 'error' : 'neutral'}>
              {parent.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={() => setIsFormOpen(true)}>
            <Edit2 size={16} />
            Edit
          </Button>
          <Button variant="secondary" style={{ color: 'var(--color-danger)' }}>
            <Trash2 size={16} />
          </Button>
          <Button variant="primary">
            <Plus size={16} />
            Add Student
          </Button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        
        {/* Left Column (Overview & Linked Data Tabs) */}
        <div className={styles.overviewSection}>
          
          <Card>
            <h2 className={styles.sectionTitle}>Overview</h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}><a href={`mailto:${parent.email}`}>{parent.email}</a></span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Phone</span>
                <span className={styles.detailValue}><a href={`tel:${parent.phone}`}>{parent.phone}</a></span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Address</span>
                <span className={styles.detailValue}>
                  {[parent.address_line_1, parent.city, parent.postal_code].filter(Boolean).join(', ') || '-'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Pref. Contact</span>
                <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>
                  {parent.preferred_contact_method || '-'}
                </span>
              </div>
            </div>
            
            {parent.notes && (
              <div className={styles.messageBox}>
                <strong>Notes:</strong><br />
                <span style={{ color: 'var(--color-foreground-muted)' }}>{parent.notes}</span>
              </div>
            )}
            
            {/* Custom Fields Example */}
            {parent.custom_fields && Object.keys(parent.custom_fields).length > 0 && (
              <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: 'var(--font-size-sm)', margin: '0 0 var(--spacing-3) 0', color: 'var(--color-foreground)' }}>Custom Data</h3>
                <div className={styles.detailGrid}>
                  {Object.entries(parent.custom_fields).map(([key, val]) => (
                    <div className={styles.detailItem} key={key}>
                      <span className={styles.detailLabel}>{key.replace(/_/g, ' ')}</span>
                      <span className={styles.detailValue}>{val?.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card noPadding>
            <div style={{ padding: 'var(--spacing-4) var(--spacing-4) 0 var(--spacing-4)' }}>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'students' ? styles.active : ''}`}
                  onClick={() => setActiveTab('students')}
                >
                  <GraduationCap size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                  Students (1)
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'invoices' ? styles.active : ''}`}
                  onClick={() => setActiveTab('invoices')}
                >
                  <CreditCard size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                  Invoices (2)
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'contracts' ? styles.active : ''}`}
                  onClick={() => setActiveTab('contracts')}
                >
                  <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                  Documents (1)
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'communications' ? styles.active : ''}`}
                  onClick={() => setActiveTab('communications')}
                >
                  Communication History
                </button>
              </div>
            </div>

            <div style={{ padding: '0 var(--spacing-4) var(--spacing-4) var(--spacing-4)' }}>
              {activeTab === 'students' && (
                <div>
                  <div className={styles.linkedItem}>
                    <div className={styles.linkedItemContent}>
                      <Link to="/students/s1" className={styles.linkedItemTitle}>John Connor</Link>
                      <span className={styles.linkedItemMeta}>Year 9 • Active • Enrolled in Math GCSE</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              )}
              
              {activeTab === 'invoices' && (
                <div>
                   <div className={styles.linkedItem}>
                    <div className={styles.linkedItemContent}>
                      <Link to="#" className={styles.linkedItemTitle}>Invoice #INV-2026-004</Link>
                      <span className={styles.linkedItemMeta}>£240.00 • Due 1st May 2026</span>
                    </div>
                    <Badge variant="warning">Open</Badge>
                  </div>
                  <div className={styles.linkedItem}>
                    <div className={styles.linkedItemContent}>
                      <Link to="#" className={styles.linkedItemTitle}>Invoice #INV-2026-001</Link>
                      <span className={styles.linkedItemMeta}>£240.00 • Paid on 1st Apr 2026</span>
                    </div>
                    <Badge variant="success">Paid</Badge>
                  </div>
                </div>
              )}

              {activeTab === 'contracts' && (
                <div>
                   <div className={styles.linkedItem}>
                    <div className={styles.linkedItemContent}>
                      <span className={styles.linkedItemTitle}>Parent Tuition Agreement 2026</span>
                      <span className={styles.linkedItemMeta}>Signed on 1st April 2026</span>
                    </div>
                    <a href="#" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-color)', textDecoration: 'none' }}>View PDF</a>
                  </div>
                </div>
              )}

              {activeTab === 'communications' && (
                <div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-foreground-muted)' }}>No recent communications.</p>
                </div>
              )}
            </div>
          </Card>
          
        </div>

        {/* Right Column (Tasks & Actions) */}
        <div className={styles.actionSection}>
          
          <Card>
            <h2 className={styles.sectionTitle}>
              Tasks
              <Button variant="secondary" size="sm">Add</Button>
            </h2>
            <div className={styles.taskItem}>
              <input type="checkbox" className={styles.taskCheckbox} />
              <div className={styles.taskInfo}>
                <span className={styles.taskTitle}>Send Welcome Pack</span>
                <span className={styles.taskMeta}>Due Tomorrow</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <PhoneCall size={16} /> Log a Call
              </Button>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Mail size={16} /> Compose Email
              </Button>
              <Button variant="secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <CreditCard size={16} /> Create Invoice
              </Button>
            </div>
          </Card>

        </div>
      </div>

      <ParentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        parentId={parent.id}
      />
    </div>
  );
}
