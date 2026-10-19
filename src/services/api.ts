import { 
  AnalysisResponse, 
  ThreatReportRecord, 
  IncidentReportSubmission 
} from '../types/index.js';

export interface DashboardStats {
  totalScamsLogged: number;
  highRiskIntercepts: number;
  recentScansCount: number;
  topImpersonatedBrands: { brand: string; count: number; risk: string }[];
  activeCampaigns: { name: string; severity: string; status: string }[];
  recentAnalyses: AnalysisResponse[];
}

export async function analyzeSponsorshipApi(payload: {
  emailText: string;
  senderEmail: string;
  claimedBrand: string;
  submittedUrl?: string;
}): Promise<AnalysisResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Analysis failed with status ${res.status}`);
  }

  return res.json();
}

export async function checkDomainReputationApi(payload: {
  senderEmail: string;
  submittedUrl?: string;
  claimedBrand?: string;
}): Promise<DomainReputation> {
  const res = await fetch('/api/check-domain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Domain reputation lookup failed');
  }

  return res.json();
}

export async function fetchHistoricalReportsApi(params?: {
  query?: string;
  category?: string;
  risk?: string;
}): Promise<{
  reports: ThreatReportRecord[];
  userIncidents: IncidentReportSubmission[];
  totalKnownReports: number;
}> {
  const searchParams = new URLSearchParams();
  if (params?.query) searchParams.set('query', params.query);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.risk) searchParams.set('risk', params.risk);

  const res = await fetch(`/api/reports?${searchParams.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch threat reports');
  }

  return res.json();
}

export async function submitIncidentReportApi(
  report: Partial<IncidentReportSubmission>
): Promise<{ success: boolean; incident: IncidentReportSubmission }> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  });

  if (!res.ok) {
    throw new Error('Failed to submit incident report');
  }

  return res.json();
}

export async function fetchDashboardStatsApi(): Promise<DashboardStats> {
  const res = await fetch('/api/stats');
  if (!res.ok) {
    throw new Error('Failed to load dashboard metrics');
  }
  return res.json();
}
