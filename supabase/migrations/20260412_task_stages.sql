-- ----------------------------------------------------
-- TASK STAGES
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    color TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADD stage_id TO tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.task_stages(id) ON DELETE SET NULL;

-- INSERT DEFAULT STAGES
INSERT INTO public.task_stages (name, color, sort_order)
SELECT 'To Do', '#94a3b8', 1
WHERE NOT EXISTS (SELECT 1 FROM public.task_stages WHERE name = 'To Do');

INSERT INTO public.task_stages (name, color, sort_order)
SELECT 'In Progress', '#3b82f6', 2
WHERE NOT EXISTS (SELECT 1 FROM public.task_stages WHERE name = 'In Progress');

INSERT INTO public.task_stages (name, color, sort_order)
SELECT 'Done', '#10b981', 3
WHERE NOT EXISTS (SELECT 1 FROM public.task_stages WHERE name = 'Done');
