import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Trash2 } from 'lucide-react';
import { SubjectFormModal } from './SubjectFormModal';
import { useSubjects, type Subject } from '../../../contexts/SubjectsContext';
import styles from './SubjectsSettingsPage.module.css';

export function SubjectsSettingsPage() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useSubjects();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>(undefined);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  const handleAdd = () => {
    setEditingSubject(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleSave = (data: Pick<Subject, 'name' | 'colour' | 'is_active'>) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, data);
    } else {
      addSubject(data);
    }
    setIsFormOpen(false);
  };

  const handleDelete = (subject: Subject) => {
    setDeletingSubject(subject);
  };

  const confirmDelete = () => {
    if (deletingSubject) {
      deleteSubject(deletingSubject.id);
      setDeletingSubject(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Subjects Offered</h1>
          <p className={styles.subtitle}>Manage the subjects available for student enrolment</p>
        </div>
        <Button variant="primary" onClick={handleAdd}>
          Add Subject
        </Button>
      </header>

      <Card>
        <CardHeader title="All Subjects" />
        <CardContent>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Colour</th>
                  <th>Status</th>
                  <th className={styles.actionsCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>
                      <div className={styles.subjectName}>
                        <span
                          className={styles.colourSwatch}
                          style={{ backgroundColor: subject.colour }}
                        />
                        {subject.name}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 500,
                          backgroundColor: subject.colour + '22',
                          color: subject.colour,
                        }}
                      >
                        {subject.name}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        status={subject.is_active ? 'active' : 'inactive'}
                        label={subject.is_active ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionGroup}>
                        <Button variant="secondary" size="sm" onClick={() => handleEdit(subject)}>
                          Edit
                        </Button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(subject)}
                          title="Delete subject"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className={styles.emptyCell}>
                      No subjects configured yet. Click "Add Subject" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <SubjectFormModal
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          initialData={editingSubject}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingSubject && (
        <div className={styles.confirmOverlay} onClick={() => setDeletingSubject(null)}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Delete Subject</h3>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>{deletingSubject.name}</strong>? 
              This will remove it from all students currently assigned to this subject.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setDeletingSubject(null)}>Cancel</Button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
