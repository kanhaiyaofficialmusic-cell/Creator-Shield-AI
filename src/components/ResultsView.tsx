import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  FileText, 
  Search, 
  Globe, 
  Cpu, 
  Database,
  Lock,
  ListChecks,
  Info,
  ShieldX,
  AlertCircle
} from 'lucide-react';
import { AnalysisResponse, RiskLevel } from '../types/index.js';

interface ResultsViewProps {
  result: AnalysisResponse;
  onNavigateToAnalyze: () => void;
  onNavigateToReports: (campaignId?: string) => void;
  onNavigateToIncident: (result: AnalysisResponse) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ 
  result, 
  onNavigateToAnalyze, 
  onNavigateToReports, 
  onNavigateToIncident 
}) => {
  const [copied, setCopied] = useState(false);

  const normalizedLevel = (result.riskLevel || 'unknown').toLowerCase() as RiskLevel;

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return {
          bg: 'bg-rose-950/80 border-rose-700/60 text-rose-300',
          indicator: 'bg-rose-500 animate-pulse',
          label: 'HIGH RISK'
        };
      case 'medium':
        return {
          bg: 'bg-amber-950/80 border-amber-700/60 text-amber-300',
          indicator: 'bg-amber-500',
          label: 'MEDIUM RISK'
        };
      case 'low':
        return {
          bg: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300',
          indicator: 'bg-emerald-500',
          label: 'LOW RISK'
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          indicator: 'bg-slate-400',
          label: 'UNKNOWN / UNCONFIRMED'
        };
    }
  };

  const riskBadge = getRiskBadge(normalizedLevel);

  const handleCopySummary = () => {
    const summaryText = `[CreatorShield AI Threat Assessment]
Target/Brand: ${result.claimedBrand}
Sender: ${result.senderEmail}
Risk Level: ${result.riskLevel.toUpperCase()} (Score: ${result.riskScore}/100)
Findings: ${(result.findings || []).map(f => `${f.title} (${f.category})`).join('; ')}
Reputation Status: ${result.reputationStatus.status} (${result.reputationStatus.service})
Explanation: ${result.explanation}
Limitations: ${(result.limitations || []).join('; ')}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner & Assessment Overview */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1422] p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold border ${riskBadge.bg}`}>
                <span className={`w-2 h-2 rounded-full ${riskBadge.indicator}`}></span>
                {riskBadge.label}
              </span>

              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                SCORE: {result.riskScore}/100
              </span>

              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                REF: {result.id}
              </span>

              {result.isAiPowered ? (
                <span className="text-xs font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/40 flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  Gemini 3.8 Flash Grounded
                </span>
              ) : (
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  Deterministic Heuristics Engine
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Threat Assessment: {result.claimedBrand || 'Unspecified Brand'} Pitch
            </h1>

            {/* In-depth Evidence Grounded Explanation */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
              <span className="text-xs font-mono font-semibold text-sky-400 block uppercase tracking-wider">
                Grounded Explanation
              </span>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
            </div>

            {/* Claimed Brand vs Sender details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-slate-500 block mb-0.5 font-mono">CLAIMED BRAND:</span>
                <span className="text-slate-200 font-semibold">{result.claimedBrand || 'Unspecified'}</span>
              </div>
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40">
                <span className="text-slate-500 block mb-0.5 font-mono">SENDER ADDRESS:</span>
                <span className="text-slate-200 font-mono truncate block">{result.senderEmail || 'Unspecified'}</span>
              </div>
            </div>

            {result.submittedUrl && (
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs">
                <span className="text-slate-500 block mb-0.5 font-mono">SUBMITTED URL:</span>
                <code className="text-amber-300 font-mono text-xs break-all block">{result.submittedUrl}</code>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateToIncident(result)}
              className="px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-slate-950" />
              <span>Export Incident Dossier</span>
            </button>

            {result.matchingCampaignId && (
              <button
                onClick={() => onNavigateToReports(result.matchingCampaignId)}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-sky-400 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Database className="w-3.5 h-3.5" />
                <span>View Matching Campaign</span>
              </button>
            )}

            <button
              onClick={handleCopySummary}
              className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={onNavigateToAnalyze}
              className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Scan Another Pitch</span>
            </button>
          </div>
        </div>

        {/* Primary Safety Warning */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">Safety Principle: </span>
            <span>
              Do not treat a URL or message as safe merely because no threat was found. 
              Zero-day malware lures or transient domains may evade signature detection. 
              CreatorShield never executes or visits submitted links automatically.
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Deterministic Rule Findings vs Reputation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deterministic Rule Findings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Rule-Based Findings ({(result.findings || []).length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">DETERMINISTIC EVALUATION</span>
          </div>

          <div className="space-y-3">
            {(!result.findings || result.findings.length === 0) ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1320] text-slate-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No deterministic threat rules were triggered for this submission.</span>
              </div>
            ) : (
              result.findings.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-slate-800 bg-[#0d1320] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        item.severity === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          : item.severity === 'medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {item.severity.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{item.category}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  {item.evidenceSnippet && (
                    <div className="pt-1 flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                      <span className="text-slate-600">Evidence Snippet:</span>
                      <code className="text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-md">
                        {item.evidenceSnippet}
                      </code>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Actionable Recommended Steps */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1422] p-5 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-emerald-400" />
              <span>Recommended Security Actions</span>
            </h2>

            <div className="space-y-2">
              {(result.recommendedActions || []).map((action, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <span className="text-sky-400 font-bold shrink-0">{idx + 1}.</span>
                  <span className="leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: External Reputation Status & Explicit Limitations */}
        <div className="lg:col-span-5 space-y-6">
          {/* External Reputation Status Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1422] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>External Reputation Status</span>
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                result.reputationStatus.status === 'malicious'
                  ? 'bg-rose-950 text-rose-300'
                  : result.reputationStatus.status === 'clean'
                  ? 'bg-emerald-950 text-emerald-300'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {result.reputationStatus.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Reputation Service</span>
                <span className="font-mono text-slate-200">{result.reputationStatus.service}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Live API Checked</span>
                <span className="font-mono font-semibold text-slate-300">
                  {result.reputationStatus.checked ? 'YES (Live Database Queried)' : 'NO (Unconfigured / Skipped)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Service Adapter Origin</span>
                <span className="font-mono text-slate-400">{result.reputationStatus.source}</span>
              </div>

              <div className="pt-2 space-y-1">
                <span className="text-[11px] text-slate-500 font-mono block">STATUS DETAILS:</span>
                <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800 leading-relaxed">
                  {result.reputationStatus.details}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Notice: Rule-based findings and external reputation are evaluated separately. Scan results are never fabricated.
              </div>
            </div>
          </div>

          {/* Analysis Limitations & Disclaimers */}
          <div className="rounded-xl border border-slate-800 bg-[#0e1422] p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Analysis Limitations & Constraints</span>
            </h2>

            <div className="space-y-2">
              {(result.limitations || []).map((limitation, idx) => (
                <div 
                  key={idx} 
                  className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed"
                >
                  <span className="text-amber-400 shrink-0 font-bold">•</span>
                  <span>{limitation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators of Compromise */}
          {result.indicatorsOfCompromise && result.indicatorsOfCompromise.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-[#0e1422] p-5 space-y-3">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>Extracted IOCs (For Mail Rules / Firewall)</span>
              </h2>

              <div className="space-y-1.5">
                {result.indicatorsOfCompromise.map((ioc, idx) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded bg-slate-900 border border-slate-800/80 font-mono text-[11px] flex items-center justify-between text-slate-300"
                  >
                    <span className="text-slate-500">{ioc.type}:</span>
                    <span className="text-sky-300 truncate max-w-xs">{ioc.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
