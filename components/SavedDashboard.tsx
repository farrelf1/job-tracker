'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Search, X } from 'lucide-react';
import type { JobApplication, SavedJob } from '@/types';
import Header from './Header';
import SavedTable from './SavedTable';
import SavedEntryModal from './SavedEntryModal';

interface SavedDashboardProps {
  jobs: SavedJob[];
  isDemo: boolean;
  spreadsheetUrl?: string;
}

const CONTRACT_OPTIONS = ['Full Time', 'Intern', 'Contract', 'MT'] as const;

export default function SavedDashboard({ jobs: serverJobs, isDemo, spreadsheetUrl }: SavedDashboardProps) {
  const [liveJobs, setLiveJobs] = useState<SavedJob[]>(serverJobs);
  const [localAdditions, setLocalAdditions] = useState<SavedJob[]>([]);
  const [localEdits, setLocalEdits] = useState<Record<string, SavedJob>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [search, setSearch] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [sortField, setSortField] = useState<keyof SavedJob | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Poll every 30s
  useEffect(() => {
    if (isDemo) return;
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/saved');
        if (res.ok) {
          const { jobs } = await res.json();
          setLiveJobs(jobs);
        }
      } catch { /* noop */ }
    };
    fetchLive();
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
  }, [isDemo]);

  const allJobs = useMemo(() => {
    const liveNos = new Set(liveJobs.map((j) => j.no));
    const dedupedAdditions = localAdditions.filter((j) => !liveNos.has(j.no));
    return [...liveJobs, ...dedupedAdditions].map((j) => localEdits[j.no] ?? j);
  }, [liveJobs, localAdditions, localEdits]);

  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.roleTitle.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.notes.toLowerCase().includes(q)
      );
    }

    if (contractFilter) {
      result = result.filter((j) => j.contract.toLowerCase() === contractFilter.toLowerCase());
    }

    if (sortField) {
      result.sort((a, b) => {
        const av = (a[sortField] ?? '').toString();
        const bv = (b[sortField] ?? '').toString();
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [allJobs, search, contractFilter, sortField, sortDir]);

  function handleSort(field: keyof SavedJob) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function handleAddJob(job: SavedJob) {
    setLocalAdditions((prev) => [...prev, job]);
  }

  function handleSaveEdit(updated: SavedJob) {
    setLocalEdits((prev) => ({ ...prev, [updated.no]: updated }));
    setEditingJob(null);
  }

  async function handleMoveToApplications(job: SavedJob) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(2);
    const applicationDate = `${dd}/${mm}/${yy}`;

    if (isDemo) {
      const merged = [...liveJobs, ...localAdditions]
        .filter((j) => j.no !== job.no)
        .map((j, i) => ({ ...(localEdits[j.no] ?? j), no: String(i + 1) }));
      setLiveJobs(merged);
      setLocalAdditions([]);
      setLocalEdits({});
      return;
    }

    let nextNo = '1';
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const { jobs } = (await res.json()) as { jobs: JobApplication[] };
        nextNo = String(jobs.length + 1);
      }
    } catch { /* noop */ }

    const newApplication: JobApplication = {
      no: nextNo,
      company: job.company,
      roleTitle: job.roleTitle,
      contract: job.contract,
      jobLink: job.jobLink,
      applicationDate,
      response: '',
      interviewStage: '',
      interviewDetails: '',
      offer: '',
      notes: job.notes,
    };

    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication),
      });
      await fetch(`/api/saved?no=${encodeURIComponent(job.no)}`, { method: 'DELETE' });
    } catch { /* noop */ }

    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const { jobs } = await res.json();
        setLiveJobs(jobs);
        setLocalAdditions([]);
        setLocalEdits({});
      }
    } catch { /* noop */ }
  }

  async function handleDeleteJob(no: string) {
    if (isDemo) {
      const merged = [...liveJobs, ...localAdditions]
        .filter((j) => j.no !== no)
        .map((j, i) => ({ ...(localEdits[j.no] ?? j), no: String(i + 1) }));
      setLiveJobs(merged);
      setLocalAdditions([]);
      setLocalEdits({});
      return;
    }
    try {
      await fetch(`/api/saved?no=${encodeURIComponent(no)}`, { method: 'DELETE' });
    } catch { /* noop */ }
    try {
      const res = await fetch('/api/saved');
      if (res.ok) {
        const { jobs } = await res.json();
        setLiveJobs(jobs);
        setLocalAdditions([]);
        setLocalEdits({});
      }
    } catch { /* noop */ }
  }

  const hasFilters = !!(search || contractFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isDemo={isDemo} totalCount={allJobs.length} spreadsheetUrl={spreadsheetUrl} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-7 flex items-start justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Saved Vacancies</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isDemo
                ? 'Showing demo data — connect your Google Sheet to see your saved jobs'
                : 'Your job wishlist, synced from Google Sheet'}
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-95"
          >
            <Bookmark size={14} strokeWidth={2.5} />
            Save Vacancy
          </button>
        </div>

        {/* Demo banner */}
        {isDemo && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-base">⚡</span>
            <span>
              <strong>Demo Mode</strong> — Sample data shown. Configure Google Sheets credentials and create a{' '}
              <strong>Saved Vacancy</strong> sheet to use this page.
            </span>
          </div>
        )}

        {/* Filter bar */}
        <div className="mb-5 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search role, company, notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm"
            />
          </div>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all shadow-sm cursor-pointer"
          >
            <option value="">All Types</option>
            {CONTRACT_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setContractFilter(''); }}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <SavedTable
          jobs={filteredJobs}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={setEditingJob}
          onDelete={handleDeleteJob}
          onMoveToApplications={handleMoveToApplications}
        />
      </main>

      {/* Add / Edit modal */}
      <SavedEntryModal
        isOpen={modalOpen || editingJob !== null}
        onClose={() => { setModalOpen(false); setEditingJob(null); }}
        onAdd={handleAddJob}
        nextNo={allJobs.length + 1}
        editJob={editingJob ?? undefined}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
