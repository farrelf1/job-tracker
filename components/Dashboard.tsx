'use client';

import { useMemo, useState } from 'react';
import type { JobApplication } from '@/types';
import Header from './Header';
import StatsGrid from './StatsGrid';
import FilterBar from './FilterBar';
import JobsTable from './JobsTable';

interface DashboardProps {
  jobs: JobApplication[];
  isDemo: boolean;
}

export default function Dashboard({ jobs, isDemo }: DashboardProps) {
  const [search, setSearch] = useState('');
  const [contractFilter, setContractFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<keyof JobApplication | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.company.toLowerCase().includes(q) ||
          j.roleTitle.toLowerCase().includes(q) ||
          j.notes.toLowerCase().includes(q)
      );
    }

    if (contractFilter) {
      result = result.filter((j) =>
        j.contract.toLowerCase() === contractFilter.toLowerCase()
      );
    }

    if (statusFilter) {
      result = result.filter((j) => j.response === statusFilter);
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
  }, [jobs, search, contractFilter, statusFilter, sortField, sortDir]);

  function handleSort(field: keyof JobApplication) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header isDemo={isDemo} totalJobs={jobs.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading */}
        <div className="mb-7 animate-fade-in-up">
          <h1 className="text-2xl font-bold text-slate-900">Job Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isDemo ? 'Showing demo data — connect your Google Sheet to see your applications' : 'Synced from your Google Sheet'}
          </p>
        </div>

        {/* Demo banner */}
        {isDemo && (
          <div className="mb-6 animate-fade-in stagger-1 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-base">⚡</span>
            <span>
              <strong>Demo Mode</strong> — This is sample data. Connect your Google Sheet to track real applications.{' '}
              <a href="#setup" className="underline underline-offset-2 hover:text-amber-900 transition-colors">
                View setup guide ↓
              </a>
            </span>
          </div>
        )}

        {/* Stats */}
        <StatsGrid jobs={jobs} />

        {/* Filters */}
        <FilterBar
          search={search}
          onSearch={setSearch}
          contractFilter={contractFilter}
          onContractFilter={setContractFilter}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          jobs={jobs}
        />

        {/* Table */}
        <JobsTable
          jobs={filteredJobs}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
        />

        {/* Setup guide */}
        {isDemo && (
          <div id="setup" className="mt-16 animate-fade-in-up stagger-4 rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <h2 className="text-base font-semibold text-slate-900">Google Sheets Setup</h2>
              <p className="text-sm text-slate-500 mt-0.5">Connect your spreadsheet in 4 steps</p>
            </div>
            <div className="px-6 py-5">
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Create a Google Cloud project and enable the <strong>Google Sheets API</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Create a <strong>Service Account</strong> and download the JSON key file.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Share your Google Sheet with the service account email (Viewer access).</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  <span>Add these environment variables in Vercel (Settings → Environment Variables):</span>
                </li>
              </ol>

              <pre className="mt-4 bg-slate-950 text-emerald-400 rounded-xl p-4 text-xs overflow-x-auto font-mono leading-relaxed">
{`GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEETS_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`}
              </pre>

              <p className="mt-3 text-xs text-slate-400">
                The spreadsheet ID is the long string in your Google Sheet URL between <code className="bg-slate-100 px-1 py-0.5 rounded">/d/</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">/edit</code>.
              </p>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Expected spreadsheet columns (row 1 = headers, data starts row 2):</p>
                <p className="text-xs text-blue-600 font-mono">
                  A: No &nbsp;|&nbsp; B: Company &nbsp;|&nbsp; C: Role Title &nbsp;|&nbsp; D: Contract &nbsp;|&nbsp; E: Link &nbsp;|&nbsp; F: Application Date &nbsp;|&nbsp; G: Response &nbsp;|&nbsp; H: Interview Stage &nbsp;|&nbsp; I: Interview Details &nbsp;|&nbsp; J: Offer &nbsp;|&nbsp; K: Notes
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
