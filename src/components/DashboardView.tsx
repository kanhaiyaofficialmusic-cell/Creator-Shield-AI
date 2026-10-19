import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  Terminal, 
  ExternalLink, 
  CheckCircle2, 
  TrendingUp, 
  Lock, 
  Cpu, 
  Flame, 
  ArrowRight,
  Database
} from 'lucide-react';
import { DashboardStats } from '../services/api.js';
import { SAMPLE_PITCHES, SamplePitch } from '../data/samplePitches.js';

interface DashboardViewProps {
  stats: DashboardStats | null;
  onNavigateToAnalyze: (sample?: SamplePitch) => void;
  onNavigateToReports: (brandFilter?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  stats, 
  onNavigateToAnalyze, 
  onNavigateToReports 
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Cyber Header */}
      <div className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/90 to-[#0c121e] p-6 sm:p-8 overflow-hidden cyber-grid">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-xs font-mono text-sky-400 mb-4">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            DEFENSE DIRECTIVE: INFLUENCER & CREATOR PROTECTION
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Stop Fake Sponsorships & Infostealer Trojans Before They Hijack Your Channel.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
            Attackers impersonate top gaming, VPN, and audio brands using password-locked archives, 
            fake NDAs, and lookalike domains to steal YouTube session tokens and credentials.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToAnalyze()}
              className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>Check Sponsorship Now</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              onClick={() => onNavigateToReports()}
              className="px-5 py-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-slate-400" />
              <span>Browse Known Campaigns</span>
            </button>
          </div>
        </div>

        {/* Live status banner */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Safe static parsing: links are never fetched automatically</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Zero credentials requested: no Google passwords or OTPs</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Gemini 3.8 Flash behavioral heuristics engine</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1422] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Threat Reports</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mb-1">
            {stats ? stats.totalScamsLogged.toLocaleString() : '1,240+'}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Creator-targeted campaign telemetry</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1422] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">High-Risk Intercepts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mb-1">
            {stats ? stats.highRiskIntercepts.toLocaleString() : '894'}
          </div>
          <div className="text-xs text-slate-500">
            <span>72.1% Lumma & RedLine stealer payloads</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1422] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Top Targeted Niche</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mb-1">
            Gaming & Tech
          </div>
          <div className="text-xs text-slate-500">
            <span>High YouTube OAuth token target value</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1422] shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold">Primary Attack Vector</span>
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white mb-1 truncate">
            Passworded ZIP Archives
          </div>
          <div className="text-xs text-slate-500">
            <span>Pass: &quot;2026&quot; to bypass mail filters</span>
          </div>
        </div>
      </div>

      {/* Quick Interactive Testing Sandbox (1-Click Sample Testing) */}
      <div className="rounded-xl border border-slate-800 bg-[#0d1320] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <span>Interactive Threat Testing Lab</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any real-world phishing sample or a legitimate pitch to run an instant demonstration through the detection pipeline:
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
            DEMO INTEL READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_PITCHES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onNavigateToAnalyze(sample)}
              className="group p-4 rounded-lg border border-slate-800 hover:border-sky-500/60 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className={sample.type === 'LEGITIMATE' ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {sample.type === 'LEGITIMATE' ? 'VERIFIED LEGIT' : 'MALICIOUS LURE'}
                  </span>
                  <span className="text-slate-500">{sample.brand}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-2 mb-2">
                  {sample.label}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {sample.threatSummary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-sky-400 font-medium">
                <span>Analyze this sample</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Top Impersonated Brands & Creator Defense Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Impersonated Brands */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0e1422] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Top Impersonated Creator Sponsors</span>
            </h2>
            <button
              onClick={() => onNavigateToReports()}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>View all</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Attackers spoof reputable brands offering high compensation to lower creators&apos; suspicion.
          </p>

          <div className="space-y-3">
            {(stats?.topImpersonatedBrands || [
              { brand: 'NordVPN', count: 142, risk: 'CRITICAL' },
              { brand: 'Razer', count: 98, risk: 'CRITICAL' },
              { brand: 'Corsair', count: 115, risk: 'CRITICAL' },
              { brand: 'Apex Legends / EA', count: 73, risk: 'HIGH' },
              { brand: 'Epidemic Sound', count: 64, risk: 'HIGH' }
            ]).map((item) => (
              <div 
                key={item.brand} 
                onClick={() => onNavigateToReports(item.brand)}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-xs text-sky-400 font-mono">
                    {item.brand.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{item.brand}</div>
                    <div className="text-xs text-slate-500">
                      {item.count} incident reports cataloged
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    item.risk === 'CRITICAL' 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/40' 
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                  }`}>
                    {item.risk}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creator Cybersecurity Checklist & Guidelines */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0e1422] p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Creator Security Golden Rules</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Defend your channel against modern session hijacking and token theft:
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-800/90 bg-slate-900/60">
                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Never open password-protected archives
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Legitimate marketing agencies never send password-locked ZIP, RAR, or 7z files. 
                  Attackers use passwords (e.g. &quot;2026&quot;) solely to blind mail gateway antivirus engines.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-800/90 bg-slate-900/60">
                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Inspect sender domain suffix carefully
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Check the domain after the @ sign. Brands never use gmail.com, outlook.com, 
                  or hyphenated lookalikes (e.g., <code className="text-amber-300 font-mono">nord-collab-partners.com</code> vs <code className="text-emerald-400 font-mono">nordvpn.com</code>).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-800/90 bg-slate-900/60">
                <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  Understand session token theft
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Infostealers do not prompt for your password. Once executed, they read browser cookies 
                  to replicate your active YouTube and Twitch sessions instantly, bypassing 2FA.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateToAnalyze()}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-sky-400 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Scan an Incoming Email Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
