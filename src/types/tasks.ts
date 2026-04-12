export interface TaskStage {
  id: string;
  name: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  related_type?: 'parent' | 'student' | 'tutor' | 'lead' | 'invoice' | 'contract';
  related_id?: string;
  title: string;
  description?: string;
  stage_id?: string;
  assigned_to?: string;
  priority: TaskPriority;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_by?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  task_stages?: TaskStage;
  assignee?: {
    full_name: string;
  };
}
