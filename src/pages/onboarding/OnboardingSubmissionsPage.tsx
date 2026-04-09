import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, Clock } from 'lucide-react';
import styles from '../GenericList.module.css'; // Using GenericList styles for consistency

// MOCK DATA
const mockSubmissions = [
  {
    id: 'sub-001',
    parentName: 'Sarah Jenkins',
    studentName: 'Tom Jenkins',
    dateSubmitted: '2023-10-15',
    status: 'pending',
    pipelineStage: 'Form Received',
  },
  {
    id: 'sub-002',
    parentName: 'David Lee',
    studentName: 'Emma Lee',
    dateSubmitted: '2023-10-14',
    status: 'approved',
    pipelineStage: 'Tutor Allocation',
  },
  {
    id: 'sub-003',
    parentName: 'Maria Garcia',
    studentName: 'Leo Garcia',
    dateSubmitted: '2023-10-14',
    status: 'pending',
    pipelineStage: 'Form Received',
  }
];

export function OnboardingSubmissionsPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Onboarding Submissions</h1>
          <p className={styles.subtitle}>Review incoming student intake forms</p>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input 
            type="text" 
            placeholder="Search submissions..." 
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filtersContainer}>
          <button className={styles.filterButton}>Pending Only</button>
        </div>
      </div>

      <div className={styles.listContainer}>
        {mockSubmissions.length > 0 ? (
          mockSubmissions.map((sub) => (
            <div 
              key={sub.id} 
              className={styles.listItem}
              onClick={() => navigate(`/onboarding/${sub.id}`)}
            >
              <div className={styles.itemMain}>
                <div className={styles.itemAvatar}>
                  <LayoutDashboard className={styles.itemIcon} />
                </div>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>
                    {sub.parentName} &rarr; {sub.studentName}
                  </h3>
                  <div className={styles.itemMeta}>
                    <span>Submitted: {sub.dateSubmitted}</span>
                    <span>&bull;</span>
                    <span>Stage: {sub.pipelineStage}</span>
                  </div>
                </div>
              </div>
              <div className={styles.itemActions}>
                <span className={`${styles.statusBadge} ${sub.status === 'approved' ? styles.statusActive : styles.statusInactive}`}>
                  {sub.status === 'pending' && <Clock size={14} className={styles.statusIcon} />}
                  {sub.status === 'approved' && <CheckCircle2 size={14} className={styles.statusIcon} />}
                  {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <LayoutDashboard className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No Recent Submissions</h3>
            <p className={styles.emptySubtitle}>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
