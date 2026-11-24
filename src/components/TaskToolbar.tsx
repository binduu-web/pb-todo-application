import { Search, X } from 'lucide-react';
import type { PriorityFilter, StatusFilter } from '../types/task';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  counts: {
    total: number;
    pending: number;
    completed: number;
  };
}

const STATUS_TABS: StatusFilter[] = ['All', 'Pending', 'Completed'];
const PRIORITY_OPTIONS: PriorityFilter[] = ['All', 'High', 'Medium', 'Low'];

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  counts,
}: TaskToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Search + Priority Select + Mobile/Tablet Status Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Status Filter */}
          <div
            role="group"
            aria-label="Filter by task status"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1"
          >
            {STATUS_TABS.map((tab) => {
              const active = statusFilter === tab;
              const tabCount =
                tab === 'All'
                  ? counts.total
                  : tab === 'Pending'
                    ? counts.pending
                    : counts.completed;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onStatusChange(tab)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab}</span>
                  <span className="font-mono text-[11px] tabular-nums text-slate-500">
                    {tabCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="priority-filter"
              className="text-xs font-medium text-slate-600 whitespace-nowrap"
            >
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) =>
                onPriorityChange(e.target.value as PriorityFilter)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Priorities' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compact Responsive Summary Strip (visible on tablet/mobile when sidebar is collapsed) */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white lg:hidden">
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">Total</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-slate-900 tabular-nums">
            {counts.total}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">Pending</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-amber-700 tabular-nums">
            {counts.pending}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-emerald-700 tabular-nums">
            {counts.completed}
          </p>
        </div>
      </div>
    </div>
  );
}
