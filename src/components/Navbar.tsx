import React from 'react';
import { ShieldAlert, ShieldCheck, Terminal, FileText, BarChart3, Search, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'analyze' | 'results' | 'reports' | 'incident';
  onNavigate: (tab: 'dashboard' | 'analyze' | 'results' | 'reports' | 'incident') => void;
  hasActiveResult: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onNavigate, hasActiveResult }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      {/* Top security advisory banner */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              PASSIVE RADAR ACTIVE
            </span>
            <span className="text-slate-600">|</span>
            <span>Static inspection engine: URLs are never visited automatically</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Never enter passwords, 2FA codes, or session cookies</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 via-sky-500/20 to-emerald-500/10 border border-indigo-500/30 flex items-center justify-center text-sky-400 shadow-inner">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">CreatorShield</span>
              <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/50">AI SEC</span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Sponsorship Phishing & Infostealer Defense</p>
          </div>
        </div>

        {/* Tab links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('analyze')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'analyze'
                ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Analyze Pitch</span>
          </button>

          {hasActiveResult && (
            <button
              onClick={() => onNavigate('results')}
              className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Latest Result</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('reports')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Threat Database</span>
            <span className="sm:hidden">Reports</span>
          </button>

          <button
            onClick={() => onNavigate('incident')}
            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'incident'
                ? 'bg-slate-800 text-sky-400 border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Incident Dossier</span>
            <span className="sm:hidden">Dossier</span>
          </button>
        </nav>

        {/* Quick action button */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => onNavigate('analyze')}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all shadow-sm flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check Sponsorship</span>
          </button>
        </div>
      </div>
    </header>
  );
};
