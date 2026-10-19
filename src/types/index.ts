export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type FindingCategory = 
  | 'sender_brand_mismatch' 
  | 'urgency' 
  | 'credentials' 
  | 'upfront_payment' 
  | 'suspicious_url' 
  | 'other';

export interface Finding {
  id: string;
  category: FindingCategory;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  evidenceSnippet?: string;
}

export type ReputationStatusValue = 
  | 'NOT CHECKED'
  | 'clean' 
  | 'malicious' 
  | 'suspicious' 
  | 'not_configured' 
  | 'error' 
  | 'unavailable';

export interface ReputationStatus {
  checked: boolean;
  service: string;
  status: ReputationStatusValue;
  details: string;
  source: string;
}

export interface AnalysisResponse {
  id: string;
  timestamp: string;
  // Three explicitly separated concepts:
  riskLevel: RiskLevel; // Primary behavioral risk level
  behavioralRisk: RiskLevel; // Explicit alias for clarity
  confidence: 'low' | 'medium' | 'high'; // Assessment confidence based on signal clarity
  reputationStatus: ReputationStatus; // External URL reputation status

  riskScore: number; // 0 - 100
  findings: Finding[];
  explanation: string;
  recommendedActions: string[];
  limitations: string[];
  claimedBrand: string;
  senderEmail: string;
  submittedUrl?: string;
  isAiPowered: boolean;
  isTestData?: boolean; // True when test/reserved domains like .example are used

  // Backward compatibility fields for views
  summary?: string;
  evidence?: Array<{
    id: string;
    category: string;
    severity: string;
    title: string;
    description: string;
    indicator?: string;
  }>;
  threatCategory?: string;
  domainReputation?: {
    domain: string;
    isRegisteredLookalike: boolean;
    officialDomain?: string;
    suspiciousTld: boolean;
    freemailProvider: boolean;
    whoisAgeEstimate?: string;
    hasSuspiciousArchivePattern: boolean;
    redirectsToChatApp: boolean;
    threatIntelSource: string;
    dataSourceLabel: string;
    notes: string[];
  };
  recommendedSteps?: Array<{
    priority: string;
    action: string;
    details: string;
  }>;
  indicatorsOfCompromise?: Array<{
    type: string;
    value: string;
  }>;
  matchingCampaignId?: string;
  matchingCampaignName?: string;
  disclaimer?: string;
}

// Normalized Historical Report Schema
export interface ThreatReportRecord {
  id: string;
  domain: string;
  claimed_brand?: string;
  sender_domain?: string;
  pattern: string;
  description: string;
  reported_at: string;
  verification_status: 'unverified' | 'corroborated' | 'confirmed';
  risk_level?: RiskLevel;
  indicators?: string[];
  campaign_name?: string;
  target_niche?: string;
}

export interface IncidentReportSubmission {
  id: string;
  analysisId?: string;
  incidentDate: string;
  creatorChannelName?: string;
  claimedBrand: string;
  senderEmail: string;
  submittedUrl?: string;
  emailSubject: string;
  rawEmailSnippet: string;
  riskLevel: RiskLevel;
  threatCategory: string;
  notes: string;
  submittedAt: string;
}
