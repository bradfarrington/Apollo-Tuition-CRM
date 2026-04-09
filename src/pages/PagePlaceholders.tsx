import { GenericList } from './GenericList';

export function LeadsPage() { return <GenericList title="Leads" addItemText="Add Lead" />; }
export function StudentsPage() { return <GenericList title="Students" addItemText="Add Student" />; }
export function PipelinesPage() { return <GenericList title="Pipelines" addItemText="New Pipeline" />; }
export function ContractsPage() { return <GenericList title="Contracts" addItemText="Create Contract" />; }
export function CommunicationsPage() { return <GenericList title="Communications" addItemText="New Message" />; }
export function PaymentsPage() { return <GenericList title="Payments" addItemText="Create Invoice" />; }
export function TasksPage() { return <GenericList title="Tasks" addItemText="Create Task" />; }

export function SettingsPage() {
  return (
    <div style={{ padding: 'var(--spacing-8)' }}>
      <h1>Settings</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>System and profile configurations will live here.</p>
    </div>
  );
}
