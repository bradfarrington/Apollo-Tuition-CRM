import React from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './SlideoverForm.module.css';

interface AccordionCardProps {
  title: string;
  subtitle?: string;
  summary?: React.ReactNode;
  icon?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function AccordionCard({
  title,
  subtitle,
  summary,
  icon,
  expanded,
  onToggle,
  children
}: AccordionCardProps) {
  return (
    <div className={expanded ? styles.sectionCard : styles.sectionCardCollapsed}>
      {/* Collapsible Header */}
      <div 
        className={styles.sectionCardHeader}
        onClick={onToggle}
      >
        <div className={styles.sectionCardHeaderLeft}>
          {icon && (
            <div className={`${styles.sectionCardIcon} ${expanded ? styles.sectionCardIconExpanded : styles.sectionCardIconCollapsed}`}>
              {icon}
            </div>
          )}
          <div className={styles.sectionCardTitleContainer}>
            {subtitle && (
              <div className={styles.sectionCardSubtitle}>
                {subtitle}
              </div>
            )}
            <div className={styles.sectionCardTitle}>
              {title}
            </div>
            {!expanded && summary && (
              <div className={styles.sectionCardSummary}>
                {summary}
              </div>
            )}
          </div>
        </div>
        <div className={styles.sectionCardRight}>
          <ChevronDown size={20} className={`${styles.sectionCardToggle} ${expanded ? styles.sectionCardToggleExpanded : ''}`} />
        </div>
      </div>

      {/* Accordion Body */}
      {expanded && (
        <div className={styles.sectionCardBody}>
          {children}
        </div>
      )}
    </div>
  );
}
