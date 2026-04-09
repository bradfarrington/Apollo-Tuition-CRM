import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, Edit3, Mail, Phone, MapPin, MoreVertical, FileText, CheckSquare, GraduationCap } from 'lucide-react';
import { TutorForm } from './TutorForm';
import styles from './TutorDetailPage.module.css';

// Mock data
const mockTutorData = {
  id: '1',
  first_name: 'Dr. Peter',
  last_name: 'Silberman',
  email: 'silberman@example.com',
  phone: '+44 7700 900123',
  address_line_1: '14 Harley Street',
  city: 'London',
  postal_code: 'W1G 9PQ',
  country: 'UK',
  active_status: 'active',
  contract_status: 'signed',
  notes: 'Specializes in Advanced Mathematics and Physics.',
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-03-01T10:00:00Z',

  students: [
    { id: '1', name: 'John Connor', year: 'Year 9', subject: 'Mathematics' },
    { id: '2', name: 'Sarah Connor', year: 'Adult', subject: 'Physics' }
  ],
  enrolments: [
    { id: '1', subject: 'Mathematics', student: 'John Connor', frequency: 'Weekly', rate: '£45.00', status: 'active' },
    { id: '2', subject: 'Physics', student: 'Sarah Connor', frequency: 'Bi-weekly', rate: '£55.00', status: 'paused' }
  ],
  documents: [
    { id: '1', name: 'Tutor Contract 2026', type: 'Contract', date: '12 Jan 2026', status: 'Signed' },
    { id: '2', name: 'DBS Certificate', type: 'Verification', date: '05 Jan 2026', status: 'Valid' }
  ],
  tasks: [
    { id: '1', title: 'Submit syllabus for Q3', dueDate: '15 Apr 2026', status: 'pending', priority: 'medium' }
  ]
};

export function TutorDetailPage() {
  const { /* id */ } = useParams();
  const navigate = useNavigate();
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  // In a real app we'd fetch the tutor using the ID
  const tutor = mockTutorData;

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
          <div className={styles.titleWrapper}>
            <button className={styles.backBtn} onClick={() => navigate('/tutors')}>
              <ArrowLeft size={16} /> Back to Tutors
            </button>
            <h1 className={styles.title}>
              {tutor.first_name} {tutor.last_name}
              <Badge variant={tutor.active_status === 'active' ? 'success' : tutor.active_status === 'inactive' ? 'error' : 'warning'}>
                {tutor.active_status.charAt(0).toUpperCase() + tutor.active_status.slice(1)}
              </Badge>
              <Badge variant={getContractStatusBadgeId(tutor.contract_status)}>
                {tutor.contract_status.charAt(0).toUpperCase() + tutor.contract_status.slice(1)} Contract
              </Badge>
            </h1>
            <div className={styles.headerMeta}>
              <span className={styles.metaItem}>
                <Mail size={14} /> {tutor.email}
              </span>
              <span className={styles.metaItem}>
                <Phone size={14} /> {tutor.phone || 'No phone'}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={() => setIsEditFormOpen(true)}>
            <Edit3 size={18} />
          </button>
          <button className={styles.iconBtn}>
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Main Content Column */}
        <div className={styles.mainColumn}>
          {/* Linked Students List */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Assigned Students</h2>
              <button className={styles.linkedAction}>View All</button>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Level / Stage</th>
                    <th>Primary Subject</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tutor.students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GraduationCap size={16} style={{ color: 'var(--text-tertiary)' }} />
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{student.name}</span>
                        </div>
                      </td>
                      <td>{student.year}</td>
                      <td>{student.subject}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className={styles.iconBtn} style={{ padding: '4px' }}>
                          <ArrowLeft size={14} style={{ transform: 'rotate(135deg)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Enrolments */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Enrolments</h2>
              <button className={styles.linkedAction}>View All</button>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Subject & Student</th>
                    <th>Schedule</th>
                    <th>Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tutor.enrolments.map((enrol) => (
                    <tr key={enrol.id}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{enrol.subject}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>{enrol.student}</div>
                      </td>
                      <td>{enrol.frequency}</td>
                      <td>{enrol.rate}/hr</td>
                      <td>
                        <Badge variant={enrol.status === 'active' ? 'success' : 'neutral'}>
                          {enrol.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Tasks Section */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Tasks</h2>
              <button className={styles.linkedAction}>Add Task</button>
            </div>
            
            <div className={styles.taskList}>
              {tutor.tasks.map((task) => (
                <div key={task.id} className={styles.taskItem}>
                  <CheckSquare size={18} style={{ color: 'var(--text-tertiary)' }} />
                  <div className={styles.taskContent}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskMeta}>
                      <span className={task.dueDate === 'Overdue' ? styles.taskMetaWarning : ''}>
                        Due: {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className={styles.sideColumn}>
          {/* Profile Card */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Tutor Profile</h2>
            </div>
            <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
              <div className={styles.infoGroup}>
                <span className={styles.infoLabel}>Address</span>
                <span className={styles.infoValue} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ marginTop: '2px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <div>
                    {tutor.address_line_1}<br />
                    {tutor.city}, {tutor.postal_code}<br />
                    {tutor.country}
                  </div>
                </span>
              </div>
              
              <div className={styles.infoGroup}>
                <span className={styles.infoLabel}>Internal Notes</span>
                <span className={styles.infoValue} style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
                  {tutor.notes || 'No notes available.'}
                </span>
              </div>
            </div>
          </Card>

          {/* Documents & Contracts */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Documents & Contracts</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {tutor.documents.map(doc => (
                <div key={doc.id} className={styles.linkedCard} style={{ cursor: 'pointer' }}>
                  <div className={styles.linkedAvatar} style={{ backgroundColor: 'rgba(var(--brand-primary-rgb), 0.1)', color: 'var(--brand-primary)' }}>
                    <FileText size={20} />
                  </div>
                  <div className={styles.linkedInfo}>
                    <div className={styles.linkedName}>{doc.name}</div>
                    <div className={styles.linkedMeta}>
                      <span>{doc.type} • {doc.date}</span>
                      <span style={{ color: doc.status === 'Signed' || doc.status === 'Valid' ? 'var(--success-main)' : 'var(--text-tertiary)' }}>
                        Status: {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  background: 'none', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                + Upload Document
              </button>
            </div>
          </Card>

          {/* Activity/History Summary */}
          <Card>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>System Information</h2>
            </div>
             <div className={styles.infoGrid} style={{ gridTemplateColumns: '1fr', gap: 'var(--spacing-md)' }}>
               <div className={styles.infoGroup}>
                 <span className={styles.infoLabel}>Record Created</span>
                 <span className={styles.infoValue} style={{ fontSize: 'var(--font-size-sm)' }}>
                   {new Date(tutor.created_at).toLocaleDateString('en-GB')}
                 </span>
               </div>
               <div className={styles.infoGroup}>
                 <span className={styles.infoLabel}>Last Updated</span>
                 <span className={styles.infoValue} style={{ fontSize: 'var(--font-size-sm)' }}>
                   {new Date(tutor.updated_at).toLocaleDateString('en-GB')}
                 </span>
               </div>
               <div className={styles.infoGroup}>
                 <span className={styles.infoLabel}>System ID</span>
                 <span className={styles.infoValue} style={{ fontSize: 'var(--font-size-xs)', fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                   {tutor.id}
                 </span>
               </div>
             </div>
          </Card>
        </div>
      </div>

      <TutorForm 
        isOpen={isEditFormOpen} 
        onClose={() => setIsEditFormOpen(false)} 
        tutor={tutor as any}
      />
    </div>
  );
}
