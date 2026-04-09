import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Presentation, 
  GitBranch, 
  Rocket, 
  MessageSquare, 
  CreditCard, 
  CheckSquare, 
  Settings,
  Plus,
  Calendar
} from 'lucide-react';
import styles from './Sidebar.module.css';

const crmItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Parents', path: '/parents', icon: Users },
  { name: 'Students', path: '/students', icon: GraduationCap },
  { name: 'Tutors', path: '/tutors', icon: Presentation },
];

const workflowItems = [
  { name: 'Pipelines', path: '/pipelines', icon: GitBranch },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Onboarding', path: '/onboarding', icon: Rocket },
  { name: 'Communications', path: '/communications', icon: MessageSquare },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/black text logo no bg.png" alt="Explore Apollo Logo" className={styles.logoImage} />
      </div>

      <div className={styles.newButtonContainer}>
        <button className={styles.newButton}>
          <Plus size={16} />
          New
        </button>
      </div>
      
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>CRM</div>
          {crmItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <Icon size={18} className={styles.icon} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupTitle}>Workflow</div>
          {workflowItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <Icon size={18} className={styles.icon} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.navGroupTitle}>System</div>
        <NavLink
          to="/settings"
          className={({ isActive }) => 
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          <Settings size={18} className={styles.icon} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
