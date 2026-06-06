"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completePlanTask,
  uncompletePlanTask,
} from "@/app/actions/plan-task-actions";
import { ROUTES } from "@/lib/constants";
import type { PlanDayTaskRecord } from "@/lib/plan/plan-schema";

type TaskWithStatus = PlanDayTaskRecord & {
  completionStatus: "not_started" | "completed" | "skipped";
};

type TaskChecklistProps = {
  tasks: TaskWithStatus[];
};

export function TaskChecklist({ tasks }: TaskChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localStatus, setLocalStatus] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      tasks.map((t) => [t.id, t.completionStatus === "completed"])
    )
  );

  const handleToggle = (taskId: string, checked: boolean) => {
    setLocalStatus((prev) => ({ ...prev, [taskId]: checked }));

    startTransition(async () => {
      const result = checked
        ? await completePlanTask(taskId)
        : await uncompletePlanTask(taskId);

      if (!result.success) {
        setLocalStatus((prev) => ({ ...prev, [taskId]: !checked }));
        return;
      }

      if (result.justCompletedPlan) {
        router.push(ROUTES.dashboardCongratulations);
        return;
      }

      router.refresh();
    });
  };

  return (
    <ul className="space-y-4">
      {tasks.map((task) => {
        const isComplete = localStatus[task.id] ?? false;

        return (
          <li
            key={task.id}
            className={`border p-5 transition-colors ${
              isComplete ? "border-black/20 bg-black/5" : "border-black/10"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                checked={isComplete}
                disabled={isPending}
                onChange={(e) => handleToggle(task.id, e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-black"
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-sans text-sm font-medium ${
                      isComplete ? "text-gray-mid line-through" : "text-black"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-nav text-gray-muted">
                    {task.taskType}
                  </span>
                </span>
                <p className="mt-2 font-sans text-sm leading-relaxed text-gray-mid">
                  {task.instruction}
                </p>
                <p className="mt-3 font-sans text-xs text-gray-muted">
                  <span className="uppercase tracking-nav">Deliverable:</span>{" "}
                  {task.deliverable}
                </p>
                <p className="mt-1 font-sans text-xs text-gray-muted">
                  <span className="uppercase tracking-nav">Success:</span>{" "}
                  {task.successCriteria}
                </p>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
