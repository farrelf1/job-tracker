'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bookmark, Pencil } from 'lucide-react';
import type { SavedJob } from '@/types';

const CONTRACT_OPTIONS = ['Full Time', 'Intern', 'Contract', 'MT'] as const;

interface SavedEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: SavedJob) => void;
  nextNo: number;
  editJob?: SavedJob;
  onSave?: (job: SavedJob) => void;
}

interface FormState {
  roleTitle: string;
  company: string;
  contract: string;
  jobLink: string;
  notes: string;
}

const EMPTY: FormState = {
  roleTitle: '',
  company: '',
  contract: 'Full Time',
  jobLink: '',
  notes: '',
};

const inputCls =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all';
const selectCls =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer appearance-none';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function SavedEntryModal({ isOpen, onClose, onAdd, nextNo, editJob, onSave }: SavedEntryModalProps) {
  const isEditMode = !!editJob;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && editJob) {
      setForm({
        roleTitle: editJob.roleTitle,
        company: editJob.company,
        contract: editJob.contract || 'Full Time',
        jobLink: editJob.jobLink,
        notes: editJob.notes,
      });
    } else if (isOpen) {
      setForm(EMPTY);
    }
  }, [isOpen, editJob]);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.roleTitle.trim() || !form.company.trim()) return;

    setLoading(true);

    const job: SavedJob = {
      no: isEditMode ? editJob!.no : String(nextNo),
      roleTitle: form.roleTitle.trim(),
      company: form.company.trim(),
      contract: form.contract,
      jobLink: form.jobLink.trim(),
      notes: form.notes.trim(),
    };

    try {
      await fetch('/api/saved', {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
    } catch {
      // noop — local state still updated
    }

    if (isEditMode) {
      onSave?.(job);
    } else {
      onAdd(job);
    }
    setLoading(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-30"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  {isEditMode
                    ? <Pencil size={12} className="text-white" strokeWidth={2.5} />
                    : <Bookmark size={12} className="text-white" strokeWidth={2.5} />
                  }
                </div>
                <h2 className="font-semibold text-slate-900">
                  {isEditMode ? 'Edit Vacancy' : 'Save Vacancy'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <Field label="Role Title" required>
                  <input
                    type="text"
                    value={form.roleTitle}
                    onChange={(e) => set('roleTitle', e.target.value)}
                    placeholder="e.g. Software Engineer"
                    required
                    autoFocus
                    className={inputCls}
                  />
                </Field>

                <Field label="Company" required>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => set('company', e.target.value)}
                    placeholder="e.g. Stripe"
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Contract">
                  <select
                    value={form.contract}
                    onChange={(e) => set('contract', e.target.value)}
                    className={selectCls}
                  >
                    {CONTRACT_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Link to Job Advert">
                  <input
                    type="text"
                    value={form.jobLink}
                    onChange={(e) => set('jobLink', e.target.value)}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </Field>

                <Field label="Additional Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Deadlines, requirements, why you're interested…"
                    rows={4}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.roleTitle.trim() || !form.company.trim()}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Saving…' : isEditMode ? 'Save Changes' : 'Save Vacancy'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
