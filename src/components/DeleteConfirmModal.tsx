import { useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import type { Task } from '../types/task';

interface DeleteConfirmModalProps {
  task: Task | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  task,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    if (!task) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, isDeleting, onCancel]);

  if (!task) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle
              className="h-5 w-5 text-red-600 shrink-0"
              aria-hidden="true"
            />
            <h2
              id="delete-modal-title"
              className="font-display text-base font-semibold text-slate-900"
            >
              Delete Task
            </h2>
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            aria-label="Close confirmation dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-600">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold text-slate-900">
              &ldquo;{task.title}&rdquo;
            </span>
            ? This action removes the record from Supabase and cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onCancel}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => void onConfirm()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Permanently</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
