import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Filter, MoreVertical, Mail, Phone } from 'lucide-react';
import type { Parent } from '../../types/parents';
import { ParentForm } from './ParentForm';
import styles from './ParentsListPage.module.css';

// Mock data based on schema
const mockParents: Parent[] = [
  {
    id: '1',
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
    notes: 'Very hands-on parent.',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:00:00Z',
    linked_students_count: 1,
    active_enrolments_count: 2,
  },
  {
    id: '2',
    first_name: 'Kyle',
    last_name: 'Reese',
    email: 'kyle@example.com',
    phone: '07987654321',
    address_line_1: '456 Time Lane',
    city: 'Manchester',
    postal_code: 'M1 1AA',
    country: 'UK',
    preferred_contact_method: 'phone',
    status: 'active',
    notes: null,
    created_at: '2026-04-08T14:30:00Z',
    updated_at: '2026-04-08T14:30:00Z',
    linked_students_count: 2,
    active_enrolments_count: 1,
  },
  {
    id: '3',
    first_name: 'Miles',
    last_name: 'Dyson',
    email: 'miles@cyberdyne.com',
    phone: '07777777777',
    address_line_1: '789 Tech Road',
    city: 'Birmingham',
    postal_code: 'B1 1AA',
    country: 'UK',
    preferred_contact_method: 'email',
    status: 'prospective',
    notes: 'Interested in 11+ prep.',
    created_at: '2026-04-05T09:15:00Z',
    updated_at: '2026-04-07T11:00:00Z',
    linked_students_count: 0,
    active_enrolments_count: 0,
  }
];

export function ParentsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleRowClick = (id: string) => {
    navigate(`/parents/${id}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Parents & Guardians</h1>
          <p className={styles.subtitle}>Manage parents, billing contacts, and family relationships.</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          Add Parent
        </Button>
      </header>

      <Card noPadding>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search by name, email or phone..." 
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
                <th>Name & Contact</th>
                <th>Students</th>
                <th>Active Enrolments</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {mockParents.map((parent) => (
                <tr key={parent.id} onClick={() => handleRowClick(parent.id)}>
                  <td>
                    <div className={styles.primaryCell}>{parent.first_name} {parent.last_name}</div>
                    <div className={styles.contactInfo}>
                      <span className={styles.contactMeta}>
                        <Mail size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        {parent.email || '-'}
                      </span>
                      <span className={styles.contactMeta}>
                        <Phone size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                        {parent.phone || '-'}
                      </span>
                    </div>
                  </td>
                  <td>{parent.linked_students_count}</td>
                  <td>{parent.active_enrolments_count}</td>
                  <td>
                    <Badge variant={parent.status === 'active' ? 'success' : parent.status === 'inactive' ? 'error' : 'neutral'}>
                      {parent.status.charAt(0).toUpperCase() + parent.status.slice(1)}
                    </Badge>
                  </td>
                  <td className={styles.mutedCell}>
                    {new Date(parent.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
          <span className={styles.pageInfo}>Showing 1 to {mockParents.length} of {mockParents.length} records</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      <ParentForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
}
