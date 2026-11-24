import { CheckCircle2, Circle, Flag, Layers } from 'lucide-react';
import type { PriorityFilter, StatusFilter } from '../types/task';

interface SidebarProps {
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  onStatusChange: (status: StatusFilter) => void;
  onPriorityChange: (priority: PriorityFilter) => void;
  counts: {
    total: number;
    pending: number;
    completed: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function Sidebar({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
  counts,
}: SidebarProps) {
  const statusItems: {
    value: StatusFilter;
    label: string;
    count: number;
    icon: typeof Layers;
  }[] = [
    { value: 'All', label: 'All Tasks', count: counts.total, icon: Layers },
    { value: 'Pending', label: 'Pending', count: counts.pending, icon: Circle },
    {
      value: 'Completed',
      label: 'Completed',
      count: counts.completed,
      icon: CheckCircle2,
    },
  ];

  const priorityItems: {
    value: PriorityFilter;
    label: string;
    count: number;
    accentClass: string;
  }[] = [
    {
      value: 'All',
      label: 'All Priorities',
      count: counts.total,
      accentClass: 'text-slate-500',
    },
    {
      value: 'High',
      label: 'High Priority',
      count: counts.high,
      accentClass: 'text-red-600',
    },
    {
      value: 'Medium',
      label: 'Medium Priority',
      count: counts.medium,
      accentClass: 'text-amber-600',
    },
    {
      value: 'Low',
      label: 'Low Priority',
      count: counts.low,
      accentClass: 'text-slate-500',
    },
  ];

  return (
    <aside
      aria-label="Workspace navigation and filters"
      className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-slate-200 bg-white"
    >
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
          Taskflow
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-8 p-5">
        <nav aria-label="Task status views" className="space-y-1.5">
          <p className="px-3 pb-1 text-xs font-medium text-slate-500">Views</p>
          {statusItems.map((item) => {
            const Icon = item.icon;
            const active = statusFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onStatusChange(item.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
                  <Icon
                    className={`h-4 w-4 ${
                      active ? 'text-blue-600' : 'text-slate-400'
                    }`}
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
                <span
                  className={`font-mono text-xs tabular-nums ${
                    active ? 'text-blue-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 pt-6 space-y-1.5">
          <p className="px-3 pb-1 text-xs font-medium text-slate-500">
            Priority
          </p>
          {priorityItems.map((item) => {
            const active = priorityFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onPriorityChange(item.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  active
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
                  <Flag
                    className={`h-4 w-4 ${item.accentClass}`}
                    aria-hidden="true"
                  />
                  {item.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto border-t border-slate-200 pt-5">
          <p className="text-xs font-medium text-slate-500 mb-3">
            Task Overview
          </p>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Total tasks</dt>
              <dd className="font-mono font-medium text-slate-900 tabular-nums">
                {counts.total}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Pending</dt>
              <dd className="font-mono font-medium text-amber-700 tabular-nums">
                {counts.pending}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Completed</dt>
              <dd className="font-mono font-medium text-emerald-700 tabular-nums">
                {counts.completed}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  );
}
