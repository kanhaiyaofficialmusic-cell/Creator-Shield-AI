import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { DashboardView } from './components/DashboardView.js';
import { AnalysisView } from './components/AnalysisView.js';
import { ResultsView } from './components/ResultsView.js';
import { ReportsView } from './components/ReportsView.js';
import { IncidentReportView } from './components/IncidentReportView.js';
import { AnalysisResponse } from './types/index.js';
import { SamplePitch, SAMPLE_PITCHES } from './data/samplePitches.js';
import { fetchDashboardStatsApi, DashboardStats } from './services/api.js';
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyze' | 'results' | 'reports' | 'incident'>('dashboard');
  const [latestResult, setLatestResult] = useState<AnalysisResponse | null>(null);
  const [selectedSample, setSelectedSample] = useState<SamplePitch | null>(null);
  const [brandFilterForReports, setBrandFilterForReports] = useState<string | undefined>(undefined);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Fetch dashboard overview metrics
    fetchDashboardStatsApi()
      .then((data) => setDashboardStats(data))
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  const handleNavigate = (tab: 'dashboard' | 'analyze' | 'results' | 'reports' | 'incident') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartAnalysis = (sample?: SamplePitch) => {
    if (sample) {
      setSelectedSample(sample);
    } else {
      setSelectedSample(null);
    }
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setLatestResult(result);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Refresh stats
    fetchDashboardStatsApi().then(setDashboardStats).catch(() => {});
  };

  const handleViewReports = (brandFilter?: string) => {
    setBrandFilterForReports(brandFilter);
    setActiveTab('reports');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIncident = (result: AnalysisResponse) => {
    setLatestResult(result);
    setActiveTab('incident');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        onNavigate={handleNavigate} 
        hasActiveResult={!!latestResult}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={dashboardStats}
            onNavigateToAnalyze={handleStartAnalysis}
            onNavigateToReports={handleViewReports}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalysisView
            initialSample={selectedSample}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {activeTab === 'results' && latestResult && (
          <ResultsView
            result={latestResult}
            onNavigateToAnalyze={() => handleStartAnalysis()}
            onNavigateToReports={handleViewReports}
            onNavigateToIncident={handleNavigateToIncident}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            initialBrandFilter={brandFilterForReports}
            onNavigateToAnalyzeWithBrand={(brand) => {
              const matchedSample = SAMPLE_PITCHES.find(p => p.brand.toLowerCase() === brand.toLowerCase());
              if (matchedSample) {
                handleStartAnalysis(matchedSample);
              } else {
                handleStartAnalysis({
                  id: 'custom-' + brand,
                  label: `${brand} Pitch Review`,
                  type: 'MALWARE_ARCHIVE',
                  brand,
                  senderEmail: `sponsor@${brand.toLowerCase().replace(/\s+/g, '')}-partner-deals.com`,
                  url: `https://${brand.toLowerCase().replace(/\s+/g, '')}-deals.com/agreement.zip`,
                  subject: `Sponsorship Inquiry - ${brand}`,
                  emailText: `Hello! We would love to collaborate on a sponsored integration for ${brand}. Please check the agreement link. Password is 2026.`,
                  threatSummary: `Custom test pitch for ${brand}`
                });
              }
            }}
            onNavigateToIncident={() => setActiveTab('incident')}
          />
        )}

        {activeTab === 'incident' && (
          <IncidentReportView
            currentAnalysis={latestResult}
            onSubmittedSuccess={() => {
              fetchDashboardStatsApi().then(setDashboardStats).catch(() => {});
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a11] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-200">CreatorShield AI</span>
                <span className="text-slate-500 ml-2">Cybersecurity Platform for Content Creators</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-slate-400 text-xs">
              <button onClick={() => handleNavigate('dashboard')} className="hover:text-white transition-colors">
                Dashboard
              </button>
              <button onClick={() => handleStartAnalysis()} className="hover:text-white transition-colors">
                Check Pitch
              </button>
              <button onClick={() => handleNavigate('reports')} className="hover:text-white transition-colors">
                Threat Database
              </button>
              <button onClick={() => handleNavigate('incident')} className="hover:text-white transition-colors">
                Incident Dossier
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} CreatorShield AI. Dedicated to digital creator security & infostealer defense.
            </div>
            <div className="flex items-center gap-4">
              <span>Passive Static Inspection</span>
              <span>·</span>
              <span>No Google Credentials Requested</span>
              <span>·</span>
              <span>Threat Absence ≠ Clean</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
