import { ThreatReportRecord } from '../types/index.js';

export const KNOWN_HISTORICAL_REPORTS: ThreatReportRecord[] = [
  {
    id: 'REP-2026-8912',
    domain: 'nord-affiliate-partners.com',
    claimed_brand: 'NordVPN',
    sender_domain: 'nord-affiliate-partners.com',
    pattern: 'Password-Protected ZIP with Infostealer (Lumma)',
    description: 'Attackers impersonate NordVPN partnership managers using typosquatted domains. The password-protected ZIP archive contains disguised .scr / .exe executable dropping LummaStealer to harvest YouTube channel session cookies.',
    reported_at: '2026-08-14',
    verification_status: 'confirmed',
    risk_level: 'high',
    campaign_name: 'NordVPN Influencer Impersonation Campaign',
    target_niche: 'Gaming, Tech, Commentary',
    indicators: [
      'Sender domain mismatch (nord-affiliate-partners.com vs nordvpn.com)',
      'Password "2026" provided to bypass email antivirus gateways',
      'Unrealistic upfront budget ($8,500 for a 45s integration)',
      'Requests creator to download brand kit before contract signing'
    ]
  },
  {
    id: 'REP-2026-7821',
    domain: 'razer-creators-collab.net',
    claimed_brand: 'Razer',
    sender_domain: 'razer-creators-collab.net',
    pattern: 'Session Token Hijacking & Driver Beta Lure',
    description: 'Targets YouTube & Twitch creators with offers of free gaming peripherals plus $5,000 cash in exchange for testing a "pre-release driver" on Mega that extracts Google Chrome and Discord token databases, redirecting negotiation to Telegram.',
    reported_at: '2026-07-29',
    verification_status: 'confirmed',
    risk_level: 'high',
    campaign_name: 'Razer Synapse Beta Sponsor Scam',
    target_niche: 'Gaming & Hardware Reviewers',
    indicators: [
      'Domain registered less than 14 days ago',
      'Lure requests executing an installer tool to benchmark hardware compatibility',
      'Communication switches to Telegram (@razer_affiliates_desk) upon reply',
      'Contains fake signature from Razer executive'
    ]
  },
  {
    id: 'REP-2026-6540',
    domain: 'epidemic-creator-portal.net',
    claimed_brand: 'Epidemic Sound',
    sender_domain: 'epidemic-creators-desk.com',
    pattern: 'Brand Impersonation & Fake OAuth Sign-in',
    description: 'A phishing kit replicating the Epidemic Sound dashboard designed to harvest creator Google credentials and 2FA backup codes through simulated OAuth screens under the guise of an ambassador copyright clearance grant.',
    reported_at: '2026-09-02',
    verification_status: 'corroborated',
    risk_level: 'high',
    campaign_name: 'Epidemic Sound Fake Copyright Settlement / Sponsorship',
    target_niche: 'Music, Vlogs, Video Editors',
    indicators: [
      'Phishing landing page cloaked behind Cloudflare Turnstile',
      'Fake sense of urgency ("claim your $3,000 onboarding stipend within 48 hours")',
      'Domain mismatch with official epidemicsound.com',
      'Sender uses generic ProtonMail reply-to header'
    ]
  },
  {
    id: 'REP-2026-5412',
    domain: 'corsair-influencers.org',
    claimed_brand: 'Corsair',
    sender_domain: 'corsair-influencers.org',
    pattern: 'Malicious LNK Shortcut & Infostealer Delivery',
    description: 'Lures video creators into clicking an LNK shortcut file disguised as a PDF (Corsair_Sponsorship_Contract.pdf.lnk) that runs a hidden PowerShell script, downloading Vidar Stealer to hijack active Twitch and YouTube broadcaster sessions.',
    reported_at: '2026-06-18',
    verification_status: 'confirmed',
    risk_level: 'high',
    campaign_name: 'Corsair iCUE Sponsored Overlay Malware',
    target_niche: 'Streamers, VTubers, Podcasters',
    indicators: [
      'Double extension trick: Corsair_Sponsorship_Contract.pdf.lnk',
      'High reward ($12,000 wire on delivery) with zero portfolio vetting',
      'Sender address uses free mail provider forwarding',
      'Unsigned executable initiates PowerShell memory injection'
    ]
  },
  {
    id: 'REP-2026-4190',
    domain: 'ea-creator-network.info',
    claimed_brand: 'Electronic Arts / EA',
    sender_domain: 'ea-creator-network.info',
    pattern: 'Fake NDA / Playtest Launcher Malware Loader',
    description: 'Targets competitive gaming YouTubers with early access to upcoming game updates via WeTransfer. The provided launcher is an infostealer payload instructing creators to disable antivirus.',
    reported_at: '2026-09-22',
    verification_status: 'corroborated',
    risk_level: 'high',
    campaign_name: 'Apex Legends Playtest NDA Scam',
    target_niche: 'Battle Royale & FPS Creators',
    indicators: [
      'Fake NDA document requiring macro activation or external launcher execution',
      'Non-official TLD (.info instead of ea.com)',
      'Pretends to offer $7,500 for a 1-hour gameplay stream',
      'Instructs creator to disable Windows Defender before launching test client'
    ]
  },
  {
    id: 'REP-2026-3029',
    domain: 'capcut-creator-rewards.co',
    claimed_brand: 'CapCut',
    sender_domain: 'capcut-creator-rewards.co',
    pattern: 'Advance Fee Fraud / Wire Processing Scam',
    description: 'Scammers send mass blasts to short-form video creators claiming an unclaimed grant or sponsorship fund, demanding an upfront $45 international transaction insurance fee.',
    reported_at: '2026-05-11',
    verification_status: 'unverified',
    risk_level: 'medium',
    campaign_name: 'CapCut Creator Bonus Advance Fee Scam',
    target_niche: 'Shorts & TikTok Creators',
    indicators: [
      'Requests creator pay $45 "international transaction insurance fee"',
      'Generic email greeting ("Dear Creator / Channel Owner")',
      'Unverified payment gateway masquerading as Wise / Payoneer',
      'No specific mention of creator videos or content'
    ]
  }
];

