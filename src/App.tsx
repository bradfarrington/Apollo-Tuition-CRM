import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { LeadsListPage } from './pages/leads/LeadsListPage';
import { LeadDetailPage } from './pages/leads/LeadDetailPage';
import { ParentsListPage } from './pages/parents/ParentsListPage';
import { ParentDetailPage } from './pages/parents/ParentDetailPage';
import { StudentsListPage } from './pages/students/StudentsListPage';
import { StudentDetailPage } from './pages/students/StudentDetailPage';
import { TutorsListPage } from './pages/tutors/TutorsListPage';
import { TutorDetailPage } from './pages/tutors/TutorDetailPage';
import { PipelineKanbanPage } from './pages/pipelines/PipelineKanbanPage';
import { 
  ContractsPage, 
  CommunicationsPage, 
  PaymentsPage, 
  TasksPage
} from './pages/PagePlaceholders';
import { SettingsLayout } from './components/layout/SettingsLayout';
import { PipelinesListPage } from './pages/settings/pipelines/PipelinesListPage';
import { PipelineDetailPage } from './pages/settings/pipelines/PipelineDetailPage';
import { CustomFieldsListPage } from './pages/settings/custom-fields/CustomFieldsListPage';
import { SubjectsSettingsPage } from './pages/settings/subjects/SubjectsSettingsPage';
import { OnboardingSubmissionsPage } from './pages/onboarding/OnboardingSubmissionsPage';
import { OnboardingReviewPage } from './pages/onboarding/OnboardingReviewPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadsListPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          
          <Route path="parents" element={<ParentsListPage />} />
          <Route path="parents/:id" element={<ParentDetailPage />} />
          
          <Route path="students" element={<StudentsListPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          
          <Route path="tutors" element={<TutorsListPage />} />
          <Route path="tutors/:id" element={<TutorDetailPage />} />
          
          <Route path="pipelines" element={<PipelineKanbanPage />} />

          <Route path="onboarding">
            <Route index element={<OnboardingSubmissionsPage />} />
            <Route path=":id" element={<OnboardingReviewPage />} />
          </Route>
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="communications" element={<CommunicationsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<div style={{ padding: 'var(--spacing-8)' }}>Select a settings category</div>} />
            <Route path="pipelines" element={<PipelinesListPage />} />
            <Route path="pipelines/:id" element={<PipelineDetailPage />} />
            <Route path="custom-fields" element={<CustomFieldsListPage />} />
            <Route path="subjects" element={<SubjectsSettingsPage />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={
            <div style={{ padding: 'var(--spacing-8)' }}>
              <h1>404 Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
