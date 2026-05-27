'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown, ExternalLink,
  Pencil, Trash2, Check, X, Bookmark, CalendarDays, Send,
} from 'lucide-react';
import type { SavedJob } from '@/types';
import ContractBadge from './ContractBadge';

interface Props {
  jobs: SavedJob[];
  sortField: keyof SavedJob | null;
  sortDir: 'asc' | 'desc';
  onSort: (field: keyof SavedJob) => void;
  onEdit?: (job: SavedJob) => void;
  onDelete?: (no: string) => void;
  onMoveToApplications?: (job: SavedJob) => void;
}

const COLS = ['no', 'roleTitle', 'company', 'contract', 'jobLink', 'deadline', 'notes', 'actions'] as const;
type ColKey = typeof COLS[number];

const DEFAULT_WIDTHS: Record<ColKey, number> = {
  no: 52,
  roleTitle: 230,
  company: 170,
  contract: 120,
  jobLink: 160,
  deadline: 130,
  notes: 240,
  actions: 170,
};

function SortIcon({ active }: { active: boolean }) {
  return (
    <ArrowUpDown
      size={12}
      className={`ml-1 shrink-0 transition-opacity ${active ? 'opacity-100 text-indigo-500' : 'opacity-25'}`}
    />
  );
}

function ResizeHandle({ col, onStart }: { col: ColKey; onStart: (col: ColKey, e: React.MouseEvent) => void }) {
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize group/handle flex items-center justify-center z-10"
      onMouseDown={(e) => { e.stopPropagation(); onStart(col, e); }}
    >
      <div className="w-px h-4 bg-slate-200 group-hover/handle:bg-indigo-400 group-hover/handle:h-full transition-all" />
    </div>
  );
}

export default function SavedTable({ jobs, sortField, sortDir, onSort, onEdit, onDelete, onMoveToApplications }: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(DEFAULT_WIDTHS);
  const [isResizing, setIsResizing] = useState(false);
  const resizingCol = useRef<ColKey | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  function startResize(col: ColKey, e: React.MouseEvent) {
    e.preventDefault();
    resizingCol.current = col;
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = colWidths[col];
    setIsResizing(true);

    function onMouseMove(ev: MouseEvent) {
      if (!resizingCol.current) return;
      setColWidths((prev) => ({
        ...prev,
        [resizingCol.current!]: Math.max(60, resizeStartWidth.current + (ev.clientX - resizeStartX.current)),
      }));
    }
    function onMouseUp() {
      resizingCol.current = null;
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  const totalWidth = COLS.reduce((sum, col) => sum + colWidths[col], 0);

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center"
      >
        <Bookmark size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No saved vacancies yet</p>
        <p className="text-slate-300 text-sm mt-1">Click "Save Vacancy" to start your wishlist</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className={`overflow-x-auto ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
        <table className="text-sm" style={{ tableLayout: 'fixed', width: `${totalWidth}px` }}>
          <colgroup>
            {COLS.map((col) => (
              <col key={col} style={{ width: `${colWidths[col]}px` }} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="relative pl-5 pr-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                #<ResizeHandle col="no" onStart={startResize} />
              </th>
              <th
                className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('roleTitle')}
              >
                <span className="flex items-center">Role Title <SortIcon active={sortField === 'roleTitle'} /></span>
                <ResizeHandle col="roleTitle" onStart={startResize} />
              </th>
              <th
                className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('company')}
              >
                <span className="flex items-center">Company <SortIcon active={sortField === 'company'} /></span>
                <ResizeHandle col="company" onStart={startResize} />
              </th>
              <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Contract<ResizeHandle col="contract" onStart={startResize} />
              </th>
              <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Link<ResizeHandle col="jobLink" onStart={startResize} />
              </th>
              <th
                className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('deadline')}
              >
                <span className="flex items-center">Deadline <SortIcon active={sortField === 'deadline'} /></span>
                <ResizeHandle col="deadline" onStart={startResize} />
              </th>
              <th className="relative px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Notes<ResizeHandle col="notes" onStart={startResize} />
              </th>
              <th className="relative px-4 py-3">&nbsp;</th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="popLayout" initial={false}>
              {jobs.map((job, i) => {
                const id = `${job.no}-${job.company}-${job.roleTitle}`;

                return (
                  <motion.tr
                    key={id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.35) }}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="pl-5 pr-2 py-3.5 text-slate-400 text-xs tabular-nums">{job.no}</td>

                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="block font-semibold text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap" title={job.roleTitle}>
                        {job.roleTitle}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="block text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap" title={job.company}>
                        {job.company}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <ContractBadge contract={job.contract} />
                    </td>

                    <td className="px-4 py-3.5 overflow-hidden">
                      {job.jobLink ? (
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors overflow-hidden"
                          title={job.jobLink}
                        >
                          <ExternalLink size={11} className="shrink-0" />
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{job.jobLink.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {job.deadline ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-600 text-xs">
                          <CalendarDays size={12} className="text-slate-400 shrink-0" />
                          {job.deadline}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 overflow-hidden">
                      <span className="block text-slate-500 text-xs overflow-hidden text-ellipsis whitespace-nowrap" title={job.notes}>
                        {job.notes || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 pr-5">
                      <div className="flex items-center justify-end gap-2">
                        {onMoveToApplications && (
                          <button
                            type="button"
                            disabled={movingId === id}
                            onClick={async () => {
                              setMovingId(id);
                              try {
                                await onMoveToApplications(job);
                              } finally {
                                setMovingId(null);
                              }
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
                            title="Mark as applied — moves this to your Applications"
                          >
                            <Send size={11} strokeWidth={2.5} />
                            {movingId === id ? 'Moving…' : 'Apply'}
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(job)}
                            className="text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        {onDelete && pendingDeleteId === id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => { onDelete(job.no); setPendingDeleteId(null); }}
                              className="text-red-500 hover:text-red-600 transition-colors"
                              title="Confirm delete"
                            >
                              <Check size={13} />
                            </button>
                          </>
                        ) : onDelete ? (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(id)}
                            className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {jobs.length} saved vacanc{jobs.length !== 1 ? 'ies' : 'y'}
        </p>
        <p className="text-xs text-slate-300 hidden sm:block">Drag column edges to resize</p>
      </div>
    </motion.div>
  );
}
