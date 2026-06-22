'use client';

import { useState } from 'react';
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

function SortIcon({ active }: { active: boolean }) {
  return (
    <ArrowUpDown
      size={12}
      className={`ml-1 shrink-0 transition-opacity ${active ? 'opacity-100 text-indigo-500' : 'opacity-25'}`}
    />
  );
}

/** Fixed-size slot so every action lines up across rows, even when empty. */
function ActionSlot({ children }: { children?: React.ReactNode }) {
  return <div className="w-7 h-7 flex items-center justify-center">{children}</div>;
}

export default function SavedTable({ jobs, sortField, onSort, onEdit, onDelete, onMoveToApplications }: Props) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center"
      >
        <Bookmark size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No saved vacancies yet</p>
        <p className="text-slate-300 text-sm mt-1">Click &ldquo;Save Vacancy&rdquo; to start your wishlist</p>
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-sm table-fixed">
          <colgroup>
            <col className="w-12" />
            {/* Role Title */}
            <col />
            {/* Company */}
            <col />
            <col className="w-28" />
            <col className="w-44" />
            <col className="w-32" />
            {/* Notes */}
            <col />
            <col className="w-44" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="pl-5 pr-2 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                #
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('roleTitle')}
              >
                <span className="flex items-center">Role Title <SortIcon active={sortField === 'roleTitle'} /></span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('company')}
              >
                <span className="flex items-center">Company <SortIcon active={sortField === 'company'} /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Contract
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Link
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('deadline')}
              >
                <span className="flex items-center">Deadline <SortIcon active={sortField === 'deadline'} /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Notes
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pr-5">
                Actions
              </th>
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
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors overflow-hidden max-w-full"
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

                    {/* Actions — Apply button + fixed icon slots kept aligned across rows */}
                    <td className="px-4 py-3.5 pr-5">
                      <div className="flex items-center justify-end gap-1.5">
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

                        {/* Edit / cancel-delete */}
                        <ActionSlot>
                          {onDelete && pendingDeleteId === id ? (
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(null)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title="Cancel"
                            >
                              <X size={15} />
                            </button>
                          ) : onEdit ? (
                            <button
                              type="button"
                              onClick={() => onEdit(job)}
                              className="text-slate-400 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                          ) : null}
                        </ActionSlot>

                        {/* Delete / confirm-delete */}
                        <ActionSlot>
                          {onDelete && pendingDeleteId === id ? (
                            <button
                              type="button"
                              onClick={() => { onDelete(job.no); setPendingDeleteId(null); }}
                              className="text-red-500 hover:text-red-600 transition-colors"
                              title="Confirm delete"
                            >
                              <Check size={15} />
                            </button>
                          ) : onDelete ? (
                            <button
                              type="button"
                              onClick={() => setPendingDeleteId(id)}
                              className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : null}
                        </ActionSlot>
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
      </div>
    </motion.div>
  );
}
