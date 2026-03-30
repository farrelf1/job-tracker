'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, MessageSquare, Trophy } from 'lucide-react';
import type { JobApplication } from '@/types';

function useCounter(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

interface StatCardProps {
  label: string;
  value: number;
  accentClass: string;
  iconBgClass: string;
  iconColorClass: string;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ label, value, accentClass, iconBgClass, iconColorClass, icon, delay = 0 }: StatCardProps) {
  const count = useCounter(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${accentClass}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-4xl font-bold text-slate-900 mt-1 tabular-nums">{count}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsGrid({ jobs }: { jobs: JobApplication[] }) {
  const total = jobs.length;

  const pending = jobs.filter((j) => {
    const r = j.response?.toLowerCase().trim() ?? '';
    return !r || r === 'pending' || r === 'no response' || r === 'n/a';
  }).length;

  const interviewing = jobs.filter((j) => {
    const r = j.response?.toLowerCase() ?? '';
    return (
      r.includes('interview') ||
      r.includes('phone') ||
      r.includes('screen') ||
      r.includes('technical') ||
      r.includes('test') ||
      r.includes('assessment') ||
      r.includes('task') ||
      r.includes('review') ||
      !!j.interviewStage?.trim()
    );
  }).length;

  const offers = jobs.filter((j) => {
    return j.offer?.trim() || j.response?.toLowerCase().includes('offer');
  }).length;

  const stats: StatCardProps[] = [
    {
      label: 'Total Applied',
      value: total,
      accentClass: 'bg-indigo-500',
      iconBgClass: 'bg-indigo-50',
      iconColorClass: 'text-indigo-600',
      icon: <Briefcase size={18} strokeWidth={2} />,
      delay: 0,
    },
    {
      label: 'Awaiting Response',
      value: pending,
      accentClass: 'bg-amber-400',
      iconBgClass: 'bg-amber-50',
      iconColorClass: 'text-amber-600',
      icon: <Clock size={18} strokeWidth={2} />,
      delay: 0.07,
    },
    {
      label: 'In Progress',
      value: interviewing,
      accentClass: 'bg-violet-500',
      iconBgClass: 'bg-violet-50',
      iconColorClass: 'text-violet-600',
      icon: <MessageSquare size={18} strokeWidth={2} />,
      delay: 0.14,
    },
    {
      label: 'Offers Received',
      value: offers,
      accentClass: 'bg-emerald-500',
      iconBgClass: 'bg-emerald-50',
      iconColorClass: 'text-emerald-600',
      icon: <Trophy size={18} strokeWidth={2} />,
      delay: 0.21,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
