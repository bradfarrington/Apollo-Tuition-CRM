import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { Subject } from '../../../contexts/SubjectsContext';
import styles from './SubjectFormModal.module.css';

// Pastel colour palette matching the design system
const COLOUR_OPTIONS = [
  '#a5acff', // periwinkle (accent primary)
  '#93c5fd', // pastel blue
  '#f9a8d4', // pastel pink
  '#6ee7b7', // pastel green
  '#fbbf24', // warm amber
  '#f87171', // soft red
  '#c084fc', // lilac
  '#67e8f9', // cyan
  '#fca5a1', // coral
  '#86efac', // mint
  '#fdba74', // peach
  '#a78bfa', // violet
];

interface SubjectFormModalProps {
  onClose: () => void;
  onSave: (subject: Pick<Subject, 'name' | 'colour' | 'is_active'>) => void;
  initialData?: Subject;
}

export function SubjectFormModal({ onClose, onSave, initialData }: SubjectFormModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [colour, setColour] = useState(initialData?.colour || COLOUR_OPTIONS[0]);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), colour, is_active: isActive });
    onClose();
  };

  // Compute lighter bg from the hex colour for the pill preview
  const pillBg = colour + '22'; // hex with low alpha 
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.slideOver} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>{initialData ? 'Edit Subject' : 'Add Subject'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <main className={styles.content}>
          <div className={styles.formGroup}>
            <Input
              id="subject_name"
              label="Subject Name"
              placeholder="e.g. Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </div>

          <div className={styles.colourSection}>
            <label className={styles.label}>Colour</label>
            <div className={styles.colourGrid}>
              {COLOUR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colourOption} ${colour === c ? styles.selected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColour(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className={styles.preview}>
            <div className={styles.previewLabel}>Preview</div>
            <span
              className={styles.previewPill}
              style={{ backgroundColor: pillBg, color: colour }}
            >
              {name || 'Subject Name'}
            </span>
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="is_active">Active</label>
          </div>
        </main>

        <footer className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>
            {initialData ? 'Save Changes' : 'Add Subject'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
