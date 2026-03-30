interface StatusBadgeProps {
  status: string;
}

type BadgeConfig = { label: string; classes: string };

function getConfig(status: string): BadgeConfig {
  const s = status?.toLowerCase().trim() ?? '';

  if (!s || s === 'no response' || s === 'pending' || s === 'n/a') {
    return { label: s ? status : 'Pending', classes: 'bg-slate-100 text-slate-500' };
  }
  if (s.includes('offer') || s === 'accepted') {
    return { label: status, classes: 'bg-emerald-100 text-emerald-700' };
  }
  if (s.includes('reject') || s === 'unsuccessful' || s === 'declined') {
    return { label: status, classes: 'bg-red-100 text-red-600' };
  }
  if (
    s.includes('interview') ||
    s.includes('1st') || s.includes('2nd') || s.includes('3rd') ||
    s.includes('first') || s.includes('second') || s.includes('final')
  ) {
    return { label: status, classes: 'bg-violet-100 text-violet-700' };
  }
  if (s.includes('phone') || s.includes('screen') || s.includes('initial call')) {
    return { label: status, classes: 'bg-sky-100 text-sky-700' };
  }
  if (
    s.includes('technical') || s.includes('test') ||
    s.includes('assessment') || s.includes('task') || s.includes('hackerrank')
  ) {
    return { label: status, classes: 'bg-amber-100 text-amber-700' };
  }
  if (s.includes('review') || s.includes('reviewing') || s.includes('progress')) {
    return { label: status, classes: 'bg-blue-100 text-blue-700' };
  }
  if (s.includes('withdraw')) {
    return { label: status, classes: 'bg-slate-100 text-slate-500' };
  }

  return { label: status, classes: 'bg-slate-100 text-slate-600' };
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, classes } = getConfig(status);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${classes}`}>
      {label}
    </span>
  );
}
