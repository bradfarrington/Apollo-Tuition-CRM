import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Filter, MoreVertical, GraduationCap } from 'lucide-react';
import type { Student } from '../../types/students';
import { StudentForm } from './StudentForm';
import styles from './StudentsListPage.module.css';

// Mock data based on schema
const mockStudents: Student[] = [
  {
    id: '1',
    primary_parent_id: '1',
    first_name: 'John',
    last_name: 'Connor',
    date_of_birth: '2012-05-14',
    school_year: 'Year 9',
    key_stage: 'KS3',
    status: 'active',
    tutor_id: '1',
    notes: 'Needs help with Math.',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:00:00Z',
    primary_parent_name: 'Sarah Connor',
    assigned_tutor_name: 'Dr. Silberman',
    active_enrolments_count: 2,
  },
  {
    id: '2',
    primary_parent_id: '2',
    first_name: 'Derek',
    last_name: 'Reese',
    date_of_birth: '2015-08-20',
    school_year: 'Year 6',
    key_stage: 'KS2',
    status: 'active',
    tutor_id: '2',
    notes: '11+ prep',
    created_at: '2026-04-08T14:30:00Z',
    updated_at: '2026-04-08T14:30:00Z',
    primary_parent_name: 'Kyle Reese',
    assigned_tutor_name: 'Alice Johnson',
    active_enrolments_count: 1,
  },
  {
    id: '3',
    primary_parent_id: '3',
    first_name: 'Danny',
    last_name: 'Dyson',
    date_of_birth: '2010-11-02',
    school_year: 'Year 11',
    key_stage: 'KS4',
    status: 'onboarding',
    tutor_id: null,
    notes: 'GCSE prep starting soon.',
    created_at: '2026-04-05T09:15:00Z',
    updated_at: '2026-04-07T11:00:00Z',
    primary_parent_name: 'Miles Dyson',
    active_enrolments_count: 0,
  }
];

export function StudentsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleRowClick = (id: string) => {
    navigate(`/students/${id}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>Manage student profiles, tracking, and enrolments.</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          Add Student
        </Button>
      </header>

      <Card noPadding>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search by name, school year..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className={styles.filterBtn}>
            <Filter size={16} /> Filters
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Level / Stage</th>
                <th>Primary Parent</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student) => (
                <tr key={student.id} onClick={() => handleRowClick(student.id)}>
                  <td>
                    <div className={styles.primaryCell}>{student.first_name} {student.last_name}</div>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>
                        <GraduationCap size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        {student.active_enrolments_count} active enrolments
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.primaryCell}>{student.school_year || '-'}</div>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>{student.key_stage || '-'}</span>
                    </div>
                  </td>
                  <td>{student.primary_parent_name || '-'}</td>
                  <td>
                    <Badge variant={student.status === 'active' ? 'success' : student.status === 'inactive' ? 'error' : student.status === 'onboarding' ? 'warning' : 'neutral'}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </td>
                  <td className={styles.mutedCell}>
                    {new Date(student.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
          <span className={styles.pageInfo}>Showing 1 to {mockStudents.length} of {mockStudents.length} records</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      <StudentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
}
