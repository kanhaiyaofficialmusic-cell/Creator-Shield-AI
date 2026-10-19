import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw, 
  FileText, 
  Link as LinkIcon, 
  Mail, 
  Tag, 
  Zap, 
  Loader2, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { SAMPLE_PITCHES, SamplePitch } from '../data/samplePitches.js';
import { AnalysisResponse } from '../types/index.js';
import { analyzeSponsorshipApi } from '../services/api.js';

interface AnalysisViewProps {
  initialSample?: SamplePitch | null;
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  initialSample, 
  onAnalysisComplete 
}) => {
  const [claimedBrand, setClaimedBrand] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [emailText, setEmailText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // If passed an initial sample, populate it
  useEffect(() => {
    if (initialSample) {
      setClaimedBrand(initialSample.brand);
      setSenderEmail(initialSample.senderEmail);
      setSubmittedUrl(initialSample.url);
      setEmailText(initialSample.emailText);
    }
  }, [initialSample]);

  const handleLoadSample = (sample: SamplePitch) => {
    setClaimedBrand(sample.brand);
    setSenderEmail(sample.senderEmail);
    setSubmittedUrl(sample.url);
    setEmailText(sample.emailText);
    setError(null);
  };

  const handleClear = () => {
    setClaimedBrand('');
    setSenderEmail('');
    setSubmittedUrl('');
    setEmailText('');
    setError(null);
  };

  const loadingSteps = [
    'Parsing message headers & domain syntax...',
    'Evaluating brand typosquatting & reputation signals...',
    'Detecting payload delivery markers (passwords, archives, .scr/.exe)...',
    'Synthesizing threat intelligence via Gemini 3.8 Flash...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailText.trim() && !senderEmail.trim() && !submittedUrl.trim()) {
      setError('Please provide at least email text, a sender email, or a link to analyze.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await analyzeSponsorshipApi({
        emailText,
        senderEmail,
        claimedBrand,
        submittedUrl: submittedUrl.trim() || undefined
      });

      clearInterval(stepInterval);
      setIsLoading(false);
      onAnalysisComplete(result);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsLoading(false);
      setError(err?.message || 'Threat analysis failed. Please verify inputs and retry.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-sky-400" />
            <span>Sponsorship Phishing & Threat Analyzer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate inbound sponsor proposals for infostealers, domain impersonation, and token-stealing links.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Fill sample:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PITCHES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleLoadSample(s)}
                className="px-2.5 py-1 text-xs font-medium rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title={s.threatSummary}
              >
                {s.brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Notice Box */}
      <div className="rounded-xl border border-sky-900/60 bg-sky-950/20 p-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-sky-200">
              Safe Static Sandbox & Privacy Protocol
            </div>
            <p className="text-slate-400 leading-relaxed">
              CreatorShield AI inspects submitted strings statically. 
              <strong className="text-slate-200"> Submitted URLs are never navigated or visited automatically</strong> to eliminate drive-by malware execution risks. 
              Never paste Google passwords, 2FA backup codes, or session tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Claimed Brand */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Claimed Brand or Sponsor</span>
              <span className="text-slate-500 font-normal">(e.g., NordVPN, Razer, EA)</span>
            </label>
            <input
              type="text"
              value={claimedBrand}
              onChange={(e) => setClaimedBrand(e.target.value)}
              placeholder="e.g. NordVPN"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>

          {/* Sender Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Sender Email Address</span>
              <span className="text-slate-500 font-normal">(from email header)</span>
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="e.g. partnerships@nord-security-deals.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* URL or Download Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Provided URL / Download Link</span>
            <span className="text-slate-500 font-normal">(agreement link, portal, or file drive)</span>
          </label>
          <input
            type="text"
            value={submittedUrl}
            onChange={(e) => setSubmittedUrl(e.target.value)}
            placeholder="e.g. https://mega.nz/file/razer-synapse-v4-preview#key921 or https://brand-portal.com/kit.zip"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors font-mono"
          />
          <p className="text-[11px] text-slate-500">
            Static inspection only. Link will NOT be clicked or fetched.
          </p>
        </div>

        {/* Email Body / Proposal Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Body / Pitch Message Content</span>
              <span className="text-rose-400 font-normal">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {emailText.length} characters
            </span>
          </div>
          <textarea
            rows={8}
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the complete text of the sponsorship inquiry here, including greeting, budget proposals, deadlines, attachment notices, and contact handles..."
            className="w-full p-3.5 rounded-lg border border-slate-700 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors leading-relaxed font-sans"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-lg border border-rose-800/80 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Progress State */}
        {isLoading && (
          <div className="p-5 rounded-xl border border-sky-800/60 bg-[#0e1728] space-y-3 radar-sweep">
            <div className="flex items-center justify-between text-xs text-sky-400 font-mono">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>ACTIVE THREAT ENGINE SCANNING...</span>
              </span>
              <span>Step {loadingStep + 1} of {loadingSteps.length}</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-sky-500 h-1.5 transition-all duration-300"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-300 font-mono flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>{loadingSteps[loadingStep]}</span>
            </p>
          </div>
        )}

        {/* Form Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Pitch...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 text-slate-950" />
                <span>Execute Cybersecurity Inspection</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
