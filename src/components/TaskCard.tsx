import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Flag,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Task, TaskPriority } from '../types/task';

interface TaskCardProps {
  task: Task;
  isUpdating: boolean;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_STYLES: Record<
  TaskPriority,
  { textClass: string; label: string }
> = {
  High: {
    textClass: 'text-red-600',
    label: 'High priority',
  },
  Medium: {
    textClass: 'text-amber-600',
    label: 'Medium priority',
  },
  Low: {
    textClass: 'text-slate-500',
    label: 'Low priority',
  },
};

function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCreatedAt(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(dueDate: string | null, status: Task['status']): boolean {
  if (!dueDate || status === 'Completed') return false;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dueDate < todayIso;
}

export function TaskCard({
  task,
  isUpdating,
  onToggleStatus,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const completed = task.status === 'Completed';
  const overdue = isOverdue(task.due_date, task.status);
  const formattedDue = formatDate(task.due_date);
  const formattedCreated = formatCreatedAt(task.created_at);
  const priorityMeta = PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.Medium;

  return (
    <article
      className={`group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 transition-colors duration-150 ${
        completed ? 'bg-slate-50/70' : 'hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Completion Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={completed}
          aria-label={`Mark "${task.title}" as ${completed ? 'Pending' : 'Completed'}`}
          disabled={isUpdating}
          onClick={() => onToggleStatus(task)}
          className={`mt-0.5 flex h-10 w-10 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60 ${
            completed
              ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
              : 'border-slate-300 bg-white text-transparent hover:border-blue-600'
          }`}
        >
          {isUpdating ? (
            <Loader2
              className={`h-3.5 w-3.5 animate-spin ${
                completed ? 'text-white' : 'text-blue-600'
              }`}
              aria-hidden="true"
            />
          ) : (
            <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
          )}
        </button>

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3
                className={`font-display text-base font-semibold leading-snug break-words ${
                  completed ? 'text-slate-500 line-through' : 'text-slate-900'
                }`}
              >
                {task.title}
              </h3>

              {task.description ? (
                <p
                  className={`mt-1.5 text-sm leading-relaxed break-words ${
                    completed ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {task.description}
                </p>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete "${task.title}"`}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-red-600 whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-red-200 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Unboxed Typographic Metadata Row (Zero-Pill Discipline) */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
            <span
              className={`inline-flex items-center gap-1 font-medium ${priorityMeta.textClass}`}
            >
              <Flag className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{priorityMeta.label}</span>
            </span>

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span
              className={`font-medium ${
                completed ? 'text-emerald-700' : 'text-slate-700'
              }`}
            >
              {task.status}
            </span>

            {formattedDue ? (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                    overdue ? 'font-medium text-red-600' : 'text-slate-500'
                  }`}
                >
                  {overdue ? (
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {overdue ? `Overdue · ${formattedDue}` : `Due ${formattedDue}`}
                  </span>
                </span>
              </>
            ) : null}

            {formattedCreated ? (
              <>
                <span aria-hidden="true" className="text-slate-300">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-400">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Added {formattedCreated}</span>
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
