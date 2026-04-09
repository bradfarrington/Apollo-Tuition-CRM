import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Filter, MoreVertical } from 'lucide-react';
import type { Lead } from '../../types/leads';
import { LeadForm } from './LeadForm';
import styles from './LeadsListPage.module.css';

// Mock data based on schema
const mockLeads: Lead[] = [
  {
    id: '1',
    parent_name: 'Sarah Connor',
    email: 'sarah@example.com',
    phone: '07123456789',
    enquiry_type: 'Math Tutoring',
    status: 'open',
    created_at: '2026-04-09T10:00:00Z',
    updated_at: '2026-04-09T10:00:00Z',
    pipeline_stage: { id: 's1', pipeline_id: 'p1', name: 'New Enquiry', color: '#3b82f6', sort_order: 1, is_active: true },
    owner: { id: 'u1', full_name: 'John Doe', email: 'john@example.com', role: 'admin' }
  },
  {
    id: '2',
    parent_name: 'Kyle Reese',
    email: 'kyle@example.com',
    phone: '07987654321',
    enquiry_type: 'Science GCSE',
    status: 'open',
    created_at: '2026-04-08T14:30:00Z',
    updated_at: '2026-04-08T14:30:00Z',
    pipeline_stage: { id: 's2', pipeline_id: 'p1', name: 'Contacted', color: '#f59e0b', sort_order: 2, is_active: true },
    owner: { id: 'u2', full_name: 'Jane Smith', email: 'jane@example.com', role: 'operations' }
  },
  {
    id: '3',
    parent_name: 'Miles Dyson',
    email: 'miles@cyberdyne.com',
    phone: '07777777777',
    enquiry_type: '11+ Prep',
    status: 'won',
    created_at: '2026-04-05T09:15:00Z',
    updated_at: '2026-04-07T11:00:00Z',
    pipeline_stage: { id: 's3', pipeline_id: 'p1', name: 'Enrolled', color: '#10b981', sort_order: 4, is_active: true },
    owner: { id: 'u1', full_name: 'John Doe', email: 'john@example.com', role: 'admin' }
  }
];

export function LeadsListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleRowClick = (id: string) => {
    navigate(`/leads/${id}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Leads</h1>
          <p className={styles.subtitle}>Manage incoming enquiries and prospective students.</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          New Lead
        </Button>
      </header>

      <Card noPadding>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input 
              placeholder="Search leads..." 
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
                <th>Contact</th>
                <th>Enquiry Type</th>
                <th>Stage</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {mockLeads.map((lead) => (
                <tr key={lead.id} onClick={() => handleRowClick(lead.id)}>
                  <td>
                    <div className={styles.primaryCell}>{lead.parent_name}</div>
                    <div className={styles.contactInfo}>
                      <span className={styles.contactPhone}>{lead.email}</span>
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
                        <div className={styles.avatar}>
                          {getInitials(lead.owner.full_name)}
                        </div>
                        <span>{lead.owner.full_name}</span>
                      </div>
                    ) : 'Unassigned'}
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
          <span className={styles.pageInfo}>Showing 1 to {mockLeads.length} of {mockLeads.length} entries</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      <LeadForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
}