export const BRAND_DOMAINS: Record<string, string> = {
  'nordvpn': 'nordvpn.com',
  'nord security': 'nordsecurity.com',
  'razer': 'razer.com',
  'corsair': 'corsair.com',
  'epidemic sound': 'epidemicsound.com',
  'electronic arts': 'ea.com',
  'ea': 'ea.com',
  'logitech': 'logitech.com',
  'elgato': 'elgato.com',
  'steelseries': 'steelseries.com',
  'expressvpn': 'expressvpn.com',
  'surfshark': 'surfshark.com',
  'asus': 'asus.com',
  'msi': 'msi.com',
  'intel': 'intel.com',
  'amd': 'amd.com',
  'nvidia': 'nvidia.com',
  'sony': 'sony.com',
  'samsung': 'samsung.com',
  'apple': 'apple.com',
  'google': 'google.com',
  'squarespace': 'squarespace.com',
  'wix': 'wix.com',
  'skillshare': 'skillshare.com',
  'audible': 'audible.com',
  'hellofresh': 'hellofresh.com',
  'betterhelp': 'betterhelp.com',
  'manscaped': 'manscaped.com',
  'raycon': 'rayconglobal.com',
  'dbrand': 'dbrand.com'
};

export const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'info', 'click', 'work', 'link', 'buzz', 'gq', 'cf', 'tk', 'ml', 'rest', 'live', 'club', 'surf', 'vip', 'cam', 'bid', 'monster'
]);

export const FREEMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'protonmail.com', 'mail.ru', 'yandex.ru', 'aol.com', 'icloud.com', 'zoho.com'
]);
