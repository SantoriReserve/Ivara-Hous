-- Phase 3B.1: Plan core tables, completion trigger, RLS

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS congratulations_seen_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS plan_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL UNIQUE REFERENCES purchases (id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments (id) ON DELETE RESTRICT,
  product_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generating'
    CHECK (status IN ('generating', 'active', 'completed', 'failed')),
  plan_version TEXT NOT NULL,
  generator_version TEXT NOT NULL,
  assessment_schema_version TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_focus_day INTEGER NOT NULL DEFAULT 1 CHECK (current_focus_day BETWEEN 1 AND 40),
  total_required_tasks INTEGER NOT NULL DEFAULT 0,
  completed_required_tasks INTEGER NOT NULL DEFAULT 0,
  completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_at TIMESTAMPTZ,
  plan_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plan_instances_user_id_idx ON plan_instances (user_id);
CREATE INDEX IF NOT EXISTS plan_instances_assessment_id_idx ON plan_instances (assessment_id);
CREATE INDEX IF NOT EXISTS plan_instances_status_idx ON plan_instances (status);

CREATE TABLE IF NOT EXISTS plan_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_instance_id UUID NOT NULL REFERENCES plan_instances (id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  milestone TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  start_day INTEGER NOT NULL CHECK (start_day BETWEEN 1 AND 40),
  end_day INTEGER NOT NULL CHECK (end_day BETWEEN 1 AND 40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_instance_id, week_number)
);

CREATE INDEX IF NOT EXISTS plan_weeks_plan_instance_id_idx ON plan_weeks (plan_instance_id);

CREATE TABLE IF NOT EXISTS plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_instance_id UUID NOT NULL REFERENCES plan_instances (id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 40),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 6),
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  focus_area TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 45 CHECK (estimated_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_instance_id, day_number)
);

CREATE INDEX IF NOT EXISTS plan_days_plan_instance_id_idx ON plan_days (plan_instance_id);

CREATE TABLE IF NOT EXISTS plan_day_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_instance_id UUID NOT NULL REFERENCES plan_instances (id) ON DELETE CASCADE,
  plan_day_id UUID NOT NULL REFERENCES plan_days (id) ON DELETE CASCADE,
  task_order INTEGER NOT NULL CHECK (task_order >= 1),
  task_type TEXT NOT NULL
    CHECK (task_type IN ('action', 'research', 'create', 'review', 'reflect')),
  title TEXT NOT NULL,
  instruction TEXT NOT NULL,
  deliverable TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_day_id, task_order)
);

CREATE INDEX IF NOT EXISTS plan_day_tasks_plan_instance_id_idx ON plan_day_tasks (plan_instance_id);
CREATE INDEX IF NOT EXISTS plan_day_tasks_plan_day_id_idx ON plan_day_tasks (plan_day_id);

CREATE TABLE IF NOT EXISTS plan_task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_instance_id UUID NOT NULL REFERENCES plan_instances (id) ON DELETE CASCADE,
  plan_day_task_id UUID NOT NULL REFERENCES plan_day_tasks (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('not_started', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plan_day_task_id, user_id)
);

CREATE INDEX IF NOT EXISTS plan_task_completions_plan_instance_id_idx
  ON plan_task_completions (plan_instance_id);
CREATE INDEX IF NOT EXISTS plan_task_completions_user_id_idx ON plan_task_completions (user_id);

CREATE OR REPLACE FUNCTION public.recompute_plan_completion(p_plan_instance_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
  v_percentage NUMERIC(5, 2);
  v_current_status TEXT;
BEGIN
  SELECT COUNT(*)
  INTO v_total
  FROM plan_day_tasks
  WHERE plan_instance_id = p_plan_instance_id
    AND is_required = true;

  SELECT COUNT(*)
  INTO v_completed
  FROM plan_task_completions c
  INNER JOIN plan_day_tasks t ON t.id = c.plan_day_task_id
  WHERE c.plan_instance_id = p_plan_instance_id
    AND c.status = 'completed'
    AND t.is_required = true;

  IF v_total = 0 THEN
    v_percentage := 0;
  ELSE
    v_percentage := ROUND((v_completed::NUMERIC / v_total::NUMERIC) * 100, 2);
  END IF;

  SELECT status INTO v_current_status
  FROM plan_instances
  WHERE id = p_plan_instance_id;

  UPDATE plan_instances
  SET
    total_required_tasks = v_total,
    completed_required_tasks = v_completed,
    completion_percentage = v_percentage,
    status = CASE
      WHEN v_percentage = 100 THEN 'completed'
      WHEN v_current_status = 'completed' AND v_percentage < 100 THEN 'active'
      ELSE status
    END,
    completed_at = CASE
      WHEN v_percentage = 100 THEN COALESCE(completed_at, now())
      ELSE NULL
    END,
    updated_at = now()
  WHERE id = p_plan_instance_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_recompute_plan_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_plan_completion(OLD.plan_instance_id);
    RETURN OLD;
  END IF;

  PERFORM public.recompute_plan_completion(NEW.plan_instance_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS plan_task_completions_recompute ON plan_task_completions;

CREATE TRIGGER plan_task_completions_recompute
  AFTER INSERT OR UPDATE OR DELETE ON plan_task_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recompute_plan_completion();

ALTER TABLE plan_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_day_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY plan_instances_select_own ON plan_instances
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY plan_weeks_select_own ON plan_weeks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plan_instances pi
      WHERE pi.id = plan_weeks.plan_instance_id
        AND pi.user_id = auth.uid()
    )
  );

CREATE POLICY plan_days_select_own ON plan_days
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plan_instances pi
      WHERE pi.id = plan_days.plan_instance_id
        AND pi.user_id = auth.uid()
    )
  );

CREATE POLICY plan_day_tasks_select_own ON plan_day_tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plan_instances pi
      WHERE pi.id = plan_day_tasks.plan_instance_id
        AND pi.user_id = auth.uid()
    )
  );

CREATE POLICY plan_task_completions_select_own ON plan_task_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY plan_task_completions_insert_own ON plan_task_completions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM plan_instances pi
      WHERE pi.id = plan_task_completions.plan_instance_id
        AND pi.user_id = auth.uid()
    )
  );

CREATE POLICY plan_task_completions_update_own ON plan_task_completions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY plan_task_completions_delete_own ON plan_task_completions
  FOR DELETE
  USING (auth.uid() = user_id);
