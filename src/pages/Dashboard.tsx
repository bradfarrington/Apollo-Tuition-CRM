import { 
  Users, 
  Rocket, 
  FileText, 
  CreditCard, 
  Plus,
  Send,
  Calendar,
  AlertCircle,
  PhoneCall,
  CheckSquare
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import styles from './Dashboard.module.css';

function ActionCard({ title, count, accentClass, icon: Icon }) {
  return (
    <button className={`${styles.actionCard} ${accentClass}`}>
      <div className={styles.actionCardHeader}>
        <div className={styles.actionCardIcon}><Icon size={18} /></div>
      </div>
      <div className={styles.actionCardContent}>
        <span className={styles.actionCardCount}>{count}</span>
        <span className={styles.actionCardTitle}>{title}</span>
      </div>
    </button>
  );
}

function StatCard({ title, value, subtitle, gradientClass }: { title: string, value: string, subtitle?: string, gradientClass?: string }) {
  return (
    <div className={`${styles.statCard} ${gradientClass || ''}`}>
      <span className={styles.statCardTitle}>{title}</span>
      <span className={styles.statCardValue}>{value}</span>
      {subtitle && <span className={styles.statCardSubtitle}>{subtitle}</span>}
    </div>
  );
}

function TaskItem({ title, relatedRecord, dueDate, isOverdue }) {
  return (
    <div className={styles.taskItem}>
      <div className={styles.taskItemLeft}>
        <span className={styles.taskItemTitle}>{title}</span>
        <span className={styles.taskItemRecord}>{relatedRecord}</span>
      </div>
      <div className={`${styles.taskItemDate} ${isOverdue ? styles.taskOverdue : styles.taskNormal}`}>
        {dueDate}
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, description, time }) {
  return (
    <div className={styles.activityItem}>
      <div className={styles.activityLine} />
      <div className={styles.activityIconWrapper}>
        <Icon size={14} />
      </div>
      <div className={styles.activityContent}>
        <span className={styles.activityTitle}>{title}</span>
        <span className={styles.activityDesc}>{description}</span>
        <span className={styles.activityTime}>{time}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState({ students: 0, tutors: 0, leads: 0, parents: 0 });

  useEffect(() => {
    (async () => {
      const [studentsRes, tutorsRes, leadsRes, parentsRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tutors').select('id', { count: 'exact', head: true }).eq('active_status', 'active'),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('parents').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      setStats({
        students: studentsRes.count || 0,
        tutors: tutorsRes.count || 0,
        leads: leadsRes.count || 0,
        parents: parentsRes.count || 0,
      });
    })();
  }, []);

  return (
    <div className={styles.container}>
      
      {/* Header Section */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Here's what needs your attention today.</p>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.quickActionBtn}>
            <Plus size={14} /> Add Lead
          </button>
          <button className={styles.quickActionBtn}>
            <Calendar size={14} /> Book Call
          </button>
          <button className={styles.quickActionBtn}>
            <Send size={14} /> Send Message
          </button>
        </div>
      </div>

      {/* Action Required Row */}
      <div className={styles.actionRow}>
        <ActionCard title="New Leads" count={5} accentClass={styles.accentBlue} icon={Users} />
        <ActionCard title="Calls Booked Today" count={3} accentClass={styles.accentPurple} icon={PhoneCall} />
        <ActionCard title="Onboarding Pending" count={2} accentClass={styles.accentOrange} icon={Rocket} />
        <ActionCard title="Overdue Payments" count={3} accentClass={styles.accentRed} icon={CreditCard} />
        <ActionCard title="Tutors Attention" count={1} accentClass={styles.accentGreen} icon={AlertCircle} />
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        
        {/* Left Column */}
        <div className={styles.leftColumn}>
          
          <div className={styles.sectionHeader}>
            <h2>Business Snapshot</h2>
          </div>
          <div className={styles.statsGrid}>
          <StatCard title="Active Students" value={String(stats.students)} subtitle="" gradientClass={styles.statCardBlue} />
            <StatCard title="Active Tutors" value={String(stats.tutors)} gradientClass={styles.statCardPurple} />
            <StatCard title="Open Leads" value={String(stats.leads)} gradientClass={styles.statCardPink} />
            <StatCard title="Active Parents" value={String(stats.parents)} gradientClass={styles.statCardGreen} />
          </div>


          <div className={styles.sectionHeader}>
            <h2>Recent Activity</h2>
          </div>
          <div className={`${styles.cardBlock} ${styles.feedCard}`}>
            <div className={styles.activityFeed}>
              <ActivityItem 
                icon={Users} 
                title="New Lead Added" 
                description="Sarah Jenkins via Website Form" 
                time="10 mins ago" 
              />
              <ActivityItem 
                icon={Rocket} 
                title="Onboarding Completed" 
                description="Michael Chang finished setup" 
                time="1 hour ago" 
              />
              <ActivityItem 
                icon={FileText} 
                title="Contract Signed" 
                description="Emily Roberts" 
                time="2 hours ago" 
              />
              <ActivityItem 
                icon={CreditCard} 
                title="Payment Received" 
                description="£240 from David Smith" 
                time="3 hours ago" 
              />
              <ActivityItem 
                icon={CheckSquare} 
                title="Task Completed" 
                description="Reviewed new tutor application" 
                time="5 hours ago" 
              />
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          
          <div className={styles.sectionHeader}>
            <h2>Tasks / Today</h2>
            <button className={styles.textAction}>View All</button>
          </div>
          <div className={styles.cardBlock} style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className={styles.taskList}>
              <TaskItem title="Follow up on pricing" relatedRecord="Lead: Sarah Jenkins" dueDate="Today" isOverdue={true} />
              <TaskItem title="Call about missing payment" relatedRecord="Parent: David Smith" dueDate="Yesterday" isOverdue={true} />
              <TaskItem title="Send tutor introduction email" relatedRecord="Tutor: Emily Roberts" dueDate="Tomorrow" isOverdue={false} />
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h2>Upcoming Calls / Calendar</h2>
            <button className={styles.textAction}>View Calendar</button>
          </div>
          <div className={styles.cardBlock}>
            <div className={styles.taskList}>
              <TaskItem title="Lead Discovery Call" relatedRecord="Sara Jenkins" dueDate="Today 14:00" isOverdue={false} />
              <TaskItem title="Tutor Interview" relatedRecord="Marcus Wright" dueDate="Tomorrow 10:00" isOverdue={false} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
