import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeSponsorship, InputValidationError } from './src/server/analysisEngine.js';
import { KNOWN_HISTORICAL_REPORTS } from './src/server/threatData.js';
import { IncidentReportSubmission } from './src/types/index.js';
import { basicRateLimiter } from './src/server/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory store for user-submitted incidents
const submittedIncidents: IncidentReportSubmission[] = [
  {
    id: 'INC-2026-9041',
    incidentDate: '2026-10-15',
    creatorChannelName: 'TechSphere Reviews',
    claimedBrand: 'Razer',
    senderEmail: 'partnerships@razer-collab-gear.com',
    submittedUrl: 'https://razer-collab-gear.com/assets/beta_agreement_v4.zip',
    emailSubject: 'Exclusive Q4 Sponsorship Deal - Razer BlackShark V2 Pro',
    rawEmailSnippet: 'Hello creator! We love your videos and want to offer you $6,000 for a 60s sponsor spot. Download the contract attached or at the link (pass: 2026) and sign the NDA.',
    riskLevel: 'high',
    threatCategory: 'Infostealer (Lumma/RedLine/Vidar)',
    notes: 'Blocked before opening. Domain registered 4 days ago with privacy guard.',
    submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'INC-2026-8812',
    incidentDate: '2026-10-12',
    creatorChannelName: 'ApexGamerHQ',
    claimedBrand: 'NordVPN',
    senderEmail: 'alex.influencer.nord@gmail.com',
    submittedUrl: 'https://nord-security-promo.club/onboard',
    emailSubject: 'NordVPN 3-Month Exclusive Sponsorship Retainer',
    rawEmailSnippet: 'Hi dear streamer, NordVPN wants to sponsor your next 4 streams for $14,000. Please ping our talent manager on Telegram @nord_talent_bot to finalize.',
    riskLevel: 'high',
    threatCategory: 'Session Token Hijacking',
    notes: 'Sender wrote from @gmail.com posing as NordVPN talent team with telegram redirection.',
    submittedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
  }
];

// In-memory cache for recent analyses
const recentAnalyses: any[] = [];

// API Routes
app.post('/api/analyze', basicRateLimiter, async (req: Request, res: Response) => {
  try {
    const { emailText, senderEmail, claimedBrand, submittedUrl } = req.body || {};

    const result = await analyzeSponsorship({
      emailText: emailText || '',
      senderEmail: senderEmail || '',
      claimedBrand: claimedBrand || '',
      submittedUrl: submittedUrl || undefined
    });

    recentAnalyses.unshift(result);
    if (recentAnalyses.length > 30) recentAnalyses.pop();

    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof InputValidationError) {
      return res.status(400).json({
        error: error.message,
        field: error.field
      });
    }

    console.error('Unhandled error during sponsorship analysis:', error);
    return res.status(500).json({ 
      error: 'An internal error occurred while processing the threat analysis.', 
      details: error?.message || 'Unknown processing error' 
    });
  }
});

app.get('/api/reports', (req: Request, res: Response) => {
  const { query, verification_status, brand } = req.query;
  
  let filtered = [...KNOWN_HISTORICAL_REPORTS];

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    filtered = filtered.filter(r => 
      (r.claimed_brand && r.claimed_brand.toLowerCase().includes(q)) ||
      r.domain.toLowerCase().includes(q) ||
      (r.sender_domain && r.sender_domain.toLowerCase().includes(q)) ||
      r.pattern.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }

  if (brand && typeof brand === 'string') {
    filtered = filtered.filter(r => 
      r.claimed_brand && r.claimed_brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  if (verification_status && typeof verification_status === 'string' && verification_status !== 'ALL') {
    filtered = filtered.filter(r => r.verification_status === verification_status);
  }

  return res.json({
    reports: filtered,
    userIncidents: submittedIncidents,
    totalKnownReports: KNOWN_HISTORICAL_REPORTS.length
  });
});

app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = KNOWN_HISTORICAL_REPORTS.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  return res.json(report);
});

app.post('/api/reports', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const newIncident: IncidentReportSubmission = {
      id: 'INC-' + Math.floor(1000 + Math.random() * 9000),
      incidentDate: payload.incidentDate || new Date().toISOString().split('T')[0],
      creatorChannelName: payload.creatorChannelName || 'Anonymous Creator',
      claimedBrand: payload.claimedBrand || 'Unspecified',
      senderEmail: payload.senderEmail || 'N/A',
      submittedUrl: payload.submittedUrl || undefined,
      emailSubject: payload.emailSubject || 'No Subject',
      rawEmailSnippet: payload.rawEmailSnippet || '',
      riskLevel: payload.riskLevel || 'high',
      threatCategory: payload.threatCategory || 'Brand Impersonation & Typosquatting',
      notes: payload.notes || '',
      submittedAt: new Date().toISOString()
    };

    submittedIncidents.unshift(newIncident);
    return res.status(201).json({ success: true, incident: newIncident });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record incident report.' });
  }
});

app.get('/api/stats', (req: Request, res: Response) => {
  return res.json({
    totalScamsLogged: 1240 + submittedIncidents.length + recentAnalyses.length,
    highRiskIntercepts: 894,
    recentScansCount: 48 + recentAnalyses.length,
    topImpersonatedBrands: [
      { brand: 'NordVPN', count: 142, risk: 'high' },
      { brand: 'Razer', count: 98, risk: 'high' },
      { brand: 'Corsair', count: 115, risk: 'high' },
      { brand: 'Apex Legends / EA', count: 73, risk: 'high' },
      { brand: 'Epidemic Sound', count: 64, risk: 'high' }
    ],
    activeCampaigns: [
      { name: 'LummaStealer Fake Game Demo', severity: 'high', status: 'ACTIVE IN THE WILD' },
      { name: 'Passworded ZIP Bypass (2026 wave)', severity: 'high', status: 'SURGING' },
      { name: 'Telegram Escrow Fee Trap', severity: 'medium', status: 'ACTIVE' }
    ],
    recentAnalyses: recentAnalyses.slice(0, 5)
  });
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CreatorShield AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
