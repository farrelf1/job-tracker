'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import type { JobApplication } from '@/types';

const CONTRACT_OPTIONS = ['Full Time', 'Intern', 'Contract'] as const;
const RESPONSE_OPTIONS = ['', 'Passed Screening', 'Interview'] as const;
const INTERVIEW_STAGE_OPTIONS = ['', 'HR Interview', 'User Interview', 'Next Step'] as const;
const OFFER_OPTIONS = ['', 'Offering', 'Accepted', 'Rejection'] as const;

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (job: JobApplication) => void;
  nextNo: number;
}

interface FormState {
  company: string;
  roleTitle: string;
  contract: string;
  jobLink: string;
  applicationDate: string; // native input: yyyy-mm-dd
  response: string;
  interviewStage: string;
  interviewDetails: string;
  offer: string;
  notes: string;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toSheetDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

const EMPTY: FormState = {
  company: '',
  roleTitle: '',
  contract: 'Full Time',
  jobLink: '',
  applicationDate: todayISO(),
  response: '',
  interviewStage: '',
  interviewDetails: '',
  offer: '',
  notes: '',
};

const inputCls =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all';
const selectCls =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all cursor-pointer appearance-none';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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

export default function AddEntryModal({ isOpen, onClose, onAdd, nextNo }: AddEntryModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);

  function set(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    setForm(EMPTY);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.roleTitle.trim()) return;

    setLoading(true);

    const job: JobApplication = {
      no: String(nextNo),
      company: form.company.trim(),
      roleTitle: form.roleTitle.trim(),
      contract: form.contract,
      jobLink: form.jobLink.trim(),
      applicationDate: toSheetDate(form.applicationDate),
      response: form.response,
      interviewStage: form.interviewStage,
      interviewDetails: form.interviewDetails.trim(),
      offer: form.offer,
      notes: form.notes.trim(),
    };

    // Attempt to persist to Google Sheets (silently fails in demo mode)
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
    } catch {
      // noop — entry still added to local state
    }

    onAdd(job);
    setForm(EMPTY);
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
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Plus size={13} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="font-semibold text-slate-900">Add Application</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form — flex-col so footer sticks at bottom */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable fields */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <Field label="Company" required>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => set('company', e.target.value)}
                    placeholder="e.g. Stripe"
                    required
                    autoFocus
                    className={inputCls}
                  />
                </Field>

                <Field label="Role Title" required>
                  <input
                    type="text"
                    value={form.roleTitle}
                    onChange={(e) => set('roleTitle', e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    required
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
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

                  <Field label="Date Applied">
                    <input
                      type="date"
                      value={form.applicationDate}
                      onChange={(e) => set('applicationDate', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Link to Job Advert">
                  <input
                    type="text"
                    value={form.jobLink}
                    onChange={(e) => set('jobLink', e.target.value)}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Response">
                    <select
                      value={form.response}
                      onChange={(e) => set('response', e.target.value)}
                      className={selectCls}
                    >
                      {RESPONSE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o || '— None —'}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Interview Stage">
                    <select
                      value={form.interviewStage}
                      onChange={(e) => set('interviewStage', e.target.value)}
                      className={selectCls}
                    >
                      {INTERVIEW_STAGE_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o || '— None —'}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Interview Details">
                  <input
                    type="text"
                    value={form.interviewDetails}
                    onChange={(e) => set('interviewDetails', e.target.value)}
                    placeholder="Date, time & interviewer name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Offer">
                  <select
                    value={form.offer}
                    onChange={(e) => set('offer', e.target.value)}
                    className={selectCls}
                  >
                    {OFFER_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o || '— None —'}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Any additional notes…"
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !form.company.trim() || !form.roleTitle.trim()}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Saving…' : 'Add Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
