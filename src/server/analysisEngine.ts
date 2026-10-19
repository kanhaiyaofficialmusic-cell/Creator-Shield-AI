import { 
  AnalysisResponse, 
  RiskLevel, 
  ReputationStatus 
} from '../types/index.js';
import { validateUrl, validateEmail } from './urlValidator.js';
import { evaluateDeterministicRules } from './rulesEngine.js';
import { ServerUrlReputationAdapter } from './reputationAdapter.js';
import { generateEvidenceGroundedExplanation } from './llmExplainer.js';
import { KNOWN_HISTORICAL_REPORTS } from './threatData.js';

export class InputValidationError extends Error {
  public field: string;
  constructor(message: string, field: string) {
    super(message);
    this.name = 'InputValidationError';
    this.field = field;
  }
}

/**
 * Server-side sponsorship threat analyzer orchestrator.
 */
export async function analyzeSponsorship(params: {
  emailText?: string;
  senderEmail?: string;
  claimedBrand?: string;
  submittedUrl?: string;
}): Promise<AnalysisResponse> {
  const emailText = (params.emailText || '').trim();
  const senderEmail = (params.senderEmail || '').trim();
  const claimedBrand = (params.claimedBrand || '').trim();
  const submittedUrl = (params.submittedUrl || '').trim();

  // Step 1: Input Validation
  if (!emailText && !senderEmail && !submittedUrl) {
    throw new InputValidationError(
      'At least one input (email text, sender email, or URL) must be provided.',
      'general'
    );
  }

  // Validate submittedUrl if provided
  if (submittedUrl) {
    const urlValidation = validateUrl(submittedUrl);
    if (!urlValidation.isValid) {
      throw new InputValidationError(
        urlValidation.error || 'The submitted URL is malformed or invalid.',
        'submittedUrl'
      );
    }
  }

  // Validate senderEmail if provided
  if (senderEmail) {
    const emailValidation = validateEmail(senderEmail);
    if (!emailValidation.isValid) {
      throw new InputValidationError(
        emailValidation.error || 'The sender email address is malformed.',
        'senderEmail'
      );
    }
  }

  const analysisId = 'CS-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const timestamp = new Date().toISOString();

  // Step 2: Apply Deterministic Rules (Behavioral Risk)
  const deterministicResult = evaluateDeterministicRules({
    emailText,
    senderEmail,
    claimedBrand,
    submittedUrl: submittedUrl || undefined
  });

  // Step 3: Query Configured URL Reputation Service through Server-Side Adapter
  const reputationAdapter = new ServerUrlReputationAdapter();
  const reputationStatus: ReputationStatus = await reputationAdapter.checkUrl(
    submittedUrl, 
    deterministicResult.extractedDomain
  );

  // Behavioral risk is authoritative from deterministic rules
  let behavioralRisk: RiskLevel = deterministicResult.riskLevel;
  let riskScore = deterministicResult.riskScore;

  // External live reputation escalation if verified malicious by external feed
  if (reputationStatus.checked && reputationStatus.status === 'malicious') {
    behavioralRisk = 'high';
    riskScore = Math.max(riskScore, 85);
  }

  // Step 4: Send untrusted email text and rule findings to hosted LLM API (Gemini 3.8 Flash)
  // Handles failures without crashing; narrative strictly reflects the deterministic findings
  const explanationResult = await generateEvidenceGroundedExplanation({
    emailText,
    senderEmail,
    claimedBrand,
    submittedUrl: submittedUrl || undefined,
    findings: deterministicResult.findings,
    riskLevel: behavioralRisk,
    reputationStatus,
    isTestData: deterministicResult.isTestData
  });

  // Step 5: Explicit Limitations Disclosure
  const limitations: string[] = [
    'A lack of known malicious signatures does not automatically lower the behavioural risk or confirm the message is safe.',
    reputationStatus.checked
      ? `External URL reputation was evaluated against ${reputationStatus.service}.`
      : 'External reputation service was NOT CHECKED (no live scan performed; safe result is never implied).',
    'Static inspection only: submitted links were not opened, fetched, or executed automatically.',
    'Email text was processed strictly as untrusted user data rather than operational instructions.',
    'Behavioral indicators reflect risk patterns and do not assert definitive legal culpability.'
  ];

  if (deterministicResult.isTestData) {
    limitations.push('The evaluated domain is an RFC 2606 reserved testing domain (.example/.test); findings describe synthetic test behavior rather than active malicious infrastructure.');
  }

  // Check matching historical reports strictly based on real domain or text match
  const matchedReport = KNOWN_HISTORICAL_REPORTS.find(r => {
    const brandMatch = claimedBrand && r.claimed_brand && r.claimed_brand.toLowerCase().includes(claimedBrand.toLowerCase());
    const domainMatch = deterministicResult.extractedDomain && r.domain && r.domain.toLowerCase() === deterministicResult.extractedDomain.toLowerCase();
    return brandMatch || domainMatch;
  });

  // Step 6: Return structured JSON with separated concepts
  const response: AnalysisResponse = {
    id: analysisId,
    timestamp,
    riskLevel: behavioralRisk,
    behavioralRisk: behavioralRisk,
    confidence: deterministicResult.confidence,
    reputationStatus,
    riskScore,
    findings: deterministicResult.findings,
    explanation: explanationResult.explanation,
    recommendedActions: explanationResult.recommendedActions,
    limitations,
    claimedBrand: claimedBrand || 'Unspecified',
    senderEmail: senderEmail || 'Unspecified',
    submittedUrl: submittedUrl || undefined,
    isAiPowered: explanationResult.isAiGenerated,
    isTestData: deterministicResult.isTestData,

    // Backward-compatibility mappings
    summary: explanationResult.explanation.slice(0, 300) + (explanationResult.explanation.length > 300 ? '...' : ''),
    evidence: deterministicResult.findings.map(f => ({
      id: f.id,
      category: f.category,
      severity: f.severity.toUpperCase(),
      title: f.title,
      description: f.description,
      indicator: f.evidenceSnippet
    })),
    threatCategory: deterministicResult.findings.length > 0 
      ? deterministicResult.findings[0].title 
      : 'Unconfirmed / Low Risk',
    domainReputation: {
      domain: deterministicResult.extractedDomain || 'unknown',
      isRegisteredLookalike: deterministicResult.findings.some(f => f.id === 'RULE_SENDER_LOOKALIKE' || f.id === 'RULE_SENDER_TYPOSQUAT_DISTANCE'),
      officialDomain: deterministicResult.officialDomain,
      suspiciousTld: deterministicResult.findings.some(f => f.id === 'RULE_URL_SUSPICIOUS_TLD'),
      freemailProvider: deterministicResult.findings.some(f => f.id === 'RULE_SENDER_FREEMAIL'),
      whoisAgeEstimate: deterministicResult.isTestData ? 'RFC Reserved Test Domain' : (reputationStatus.checked ? 'External reputation queried' : 'Static analysis only'),
      hasSuspiciousArchivePattern: deterministicResult.findings.some(f => f.id === 'RULE_PASSWORD_PROTECTED_ARCHIVE' || f.id === 'RULE_URL_EXECUTABLE_PAYLOAD'),
      redirectsToChatApp: deterministicResult.findings.some(f => f.id === 'RULE_CHAT_REDIRECTION'),
      threatIntelSource: reputationStatus.checked ? reputationStatus.service : 'DETERMINISTIC_RULES',
      dataSourceLabel: reputationStatus.details,
      notes: deterministicResult.findings.map(f => f.title)
    },
    recommendedSteps: explanationResult.recommendedActions.map((action, idx) => ({
      priority: idx === 0 ? 'IMMEDIATE' : idx === 1 ? 'NEXT' : 'MONITOR',
      action,
      details: 'Grounded remediation guidance from CreatorShield threat engine.'
    })),
    indicatorsOfCompromise: [
      ...(deterministicResult.extractedDomain && !deterministicResult.isTestData ? [{ type: 'DOMAIN', value: deterministicResult.extractedDomain }] : []),
      ...(senderEmail ? [{ type: 'SENDER_EMAIL', value: senderEmail }] : []),
      ...(submittedUrl && !deterministicResult.isTestData ? [{ type: 'SUSPECT_FILE', value: submittedUrl }] : [])
    ],
    matchingCampaignId: matchedReport?.id,
    matchingCampaignName: matchedReport?.campaign_name,
    disclaimer: 'Threat Absence ≠ Clean: Static analysis only flags known patterns. Zero-day attacks may still exist.'
  };

  return response;
}
