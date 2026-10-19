import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  AlertTriangle, 
  ExternalLink, 
  Calendar, 
  Target, 
  FileText,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { ThreatReportRecord, IncidentReportSubmission } from '../types/index.js';
import { fetchHistoricalReportsApi } from '../services/api.js';

interface ReportsViewProps {
  initialBrandFilter?: string;
  onNavigateToAnalyzeWithBrand?: (brand: string) => void;
  onNavigateToIncident?: (brand: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  initialBrandFilter, 
  onNavigateToAnalyzeWithBrand
}) => {
  const [reports, setReports] = useState<ThreatReportRecord[]>([]);
  const [userIncidents, setUserIncidents] = useState<IncidentReportSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialBrandFilter || '');
  const [selectedVerification, setSelectedVerification] = useState<string>('ALL');

  useEffect(() => {
    loadReports();
  }, [searchQuery, selectedVerification]);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalReportsApi({
        query: searchQuery || undefined,
        category: selectedVerification !== 'ALL' ? selectedVerification : undefined
      });
      setReports(data.reports);
      setUserIncidents(data.userIncidents);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      setError('Failed to load historical reports database.');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedVerification('ALL');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-sky-400" />
            <span>Similar Historical Threat Reports</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Community and intelligence threat database of known fake sponsorship patterns, lookalike domains, and malware vectors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
            {reports.length} CAMPAIGNS CATALOGED
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0e1422] space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by claimed brand (e.g. NordVPN, Razer), reported domain, or pattern..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Verification Status Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedVerification}
              onChange={(e) => setSelectedVerification(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="confirmed">Confirmed by Trusted Source</option>
              <option value="corroborated">Corroborated Reports</option>
              <option value="unverified">Unverified Submissions</option>
            </select>
          </div>
        </div>

        {/* Active search filter tags */}
        {(searchQuery || selectedVerification !== 'ALL') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-400">
              <span>Active filters:</span>
              {searchQuery && (
                <span className="bg-slate-800 text-sky-400 px-2 py-0.5 rounded font-mono">
                  &quot;{searchQuery}&quot;
                </span>
              )}
              {selectedVerification !== 'ALL' && (
                <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono">
                  {selectedVerification}
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="text-slate-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono">Loading campaign threat database...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 rounded-xl border border-rose-800/80 bg-rose-950/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={loadReports} className="underline hover:text-white">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && reports.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-[#0e1422] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-200">No matching threat reports found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              We couldn&apos;t find any historical reports matching your query. You can broaden your search or reset filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Threat Reports List */}
      {!isLoading && !error && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border border-slate-800 bg-[#0e1422] hover:border-slate-700 transition-all p-5 space-y-3"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    report.verification_status === 'confirmed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                      : report.verification_status === 'corroborated'
                      ? 'bg-sky-950 text-sky-300 border border-sky-800/50'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {report.verification_status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{report.id}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-semibold text-sky-400">{report.claimed_brand || 'Unknown Brand'}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">Domain: {report.domain}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reported: {report.reported_at}</span>
                  </span>
                </div>
              </div>

              {/* Title & Pattern */}
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  {report.campaign_name || report.pattern}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-slate-300 font-medium">Suspicious Pattern: <strong className="text-rose-300">{report.pattern}</strong></span>
                  {report.sender_domain && (
                    <>
                      <span>·</span>
                      <span className="text-slate-400 font-mono">Sender Host: @{report.sender_domain}</span>
                    </>
                  )}
                  {report.target_niche && (
                    <>
                      <span>·</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Target className="w-3 h-3 text-amber-400" />
                        <span>Niche: {report.target_niche}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-300 font-mono block mb-1">EVIDENCE SUBMITTED BY REPORTER:</span>
                {report.description}
              </div>

              {/* Indicators of Compromise */}
              {report.indicators && report.indicators.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-500">OBSERVED SIGNATURES:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {report.indicators.map((ind, iIdx) => (
                      <div 
                        key={iIdx} 
                        className="p-2 rounded bg-slate-900/90 border border-slate-800 text-slate-300 flex items-start gap-1.5"
                      >
                        <span className="text-rose-400 shrink-0 font-bold">•</span>
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Card Actions */}
              {report.claimed_brand && onNavigateToAnalyzeWithBrand && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => onNavigateToAnalyzeWithBrand(report.claimed_brand!)}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>Test Pitch Against {report.claimed_brand}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Community Submitted Reports Section */}
      {userIncidents.length > 0 && (
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Community & User-Submitted Incidents ({userIncidents.length})</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">INCIDENT FEED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userIncidents.map((inc) => (
              <div key={inc.id} className="p-4 rounded-xl border border-slate-800 bg-[#0d1320] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">{inc.id}</span>
                  <span className="font-mono text-rose-400 font-semibold">{inc.riskLevel.toUpperCase()}</span>
                </div>
                <div className="font-semibold text-slate-200 text-sm">
                  {inc.emailSubject}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Brand: {inc.claimedBrand} | Sender: {inc.senderEmail}
                </div>
                {inc.notes && (
                  <p className="text-xs text-slate-500 bg-slate-900/60 p-2 rounded border border-slate-800">
                    {inc.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
