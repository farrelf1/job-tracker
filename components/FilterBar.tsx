'use client';

import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { JobApplication } from '@/types';

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  contractFilter: string;
  onContractFilter: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  jobs: JobApplication[];
}

export default function FilterBar({
  search,
  onSearch,
  contractFilter,
  onContractFilter,
  statusFilter,
  onStatusFilter,
  jobs,
}: FilterBarProps) {
  const contractTypes = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.contract).filter(Boolean))).sort(),
    [jobs]
  );

  const statuses = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.response).filter(Boolean))).sort(),
    [jobs]
  );

  const hasFilters = !!search || !!contractFilter || !!statusFilter;

  function clearAll() {
    onSearch('');
    onContractFilter('');
    onStatusFilter('');
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6 animate-fade-in stagger-3">
      {/* Search */}
      <div className="flex-1 min-w-60 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search company or role…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
        />
      </div>

      {/* Contract type */}
      <select
        value={contractFilter}
        onChange={(e) => onContractFilter(e.target.value)}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer"
      >
        <option value="">All Types</option>
        {contractTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* Response status */}
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilter(e.target.value)}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors hover:border-slate-300"
        >
          <X size={13} />
          Clear
        </button>
      )}
    </div>
  );
}
