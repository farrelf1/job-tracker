interface ContractBadgeProps {
  contract: string;
}

function getClasses(contract: string): string {
  const c = contract?.toLowerCase().trim() ?? '';

  if (c.includes('full')) return 'bg-indigo-100 text-indigo-700';
  if (c.includes('intern')) return 'bg-violet-100 text-violet-700';
  if (c === 'mt') return 'bg-amber-100 text-amber-700';
  if (c.includes('contract')) return 'bg-cyan-100 text-cyan-700';
  if (c.includes('part')) return 'bg-sky-100 text-sky-700';
  if (c.includes('freelance')) return 'bg-teal-100 text-teal-700';
  return 'bg-slate-100 text-slate-600';
}

export default function ContractBadge({ contract }: ContractBadgeProps) {
  if (!contract) return null;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${getClasses(contract)}`}
    >
      {contract}
    </span>
  );
}
