/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ClipboardList,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Sidebar } from './components/Sidebar';
import { SupabaseSetupGuide } from './components/SupabaseSetupGuide';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { TaskToolbar } from './components/TaskToolbar';
import { ToastContainer } from './components/ToastContainer';
import { isSupabaseConfigured, supabaseConfigIssue } from './lib/supabase';
import {
  createTask,
  deleteTask,
  fetchTasks,
  TaskDatabaseError,
  toggleTaskStatus,
  updateTask,
} from './services/taskService';
import type {
  CreateTaskInput,
  PriorityFilter,
  StatusFilter,
  Task,
  ToastMessage,
  ToastType,
} from './types/task';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(
    supabaseConfigIssue
  );
  const [needsSchemaSetup, setNeedsSchemaSetup] = useState<boolean>(
    !isSupabaseConfigured
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');

  // Modals & Active Mutations
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSavingTask, setIsSavingTask] = useState<boolean>(false);

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState<boolean>(false);

  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastType, title: string, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadTasks = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        setIsRefreshing(false);
        setNeedsSchemaSetup(true);
        setLoadError(supabaseConfigIssue);
        return;
      }

      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await fetchTasks();
        setTasks(data);
        setLoadError(null);
        setNeedsSchemaSetup(false);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to fetch tasks from Supabase.';
        setLoadError(message);
        if (
          error instanceof TaskDatabaseError &&
          (error.code === 'TABLE_MISSING' || error.code === 'CONFIG_MISSING')
        ) {
          setNeedsSchemaSetup(true);
        }
        pushToast('error', 'Failed to load tasks', message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const counts = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    for (const task of tasks) {
      if (task.status === 'Completed') {
        completed += 1;
      } else {
        pending += 1;
      }
      if (task.priority === 'High') high += 1;
      else if (task.priority === 'Medium') medium += 1;
      else if (task.priority === 'Low') low += 1;
    }

    return {
      total: tasks.length,
      pending,
      completed,
      high,
      medium,
      low,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      if (statusFilter !== 'All' && task.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }
      if (query && !task.title.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    if (isSavingTask) return;
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async (values: CreateTaskInput) => {
    setIsSavingTask(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values);
        pushToast(
          'success',
          'Task updated',
          `"${values.title}" was updated in Supabase.`
        );
      } else {
        await createTask(values);
        pushToast(
          'success',
          'Task created',
          `"${values.title}" was saved to Supabase.`
        );
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
      await loadTasks({ silent: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save task.';
      pushToast('error', 'Save failed', message);
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTogglingTaskId(task.id);
    try {
      await toggleTaskStatus(task.id, nextStatus);
      pushToast(
        'success',
        nextStatus === 'Completed' ? 'Task completed' : 'Task reopened',
        `"${task.title}" marked as ${nextStatus}.`
      );
      await loadTasks({ silent: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update task status.';
      pushToast('error', 'Status update failed', message);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeletingTask(true);
    const deletedTitle = taskToDelete.title;
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      pushToast(
        'success',
        'Task deleted',
        `"${deletedTitle}" was permanently removed from Supabase.`
      );
      await loadTasks({ silent: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete task.';
      pushToast('error', 'Delete failed', message);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All';

  const headingLabel =
    statusFilter === 'All'
      ? 'All Tasks'
      : statusFilter === 'Pending'
        ? 'Pending Tasks'
        : 'Completed Tasks';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        counts={counts}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 lg:hidden">
              Taskflow
            </span>
            <h1 className="hidden lg:block font-display text-lg font-semibold text-slate-900 truncate">
              {headingLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              disabled={!isSupabaseConfigured || isLoading || isRefreshing}
              onClick={() => void loadTasks({ silent: true })}
              aria-label="Refresh tasks"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              disabled={!isSupabaseConfigured || needsSchemaSetup}
              onClick={handleOpenCreateModal}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>New Task</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-8 space-y-6">
          {/* Setup / Error State */}
          {needsSchemaSetup && loadError ? (
            <SupabaseSetupGuide
              issueMessage={loadError}
              onRetry={
                isSupabaseConfigured ? () => void loadTasks() : undefined
              }
            />
          ) : null}

          {!needsSchemaSetup && loadError ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Unable to sync with Supabase
                  </p>
                  <p className="mt-0.5 text-sm text-red-700">{loadError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void loadTasks()}
                className="inline-flex h-9 items-center gap-1.5 self-start rounded-lg border border-red-200 bg-white px-3.5 text-xs font-medium text-red-700 whitespace-nowrap shrink-0 hover:bg-red-100/50 sm:self-center"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Try Again</span>
              </button>
            </div>
          ) : null}

          {!needsSchemaSetup ? (
            <>
              <TaskToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                counts={counts}
              />

              {/* Task List Content */}
              {isLoading ? (
                <div
                  aria-label="Loading tasks"
                  className="space-y-3"
                >
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-6 w-6 rounded-md bg-slate-200" />
                        <div className="flex-1 space-y-2.5">
                          <div className="h-4 w-2/5 rounded bg-slate-200" />
                          <div className="h-3.5 w-4/5 rounded bg-slate-100" />
                          <div className="h-3 w-1/3 rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                    <ClipboardList className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 font-display text-base font-semibold text-slate-900">
                    {tasks.length === 0
                      ? 'No tasks yet'
                      : 'No tasks match your filters'}
                  </h2>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                    {tasks.length === 0
                      ? 'Create your first task to store and manage it directly in your Supabase database.'
                      : 'Try adjusting your search query, status tab, or priority filter to see other tasks.'}
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-50"
                      >
                        Clear Filters
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white whitespace-nowrap shrink-0 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span className="font-mono tabular-nums">
                      Showing {filteredTasks.length} of {tasks.length}{' '}
                      {tasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        Reset filters
                      </button>
                    ) : null}
                  </div>

                  <ul className="space-y-3">
                    {filteredTasks.map((task) => (
                      <li key={task.id}>
                        <TaskCard
                          task={task}
                          isUpdating={togglingTaskId === task.id}
                          onToggleStatus={(t) => void handleToggleStatus(t)}
                          onEdit={handleOpenEditModal}
                          onDelete={setTaskToDelete}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </main>
      </div>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        editingTask={editingTask}
        isSaving={isSavingTask}
        onClose={handleCloseTaskModal}
        onSubmit={handleSaveTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={taskToDelete}
        isDeleting={isDeletingTask}
        onCancel={() => {
          if (!isDeletingTask) setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Success & Error Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
