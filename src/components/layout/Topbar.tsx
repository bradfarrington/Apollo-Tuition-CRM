import { Search, Bell, User } from 'lucide-react';
import styles from './Topbar.module.css';

export function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder="Search everywhere..." 
          className={styles.searchInput}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={18} />
          <span className={styles.notificationBadge}></span>
        </button>
        <div className={styles.profileSection}>
          <div className={styles.avatarButton}>
            <User size={18} />
          </div>
          <div className={styles.profileText}>
            <p className={styles.profileName}>Admin User</p>
            <p className={styles.profileRole}>Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
