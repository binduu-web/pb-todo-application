export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Pending' | 'Completed';

export type StatusFilter = 'All' | TaskStatus;

export type PriorityFilter = 'All' | TaskPriority;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface UpdateTaskInput {
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
}

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}
