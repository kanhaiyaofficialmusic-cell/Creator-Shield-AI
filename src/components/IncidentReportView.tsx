import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Terminal, 
  ShieldAlert, 
  Send,
  Loader2,
  Lock
} from 'lucide-react';
import { AnalysisResponse, IncidentReportSubmission } from '../types/index.js';
import { submitIncidentReportApi } from '../services/api.js';

interface IncidentReportViewProps {
  currentAnalysis?: AnalysisResponse | null;
  onSubmittedSuccess?: () => void;
}

export const IncidentReportView: React.FC<IncidentReportViewProps> = ({ 
  currentAnalysis,
  onSubmittedSuccess
}) => {
  const [copiedType, setCopiedType] = useState<'markdown' | 'text' | 'iocs' | null>(null);
  const [channelName, setChannelName] = useState('My Creator Channel');
  const [customNotes, setCustomNotes] = useState('Suspected infostealer campaign targeting content creators.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fallback defaults if no active analysis has been run yet
  const analysis: AnalysisResponse = currentAnalysis || {
    id: 'CS-DEFAULT-SAMPLE',
    timestamp: new Date().toISOString(),
    riskLevel: 'high',
    riskScore: 88,
    findings: [
      {
        id: 'EV-1',
        category: 'sender_brand_mismatch',
        severity: 'high',
        title: 'Typosquatted Brand Domain',
        description: 'Domain "nord-security-deals.com" deviates from official brand domain "nordvpn.com".',
        evidenceSnippet: 'nord-security-deals.com'
      },
      {
        id: 'EV-2',
        category: 'suspicious_url',
        severity: 'high',
        title: 'Password-Protected Archive',
        description: 'Email supplies extraction password "2026" to evade gateway antivirus inspection.',
        evidenceSnippet: 'Pass: 2026'
      }
    ],
    reputationStatus: {
      checked: false,
      service: 'External URL Threat Intelligence',
      status: 'not_configured',
      details: 'No live external API credentials configured.',
      source: 'server_adapter'
    },
    explanation: 'Attackers deploy password-protected archives containing disguised Windows executable binaries or LNK shortcuts. Once run by the creator, the payload dumps browser session cookies, enabling unauthorized YouTube channel takeover without triggering 2FA alerts.',
    recommendedActions: [
      'Do not extract or run the downloaded file.',
      'Add sender domain to mail firewall blocklist.',
      'Audit channel session tokens.'
    ],
    limitations: [
      'Threat absence does not guarantee that a URL is safe.',
      'Static inspection only; external reputation service was not configured.'
    ],
    threatCategory: 'Infostealer (Lumma/RedLine/Vidar)',
    summary: 'High-confidence sponsorship phishing and malware deployment attempt. Sender impersonates a major hardware/VPN sponsor with a password-protected ZIP archive lure.',
    claimedBrand: 'NordVPN',
    senderEmail: 'partnerships@nord-security-deals.com',
    submittedUrl: 'https://nord-security-deals.com/download/NordVPN_Q4_Creator_Kit.zip',
    evidence: [
      {
        id: 'EV-1',
        category: 'Domain Impersonation',
        severity: 'HIGH',
        title: 'Typosquatted Brand Domain',
        description: 'Domain "nord-security-deals.com" deviates from official brand domain "nordvpn.com".',
        indicator: 'nord-security-deals.com'
      },
      {
        id: 'EV-2',
        category: 'Payload Delivery',
        severity: 'HIGH',
        title: 'Password-Protected Archive',
        description: 'Email supplies extraction password "2026" to evade gateway antivirus inspection.',
        indicator: 'Pass: 2026'
      }
    ],
    detailedExplanation: 'Attackers deploy password-protected archives containing disguised Windows executable binaries or LNK shortcuts.',
    domainReputation: {
      domain: 'nord-security-deals.com',
      isRegisteredLookalike: true,
      officialDomain: 'nordvpn.com',
      suspiciousTld: false,
      freemailProvider: false,
      whoisAgeEstimate: 'Estimated < 30 days active',
      hasSuspiciousArchivePattern: true,
      redirectsToChatApp: false,
      threatIntelSource: 'ALGORITHMIC_PARSER',
      dataSourceLabel: 'Simulated Threat Intel & Static Rule Engine',
      notes: ['Lookalike domain registered recently', 'Passworded ZIP pattern identified']
    },
    recommendedSteps: [
      {
        priority: 'IMMEDIATE',
        action: 'Do not extract or run the downloaded file',
        details: 'Delete any files downloaded from this link immediately.'
      }
    ],
    indicatorsOfCompromise: [
      { type: 'DOMAIN', value: 'nord-security-deals.com' },
      { type: 'SENDER_EMAIL', value: 'partnerships@nord-security-deals.com' }
    ],
    isAiPowered: true,
    disclaimer: 'Threat Absence ≠ Clean: Static analysis flags known signatures only.'
  };

  // Generate Structured Markdown Report
  const generateMarkdownReport = () => {
    return `# CREATORSHIELD CYBERSECURITY INCIDENT REPORT
**Report Reference:** ${analysis.id}
**Classification:** TLP:AMBER (Confidential Creator Security Telemetry)
**Generated:** ${analysis.timestamp}
**Target / Victim Channel:** ${channelName}

---

## 1. EXECUTIVE THREAT SUMMARY
- **Assessed Risk Level:** ${analysis.riskLevel} (Threat Score: ${analysis.riskScore}/100)
- **Primary Threat Category:** ${analysis.threatCategory}
- **Impersonated Brand:** ${analysis.claimedBrand}
- **Sender Address:** ${analysis.senderEmail}
- **Offered Link / Payload:** ${analysis.submittedUrl || 'None Provided'}
- **Detection Engine:** ${analysis.isAiPowered ? 'Gemini 3.8 Flash + Static Rules' : 'Deterministic Heuristic Engine'}

### Executive Brief
${analysis.summary}

---

## 2. EVIDENCE & TTP INVENTORY
${analysis.evidence.map((e, idx) => `### ${idx + 1}. [${e.severity}] ${e.title}
- **Category:** ${e.category}
- **Technical Description:** ${e.description}
${e.indicator ? `- **Indicator:** \`${e.indicator}\`` : ''}`).join('\n\n')}

---

## 3. DOMAIN & REPUTATION FINDINGS
- **Domain Inspected:** \`${analysis.domainReputation.domain}\`
- **Legitimate Official Domain:** \`${analysis.domainReputation.officialDomain || 'N/A'}\`
- **Lookalike / Typosquatting:** ${analysis.domainReputation.isRegisteredLookalike ? 'TRUE' : 'FALSE'}
- **Freemail Sender:** ${analysis.domainReputation.freemailProvider ? 'TRUE' : 'FALSE'}
- **Archive Delivery Pattern:** ${analysis.domainReputation.hasSuspiciousArchivePattern ? 'TRUE' : 'FALSE'}
- **Data Source / Provenance:** ${analysis.domainReputation.dataSourceLabel}

---

## 4. INDICATORS OF COMPROMISE (IOCS)
\`\`\`
${analysis.indicatorsOfCompromise.map(i => `${i.type.padEnd(16)} : ${i.value}`).join('\n')}
\`\`\`

---

## 5. INCIDENT NOTES & ANALYST OBSERVATIONS
${customNotes}

---

## 6. RECOMMENDED REMEDIATION ACTIONS
${analysis.recommendedSteps.map((s, idx) => `${idx + 1}. **[${s.priority}] ${s.action}**\n   ${s.details}`).join('\n')}

---
*Generated by CreatorShield AI Defense Center. Static analysis model. Never enter Google passwords or session cookies.*
`;
  };

  const handleCopy = (type: 'markdown' | 'text' | 'iocs') => {
    if (type === 'markdown') {
      navigator.clipboard.writeText(generateMarkdownReport());
    } else if (type === 'text') {
      const plain = `[CREATORSHIELD INCIDENT ${analysis.id}]
Risk: ${analysis.riskLevel} (${analysis.threatCategory})
Brand: ${analysis.claimedBrand}
Sender: ${analysis.senderEmail}
Link: ${analysis.submittedUrl || 'N/A'}
Summary: ${analysis.summary}
Recommended: ${analysis.recommendedSteps.map(s => s.action).join('; ')}`;
      navigator.clipboard.writeText(plain);
    } else if (type === 'iocs') {
      const iocText = analysis.indicatorsOfCompromise.map(i => `${i.type}: ${i.value}`).join('\n');
      navigator.clipboard.writeText(iocText);
    }
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdownReport()], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Incident-Report-${analysis.id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadJson = () => {
    const jsonDossier = {
      incidentId: analysis.id,
      timestamp: analysis.timestamp,
      channelName,
      threatAssessment: analysis,
      analystNotes: customNotes,
      exportVersion: 'CreatorShield-v1.0'
    };
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(jsonDossier, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `Threat-Bundle-${analysis.id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSubmitToCommunity = async () => {
    setIsSubmitting(true);
    try {
      await submitIncidentReportApi({
        analysisId: analysis.id,
        creatorChannelName: channelName,
        claimedBrand: analysis.claimedBrand,
        senderEmail: analysis.senderEmail,
        submittedUrl: analysis.submittedUrl,
        emailSubject: `Suspected ${analysis.claimedBrand} Phishing Attempt`,
        rawEmailSnippet: analysis.summary,
        riskLevel: analysis.riskLevel,
        threatCategory: analysis.threatCategory,
        notes: customNotes
      });
      setIsSubmitting(false);
      setSubmitSuccess(true);
      if (onSubmittedSuccess) onSubmittedSuccess();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-400" />
            <span>Cybersecurity Incident Dossier</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized threat report for legal records, platform abuse reporting, and email gateway blocklisting.
          </p>
        </div>

        {/* Export and Copy Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCopy('markdown')}
            className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
          >
            {copiedType === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedType === 'markdown' ? 'Copied MD' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>JSON Bundle</span>
          </button>
        </div>
      </div>

      {/* Incident Customization Form (Victim Channel & Notes) */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0e1422] space-y-3 text-xs">
        <h2 className="font-semibold text-slate-300 flex items-center gap-2 text-sm">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span>Incident Metadata Configuration</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Your Creator / Channel Name</label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g. MyTechChannel"
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Additional Incident Observations / Actions Taken</label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Received via business inquiry email; did not click or run executable"
              className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Main Formatted Dossier Preview */}
      <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-6 sm:p-8 space-y-6 font-mono text-xs text-slate-300 shadow-xl">
        {/* Header telemetry box */}
        <div className="border-b border-slate-800 pb-5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500">
            <span>TLP:AMBER // CREATOR CYBERSECURITY ADVISORY</span>
            <span>INCIDENT REF: {analysis.id}</span>
          </div>
          <div className="text-lg font-bold text-white tracking-wide font-sans">
            INCIDENT DOSSIER: {analysis.threatCategory.toUpperCase()}
          </div>
          <div className="text-slate-400 font-sans">
            Targeting Creator: <strong className="text-slate-200">{channelName}</strong> | Timestamp: {analysis.timestamp}
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-2">
          <div className="text-sky-400 font-bold uppercase tracking-wider">
            1. Threat Overview & Vector Assessment
          </div>
          <div className="p-3.5 rounded bg-slate-900/90 border border-slate-800/80 font-sans text-xs text-slate-300 leading-relaxed">
            {analysis.summary}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">RISK LEVEL:</span>
              <span className="text-rose-400 font-bold">{analysis.riskLevel}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">THREAT SCORE:</span>
              <span className="text-slate-200 font-bold">{analysis.riskScore}/100</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">IMPERSONATED:</span>
              <span className="text-slate-200 font-bold">{analysis.claimedBrand}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">SENDER HOST:</span>
              <span className="text-slate-200 font-bold truncate block">{analysis.domainReputation.domain}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Evidence */}
        <div className="space-y-2">
          <div className="text-sky-400 font-bold uppercase tracking-wider">
            2. Technical TTP & Indicator Breakdown
          </div>
          <div className="space-y-2">
            {analysis.evidence.map((ev, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-slate-200 font-sans">{idx + 1}. {ev.title}</span>
                  <span className="text-rose-400 text-[10px]">{ev.severity}</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">{ev.description}</p>
                {ev.indicator && (
                  <div className="text-slate-500 text-[10px]">
                    Signature / String: <span className="text-sky-300">{ev.indicator}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Extracted Indicators of Compromise (IOC) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sky-400 font-bold uppercase tracking-wider">
              3. Raw Indicators of Compromise (IOCs)
            </span>
            <button
              onClick={() => handleCopy('iocs')}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
            >
              {copiedType === 'iocs' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy IOC List</span>
            </button>
          </div>
          <div className="p-3 rounded bg-black/60 border border-slate-800 text-slate-300 text-[11px] space-y-1">
            {analysis.indicatorsOfCompromise.map((ioc, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-slate-500">{ioc.type}:</span>
                <span className="text-amber-300 select-all">{ioc.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Recommended Remediation Steps */}
        <div className="space-y-2">
          <div className="text-sky-400 font-bold uppercase tracking-wider">
            4. Recommended Security Countermeasures
          </div>
          <div className="space-y-2 font-sans">
            {analysis.recommendedSteps.map((s, idx) => (
              <div key={idx} className="p-3 rounded bg-slate-900 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-200 mb-0.5">
                  [{s.priority}] {s.action}
                </div>
                <div className="text-slate-400 text-[11px]">{s.details}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer verification disclaimer */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-sans">
          <span>CREATORSHIELD AI // DEFENSE DOSSIER ENGINE</span>
          <span>NEVER SHARE GOOGLE RECOVERY CODES OR PASSWORDS</span>
        </div>
      </div>

      {/* Share / Submit Incident into Threat Database */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1422] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-sky-400" />
            <span>Contribute to the Creator Threat Defense Network</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit this anonymized incident to warn fellow video creators and update the community threat database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {submitSuccess ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Incident Logged in Community Feed</span>
            </span>
          ) : (
            <button
              onClick={handleSubmitToCommunity}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Anonymously to Feed</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
