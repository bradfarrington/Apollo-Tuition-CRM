-- Enable RLS on task_stages
ALTER TABLE public.task_stages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (matches your current non-authenticated dev setup)
CREATE POLICY task_stages_all ON public.task_stages FOR ALL USING (true) WITH CHECK (true);

-- Allow all operations on tasks table (matches your current non-authenticated dev setup)
-- This overrides the 'Internal staff full access' for development
CREATE POLICY tasks_all_anon ON public.tasks FOR ALL USING (true) WITH CHECK (true);
