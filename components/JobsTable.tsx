'use client';

import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown, ChevronUp, ExternalLink, FileText,
  CalendarDays, Pencil, Trash2, Check, X,
} from 'lucide-react';
import type { JobApplication } from '@/types';
import StatusBadge from './StatusBadge';
import ContractBadge from './ContractBadge';

interface Props {
  jobs: JobApplication[];
  sortField: keyof JobApplication | null;
  sortDir: 'asc' | 'desc';
  onSort: (field: keyof JobApplication) => void;
  onEdit?: (job: JobApplication) => void;
  onDelete?: (no: string) => void;
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

export default function JobsTable({ jobs, sortField, onSort, onEdit, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function rowId(job: JobApplication) {
    return `${job.no}-${job.company}-${job.roleTitle}`;
  }

  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center"
      >
        <FileText size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No applications match your filters</p>
        <p className="text-slate-300 text-sm mt-1">Try adjusting your search or clearing filters</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] text-sm table-fixed">
          <colgroup>
            <col className="w-12" />
            {/* Role */}
            <col />
            {/* Company */}
            <col />
            <col className="w-28" />
            <col className="w-28" />
            <col className="w-32" />
            <col className="w-36" />
            <col className="w-28" />
            <col className="w-[132px]" />
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
                <span className="flex items-center">Role <SortIcon active={sortField === 'roleTitle'} /></span>
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('company')}
              >
                <span className="flex items-center">Company <SortIcon active={sortField === 'company'} /></span>
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Type
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('applicationDate')}
              >
                <span className="flex items-center">Applied <SortIcon active={sortField === 'applicationDate'} /></span>
              </th>

              <th
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-800 transition-colors"
                onClick={() => onSort('response')}
              >
                <span className="flex items-center">Response <SortIcon active={sortField === 'response'} /></span>
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Interview Stage
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Offer
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide pr-5">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="popLayout" initial={false}>
              {jobs.map((job, i) => {
                const id = rowId(job);
                const isExpanded = expandedId === id;
                const hasDetail = !!(job.interviewDetails?.trim() || job.notes?.trim());

                return (
                  <Fragment key={id}>
                    <motion.tr
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.035, 0.4) }}
                      onClick={() => hasDetail && setExpandedId(isExpanded ? null : id)}
                      className={`border-b border-slate-50 transition-colors group
                        ${hasDetail ? 'cursor-pointer' : ''}
                        ${isExpanded ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'}`}
                    >
                      <td className="pl-5 pr-2 py-3.5 text-slate-400 text-xs tabular-nums">{job.no}</td>

                      <td className="px-4 py-3.5 text-slate-700 overflow-hidden">
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap" title={job.roleTitle}>
                          {job.roleTitle}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 overflow-hidden">
                        <span className="block font-semibold text-slate-900 overflow-hidden text-ellipsis whitespace-nowrap" title={job.company}>
                          {job.company}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <ContractBadge contract={job.contract} />
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <CalendarDays size={12} className="text-slate-400 shrink-0" />
                          {job.applicationDate || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge status={job.response} />
                      </td>

                      <td className="px-4 py-3.5">
                        {job.interviewStage ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-violet-50 text-violet-700 whitespace-nowrap">
                            {job.interviewStage}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {job.offer ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                            job.offer.toLowerCase() === 'rejection'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {job.offer}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions — fixed slots keep every icon aligned across rows */}
                      <td className="px-4 py-3.5 pr-5">
                        <div className="flex items-center justify-end gap-0.5">
                          {/* Open link */}
                          <ActionSlot>
                            {job.jobLink && (
                              <a
                                href={job.jobLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-500 transition-colors"
                                title="View job posting"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </ActionSlot>

                          {/* Notes / details */}
                          <ActionSlot>
                            {hasDetail && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : id); }}
                                className={`transition-colors ${isExpanded ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'}`}
                                title={isExpanded ? 'Hide details' : 'View details & notes'}
                              >
                                {isExpanded ? <ChevronUp size={15} /> : <FileText size={14} />}
                              </button>
                            )}
                          </ActionSlot>

                          {/* Edit / cancel-delete */}
                          <ActionSlot>
                            {onDelete && pendingDeleteId === id ? (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(null); }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                                title="Cancel"
                              >
                                <X size={15} />
                              </button>
                            ) : onEdit ? (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onEdit(job); }}
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
                                onClick={(e) => { e.stopPropagation(); onDelete(job.no); setPendingDeleteId(null); }}
                                className="text-red-500 hover:text-red-600 transition-colors"
                                title="Confirm delete"
                              >
                                <Check size={15} />
                              </button>
                            ) : onDelete ? (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPendingDeleteId(id); }}
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

                    {/* Expanded detail row */}
                    <AnimatePresence>
                      {isExpanded && hasDetail && (
                        <motion.tr
                          key={`${id}-detail`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <td colSpan={9} className="bg-indigo-50/20 border-b border-indigo-100/60 px-8 py-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              {job.interviewDetails && (
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Interview Details
                                  </p>
                                  <p className="text-sm text-slate-700 leading-relaxed">{job.interviewDetails}</p>
                                </div>
                              )}
                              {job.notes && (
                                <div>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                    Notes
                                  </p>
                                  <p className="text-sm text-slate-600 leading-relaxed">{job.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {jobs.length} application{jobs.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-slate-300 hidden sm:block">Click a row to expand details</p>
      </div>
    </motion.div>
  );
}
