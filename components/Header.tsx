'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase } from 'lucide-react';

interface HeaderProps {
  isDemo: boolean;
  totalCount: number;
}

export default function Header({ isDemo, totalCount }: HeaderProps) {
  const pathname = usePathname();
  const isSaved = pathname === '/saved';

  const countLabel = isSaved
    ? `${totalCount} saved vacanc${totalCount !== 1 ? 'ies' : 'y'}`
    : `${totalCount} application${totalCount !== 1 ? 's' : ''}`;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Briefcase size={15} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[17px] tracking-tight text-slate-900">
                Job<span className="text-indigo-600">Tracker</span>
              </span>
            </div>

            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  !isSaved
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Applications
              </Link>
              <Link
                href="/saved"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isSaved
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Saved
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:block">{countLabel}</span>

            {isDemo ? (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                Demo Mode
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
