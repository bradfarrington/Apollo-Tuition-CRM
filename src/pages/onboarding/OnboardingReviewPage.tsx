import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, UserCheck } from 'lucide-react';
import styles from './OnboardingReviewPage.module.css';

export function OnboardingReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  // MOCK PAYLOAD
  const payload = {
    parent: {
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.j@example.com',
      phone: '07712345678',
      address: '123 Main St, London, SW1A 1AA',
    },
    student: {
      firstName: 'Tom',
      lastName: 'Jenkins',
      dob: '2010-05-15',
      schoolYear: 'Year 9',
      keyStage: 'KS3',
    },
    custom: {
      academicNeeds: 'Needs help preparing for GCSE Maths next year. Currently struggling with algebra.',
      medicalNotes: 'Mild peanut allergy. Carries epi-pen.',
      availability: 'Tuesdays and Thursdays after 4pm',
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <button className={styles.backButton} onClick={() => navigate('/onboarding')}>
            <ArrowLeft size={16} /> Back to Submissions
          </button>
          <h1 className={styles.title}>Review Onboarding Submission</h1>
          <p className={styles.subtitle}>Submission ID: {id} &bull; Received Oct 15, 2023</p>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        
        {/* LEFT COLUMN: RAW SUBMISSION DATA */}
        <div className={styles.payloadColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Guardian Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>First Name</span>
                <div className={styles.fieldValue}>{payload.parent.firstName}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Last Name</span>
                <div className={styles.fieldValue}>{payload.parent.lastName}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <div className={styles.fieldValue}>{payload.parent.email}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Phone</span>
                <div className={styles.fieldValue}>{payload.parent.phone}</div>
              </div>
              <div className={styles.field} style={{ gridColumn: 'span 2' }}>
                <span className={styles.fieldLabel}>Address</span>
                <div className={styles.fieldValue}>{payload.parent.address}</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Student Information</h2>
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>First Name</span>
                <div className={styles.fieldValue}>{payload.student.firstName}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Last Name</span>
                <div className={styles.fieldValue}>{payload.student.lastName}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Date of Birth</span>
                <div className={styles.fieldValue}>{payload.student.dob}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>School Year</span>
                <div className={styles.fieldValue}>{payload.student.schoolYear}</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Additional Details</h2>
            <div className={styles.fieldGroup} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Academic Needs / Goals</span>
                <div className={`${styles.fieldValue} ${styles.textAreaValue}`}>{payload.custom.academicNeeds}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Medical Notes</span>
                <div className={`${styles.fieldValue} ${styles.textAreaValue}`}>{payload.custom.medicalNotes}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Availability</span>
                <div className={styles.fieldValue}>{payload.custom.availability}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & MAPPING CONTROLS */}
        <div className={styles.actionColumn}>
          
          <div className={styles.actionCard}>
            <h3 className={styles.cardTitle}>
              <UserCheck size={18} /> Duplicate Check
            </h3>
            <div className={styles.matchWarning}>
              <div className={styles.matchHeader}>
                <AlertTriangle size={16} /> Potential Match Found
              </div>
              <p style={{ margin: 0 }}>An existing lead was found matching "sarah.j@example.com".</p>
              <select className={styles.matchSelect}>
                <option value="link_lead_123">Link to Lead: Sarah Jenkins</option>
                <option value="create_new">Ignore & Create New Lead</option>
              </select>
            </div>
          </div>

          <div className={styles.actionCard}>
            <h3 className={styles.cardTitle}>Pipeline Settings</h3>
            <div className={styles.selectGroup}>
              <label>Destination Pipeline</label>
              <select className={styles.selectInput} defaultValue="student_onboarding">
                <option value="student_onboarding">Student Onboarding</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div className={styles.selectGroup}>
              <label>Initial Stage</label>
              <select className={styles.selectInput} defaultValue="tutor_allocation">
                <option value="form_received">Form Received</option>
                <option value="tutor_allocation">Tutor Allocation</option>
                <option value="contract_sent">Contract Sent</option>
              </select>
            </div>
          </div>

          <div className={styles.actionCard} style={{ backgroundColor: 'var(--color-background)', borderColor: 'transparent' }}>
            <button className={styles.primaryAction} onClick={() => navigate('/onboarding')}>
              <CheckCircle2 size={18} /> Approve & Create Records
            </button>
            <button className={styles.secondaryAction}>
              <XCircle size={18} /> Reject Submission
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
