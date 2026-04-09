import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Filter, MoreVertical, Briefcase } from 'lucide-react';
import type { Tutor } from '../../types/tutors';
import { TutorForm } from './TutorForm';
import styles from './TutorsListPage.module.css';

// Mock data based on schema
const mockTutors: Tutor[] = [
  {
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
    active_students_count: 5,
    active_enrolments_count: 7,
  },
  {
    id: '2',
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice.j@example.com',
    phone: '+44 7700 900456',
    address_line_1: '22 Baker Street',
    city: 'London',
    postal_code: 'NW1 6XE',
    country: 'UK',
    active_status: 'active',
    contract_status: 'signed',
    notes: 'Primary education and 11+ specialist.',
    created_at: '2026-02-15T14:30:00Z',
    updated_at: '2026-02-15T14:30:00Z',
    active_students_count: 3,
    active_enrolments_count: 3,
  },
  {
    id: '3',
    first_name: 'Marcus',
    last_name: 'Wright',
    email: 'm.wright@example.com',
    phone: '+44 7700 900789',
    address_line_1: '5 Cyberdyne Way',
    city: 'Birmingham',
    postal_code: 'B1 1AA',
    country: 'UK',
    active_status: 'onboarding',
    contract_status: 'pending',
    notes: 'Awaiting DBS check clearance.',
    created_at: '2026-04-05T09:15:00Z',
    updated_at: '2026-04-07T11:00:00Z',
    active_students_count: 0,
    active_enrolments_count: 0,
  }
];

export function TutorsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleRowClick = (id: string) => {
    navigate(`/tutors/${id}`);
  };

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
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tutors</h1>
          <p className={styles.subtitle}>Manage your teaching roster, contracts, and assignments.</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          Add Tutor
        </Button>
      </header>

      <Card noPadding>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search by name, email, subject..." 
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
                <th>Tutor</th>
                <th>Contact</th>
                <th>Capacity</th>
                <th>Account Status</th>
                <th>Contract Status</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {mockTutors.map((tutor) => (
                <tr key={tutor.id} onClick={() => handleRowClick(tutor.id)}>
                  <td>
                    <div className={styles.primaryCell}>{tutor.first_name} {tutor.last_name}</div>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>
                        <Briefcase size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        {tutor.active_enrolments_count} active enrolments
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.primaryCell}>{tutor.email}</div>
                    <div className={styles.metaInfo}>
                      <span className={styles.metaItem}>{tutor.phone || '-'}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.primaryCell}>{tutor.active_students_count} students</div>
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
          <span className={styles.pageInfo}>Showing 1 to {mockTutors.length} of {mockTutors.length} records</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      <TutorForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
}
