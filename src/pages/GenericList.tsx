import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Filter, MoreVertical } from 'lucide-react';
import styles from './GenericList.module.css';

export function GenericList({ title = 'List View', addItemText = 'Add Item' }) {
  // Placeholder data
  const data = [
    { id: '1', name: 'Alice Smith', status: 'Active', role: 'Student', date: 'Oct 24, 2026' },
    { id: '2', name: 'Bob Johnson', status: 'Pending', role: 'Lead', date: 'Oct 22, 2026' },
    { id: '3', name: 'Charlie Brown', status: 'Inactive', role: 'Tutor', date: 'Oct 19, 2026' },
    { id: '4', name: 'Diana Prince', status: 'Active', role: 'Parent', date: 'Oct 18, 2026' },
    { id: '5', name: 'Evan Wright', status: 'Pending', role: 'Lead', date: 'Oct 15, 2026' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="success">Active</Badge>;
      case 'Pending': return <Badge variant="warning">Pending</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>Manage your {title.toLowerCase()} records here.</p>
        </div>
        <Button variant="primary">
          <Plus size={16} />
          {addItemText}
        </Button>
      </header>

      <Card noPadding>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Input placeholder={`Search ${title.toLowerCase()}...`} />
          </div>
          <Button variant="secondary" className={styles.filterBtn}>
            <Filter size={16} /> Filters
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Added</th>
                <th className={styles.actionsCol}></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td className={styles.primaryCell}>{item.name}</td>
                  <td>{item.role}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td className={styles.mutedCell}>{item.date}</td>
                  <td className={styles.actionsCol}>
                    <button className={styles.actionBtn}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 5 of 5 entries</span>
          <div className={styles.pageButtons}>
            <Button variant="secondary" size="sm" disabled>Previous</Button>
            <Button variant="secondary" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
