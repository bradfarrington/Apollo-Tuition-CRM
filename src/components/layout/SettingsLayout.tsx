import { NavLink, Outlet } from 'react-router-dom';
import styles from './SettingsLayout.module.css';

export function SettingsLayout() {
  const navItems = [
    { label: 'Subjects Offered', path: '/settings/subjects' },
    { label: 'Pipelines', path: '/settings/pipelines' },
    { label: 'Custom Fields', path: '/settings/custom-fields' },
  ];

  return (
    <div className={styles.settingsLayout}>
      <aside className={styles.settingsSidebar}>
        <h2 className={styles.sidebarTitle}>Settings</h2>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className={styles.settingsContent}>
        <Outlet />
      </main>
    </div>
  );
}
