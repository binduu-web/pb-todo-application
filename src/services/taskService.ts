import { supabase, supabaseConfigIssue } from '../lib/supabase';
import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task';

const VALID_PRIORITIES: readonly TaskPriority[] = ['High', 'Medium', 'Low'];
const VALID_STATUSES: readonly TaskStatus[] = ['Pending', 'Completed'];
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class TaskDatabaseError extends Error {
  public readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'TaskDatabaseError';
    this.code = code;
  }
}

function getClient() {
  if (!supabase) {
    throw new TaskDatabaseError(
      supabaseConfigIssue ?? 'Supabase client is not configured.',
      'CONFIG_MISSING'
    );
  }
  return supabase;
}

function validateTaskPayload(input: CreateTaskInput | UpdateTaskInput) {
  const title = input.title.trim();
  if (!title) {
    throw new TaskDatabaseError('Task title is required.', 'VALIDATION_ERROR');
  }
  if (title.length > 200) {
    throw new TaskDatabaseError(
      'Task title must be 200 characters or fewer.',
      'VALIDATION_ERROR'
    );
  }

  const description = input.description.trim();

  if (!VALID_PRIORITIES.includes(input.priority)) {
    throw new TaskDatabaseError('Invalid priority selected.', 'VALIDATION_ERROR');
  }

  if (!VALID_STATUSES.includes(input.status)) {
    throw new TaskDatabaseError('Invalid status selected.', 'VALIDATION_ERROR');
  }

  let due_date: string | null = input.due_date ? input.due_date.trim() : null;
  if (due_date) {
    if (!ISO_DATE_REGEX.test(due_date)) {
      throw new TaskDatabaseError(
        'Due date must be a valid date (YYYY-MM-DD).',
        'VALIDATION_ERROR'
      );
    }
  } else {
    due_date = null;
  }

  return {
    title,
    description,
    due_date,
    priority: input.priority,
    status: input.status,
  };
}

function translateSupabaseError(error: {
  message?: string;
  code?: string;
  details?: string;
}): TaskDatabaseError {
  const code = error.code;
  const msg = error.message ?? 'An unexpected database error occurred.';

  if (code === '42P01' || code === 'PGRST205') {
    return new TaskDatabaseError(
      'The "tasks" table was not found in your Supabase project. Run supabase/schema.sql in the Supabase SQL Editor.',
      'TABLE_MISSING'
    );
  }

  if (code === '42501') {
    return new TaskDatabaseError(
      'Permission denied by Supabase Row Level Security (RLS). Ensure the RLS policies in supabase/schema.sql are applied.',
      'RLS_DENIED'
    );
  }

  if (code === '23514') {
    return new TaskDatabaseError(
      'Task data failed database validation constraints.',
      'CONSTRAINT_VIOLATION'
    );
  }

  return new TaskDatabaseError(msg, code);
}

/**
 * SELECT: Retrieve all tasks ordered by newest first.
 */
export async function fetchTasks(): Promise<Task[]> {
  const client = getClient();

  const { data, error } = await client
    .from('tasks')
    .select('id, title, description, due_date, priority, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw translateSupabaseError(error);
  }

  return (data ?? []) as Task[];
}

/**
 * INSERT: Create a new task in Supabase.
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const client = getClient();
  const payload = validateTaskPayload(input);

  const { data, error } = await client
    .from('tasks')
    .insert([payload])
    .select('id, title, description, due_date, priority, status, created_at')
    .single();

  if (error) {
    throw translateSupabaseError(error);
  }

  return data as Task;
}

/**
 * UPDATE: Edit an existing task in Supabase.
 */
export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const client = getClient();
  if (!id) {
    throw new TaskDatabaseError('Task ID is required.', 'VALIDATION_ERROR');
  }
  const payload = validateTaskPayload(input);

  const { data, error } = await client
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select('id, title, description, due_date, priority, status, created_at')
    .single();

  if (error) {
    throw translateSupabaseError(error);
  }

  return data as Task;
}

/**
 * UPDATE: Toggle completion status ('Pending' <-> 'Completed') in Supabase.
 */
export async function toggleTaskStatus(
  id: string,
  nextStatus: TaskStatus
): Promise<Task> {
  const client = getClient();
  if (!id) {
    throw new TaskDatabaseError('Task ID is required.', 'VALIDATION_ERROR');
  }
  if (!VALID_STATUSES.includes(nextStatus)) {
    throw new TaskDatabaseError('Invalid task status.', 'VALIDATION_ERROR');
  }

  const { data, error } = await client
    .from('tasks')
    .update({ status: nextStatus })
    .eq('id', id)
    .select('id, title, description, due_date, priority, status, created_at')
    .single();

  if (error) {
    throw translateSupabaseError(error);
  }

  return data as Task;
}

/**
 * DELETE: Permanently delete a task from Supabase.
 */
export async function deleteTask(id: string): Promise<void> {
  const client = getClient();
  if (!id) {
    throw new TaskDatabaseError('Task ID is required.', 'VALIDATION_ERROR');
  }

  const { error } = await client.from('tasks').delete().eq('id', id);

  if (error) {
    throw translateSupabaseError(error);
  }
}
