import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { StageBadge } from '../../../components/ui/StageBadge';
import styles from './PipelineDetailPage.module.css';

const mockPipeline = {
  id: '1',
  name: 'Standard Lead Flow',
  entity_type: 'lead',
  is_default: true,
  is_active: true,
};

const mockStages = [
  { id: '1', name: 'New Enquiry', color: '#E0F2FE', sort_order: 0, is_active: true },
  { id: '2', name: 'Contacted', color: '#FEF3C7', sort_order: 1, is_active: true },
  { id: '3', name: 'Assessment Booked', color: '#D1FAE5', sort_order: 2, is_active: true },
  { id: '4', name: 'Lost', color: '#FEE2E2', sort_order: 3, is_active: true }
];

export function PipelineDetailPage() {
  const navigate = useNavigate();

  const [stages, setStages] = useState(mockStages);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('sourceIndex', index.toString());
  };

  const handleDrop = (e: React.DragEvent, destIndex: number) => {
    const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'), 10);
    if (sourceIndex === destIndex) return;

    const newStages = [...stages];
    const [movedStage] = newStages.splice(sourceIndex, 1);
    newStages.splice(destIndex, 0, movedStage);
    
    // Update sort orders
    const reordered = newStages.map((stage, idx) => ({ ...stage, sort_order: idx }));
    setStages(reordered);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <Button variant="secondary" onClick={() => navigate('/settings/pipelines')} className={styles.backButton}>
            ← Back
          </Button>
          <div>
            <h1 className={styles.title}>Edit Pipeline: {mockPipeline.name}</h1>
            <p className={styles.subtitle}>Configure pipeline details and manage stages</p>
          </div>
        </div>
        <Button variant="primary">Save Changes</Button>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <Card>
            <CardHeader title="Pipeline Details" />
            <CardContent>
              <div className={styles.formGrid}>
                <Input label="Pipeline Name" defaultValue={mockPipeline.name} fullWidth />
                <div className={styles.selectWrapper}>
                   <label className={styles.selectLabel}>Entity Type</label>
                   <select className={styles.select} defaultValue={mockPipeline.entity_type} disabled>
                     <option value="lead">Leads</option>
                     <option value="student_onboarding">Student Onboarding</option>
                     <option value="tutor_onboarding">Tutor Onboarding</option>
                     <option value="other">Other</option>
                   </select>
                </div>
                <div className={styles.checkboxWrapper}>
                  <input type="checkbox" id="is_default" defaultChecked={mockPipeline.is_default} />
                  <label htmlFor="is_default">Default Pipeline for this Entity</label>
                </div>
                 <div className={styles.checkboxWrapper}>
                  <input type="checkbox" id="is_active" defaultChecked={mockPipeline.is_active} />
                  <label htmlFor="is_active">Active Status</label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={styles.stagesCard}>
            <CardHeader 
              title="Pipeline Stages" 
              action={<Button variant="secondary" size="sm">Add Stage</Button>}
            />
            <CardContent>
              <p className={styles.stagesHelpText}>Drag and drop stages to reorder them.</p>
              <div className={styles.stagesList}>
                {stages.map((stage, index) => (
                  <div 
                    key={stage.id} 
                    className={styles.stageItem}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className={styles.dragHandle}>⋮⋮</div>
                    <div className={styles.stageContent}>
                       <Input defaultValue={stage.name} className={styles.stageNameInput} />
                       <div className={styles.colorPickerWrapper}>
                          <input type="color" defaultValue={stage.color} className={styles.colorInput} />
                       </div>
                       <StageBadge stage={stage.name} colorHex={stage.color} />
                    </div>
                    <Button variant="secondary" size="sm" className={styles.stageActionRemove}>Remove</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
