import { Finding, RiskLevel } from '../types/index.js';
import { BRAND_DOMAINS, SUSPICIOUS_TLDS, FREEMAIL_DOMAINS } from './threatData.js';

export interface DeterministicEvaluation {
  findings: Finding[];
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: 'low' | 'medium' | 'high';
  extractedDomain: string;
  officialDomain?: string;
  isTestData: boolean;
}

export function extractDomainSafely(urlOrEmail: string): string {
  if (!urlOrEmail) return '';
  const trimmed = urlOrEmail.trim();
  
  if (trimmed.includes('@')) {
    const parts = trimmed.split('@');
    return parts[parts.length - 1].toLowerCase().replace(/[>\]\)]/g, '');
  }
  
  try {
    let toParse = trimmed;
    if (!toParse.startsWith('http://') && !toParse.startsWith('https://')) {
      toParse = 'https://' + toParse;
    }
    const parsed = new URL(toParse);
    return parsed.hostname.toLowerCase();
  } catch {
    const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    return match ? match[1].toLowerCase() : '';
  }
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isReservedTestingDomain(domain: string): boolean {
  if (!domain) return false;
  const lower = domain.toLowerCase();
  return (
    lower.endsWith('.example') ||
    lower.endsWith('.test') ||
    lower.endsWith('.invalid') ||
    lower.endsWith('.localhost') ||
    lower === 'example.com' ||
    lower === 'example.org' ||
    lower === 'example.net' ||
    lower.endsWith('.example.com') ||
    lower.endsWith('.example.org') ||
    lower.endsWith('.example.net')
  );
}

/**
 * Evaluates deterministic cybersecurity rules against untrusted inputs.
 */
export function evaluateDeterministicRules(params: {
  emailText: string;
  senderEmail: string;
  claimedBrand: string;
  submittedUrl?: string;
}): DeterministicEvaluation {
  const { emailText, senderEmail, claimedBrand, submittedUrl } = params;
  const findings: Finding[] = [];
  let score = 5; // Baseline minimum

  const textLower = emailText.toLowerCase();
  const urlLower = (submittedUrl || '').toLowerCase();
  const senderDomain = extractDomainSafely(senderEmail);
  const urlDomain = submittedUrl ? extractDomainSafely(submittedUrl) : '';
  const primaryDomain = urlDomain || senderDomain;

  // Check for RFC 2606 / RFC 6761 reserved testing domains (.example, .test, etc.)
  const isTestData = isReservedTestingDomain(primaryDomain) || isReservedTestingDomain(senderDomain);
  if (isTestData) {
    findings.push({
      id: 'RULE_TEST_RESERVED_DOMAIN',
      category: 'other',
      severity: 'low',
      title: 'Reserved Testing Domain (Synthetic Test Data)',
      description: `Domain "${primaryDomain}" is an RFC-reserved testing domain (.example / .test / example.com). This pitch is evaluated as synthetic test data; findings describe behavioral patterns without asserting live malicious infrastructure.`,
      evidenceSnippet: primaryDomain
    });
  }

  // 1. SENDER / BRAND MISMATCHES
  let officialDomain: string | undefined = undefined;
  const cleanBrand = claimedBrand.trim().toLowerCase();

  if (cleanBrand) {
    const matchedBrandKey = Object.keys(BRAND_DOMAINS).find(k => 
      cleanBrand.includes(k) || k.includes(cleanBrand)
    );

    if (matchedBrandKey) {
      officialDomain = BRAND_DOMAINS[matchedBrandKey];
      const officialCore = officialDomain.split('.')[0];
      const senderCore = senderDomain.split('.')[0];

      // Freemail check while claiming an enterprise brand
      if (FREEMAIL_DOMAINS.has(senderDomain)) {
        score += 45;
        findings.push({
          id: 'RULE_SENDER_FREEMAIL',
          category: 'sender_brand_mismatch',
          severity: 'high',
          title: 'Free Webmail Service Impersonation',
          description: `Sender claims to represent brand "${claimedBrand}" but emailed from free webmail provider (@${senderDomain}). Corporate talent teams use authentic enterprise domains.`,
          evidenceSnippet: senderEmail
        });
      } else if (senderDomain && senderDomain !== officialDomain && !isTestData) {
        // Collect recognizable brand tokens (e.g. 'nord' from 'nordvpn', 'razer', etc.)
        const brandTokens = new Set<string>([
          officialCore,
          cleanBrand,
          ...cleanBrand.split(/[\s-_]+/).filter(t => t.length >= 4),
          ...officialCore.split(/[\s-_]+/).filter(t => t.length >= 4)
        ]);

        if (officialCore.endsWith('vpn') && officialCore.length > 5) {
          brandTokens.add(officialCore.replace(/vpn$/, ''));
        }

        const isLookalikeMatch = Array.from(brandTokens).some(token => 
          senderDomain.includes(token) || senderCore.includes(token)
        );

        if (isLookalikeMatch) {
          score += 45;
          findings.push({
            id: 'RULE_SENDER_LOOKALIKE',
            category: 'sender_brand_mismatch',
            severity: 'high',
            title: 'Typosquatted Brand Domain',
            description: `Sender domain "${senderDomain}" embeds brand keywords but does not match authentic domain "${officialDomain}".`,
            evidenceSnippet: senderDomain
          });
        } else {
          const dist = levenshteinDistance(senderCore, officialCore);
          if (dist > 0 && dist <= 2) {
            score += 45;
            findings.push({
              id: 'RULE_SENDER_TYPOSQUAT_DISTANCE',
              category: 'sender_brand_mismatch',
              severity: 'high',
              title: 'Levenshtein Typosquatting Similarity',
              description: `Sender domain "${senderDomain}" is only ${dist} character edit(s) away from official domain "${officialDomain}".`,
              evidenceSnippet: senderDomain
            });
          } else {
            score += 25;
            findings.push({
              id: 'RULE_SENDER_DOMAIN_MISMATCH',
              category: 'sender_brand_mismatch',
              severity: 'medium',
              title: 'Sender Domain Deviates from Claimed Brand',
              description: `Sender domain "${senderDomain}" does not match recognized brand domain "${officialDomain}".`,
              evidenceSnippet: `Sender: ${senderDomain} vs Official: ${officialDomain}`
            });
          }
        }
      }
    }
  }

  // 2. EXPLICIT NEGATIVE CREDENTIAL ASSURANCE (HYGIENE CHECK)
  // Handles cases like Test B: "we will never ask for your password or verification code"
  const negativeCredentialRegex = /\b(never\s+(ask|request)|not?\s+(ask|request|require)|no\s+(passwords?|verification\s*codes?|credentials?|otp)\s*(is|are)?\s*(needed|required|necessary))\b/i;
  const hasNegativeCredentialAssurance = negativeCredentialRegex.test(emailText);
  if (hasNegativeCredentialAssurance) {
    findings.push({
      id: 'RULE_NEGATIVE_CREDENTIAL_DISCLAIMER',
      category: 'credentials',
      severity: 'low',
      title: 'Explicit Non-Solicitation Statement',
      description: 'The email explicitly affirms that no password, 2FA code, or account verification is required. While positive hygiene, this alone does not guarantee authenticity.',
      evidenceSnippet: emailText.match(negativeCredentialRegex)?.[0]
    });
  }

  // 3. AFFIRMATIVE CREDENTIAL & ACCOUNT-AUTHORIZATION REQUESTS
  let hasCredentialRequest = false;
  let credentialSnippet: string | undefined = undefined;

  // Check affirmative direct password / OTP requests
  const directCredentialRegex = /\b(enter|provide|send|reply with|share|submit|need|require)\s+(your\s+)?(google\s+)?(password|passcode|otp|2fa\s*code|verification\s*code|recovery\s*code|session\s*cookie)\b/i;
  const directMatch = emailText.match(directCredentialRegex);

  // Check account-authorization / Google login through external portals
  const portalLoginRegex = /\b(log\s*in|sign\s*in|authenticate|authorize|authorise|connect|link)\s+(with|via|using|to)?\s*(your\s+)?(google(\s+account)?|youtube(\s+channel|\s+account)?)\b|\b(google|youtube)\s+(account\s+)?(log\s*in|sign\s*in|authentication|authorization|authorisation)\b|\b(portal|link)\s+to\s+(log\s*in|sign\s*in|authenticate)\b|\b(log\s*in|sign\s*in|authenticate)\s+through\s+(our|the|this)?\s*(external\s+)?(sponsorship\s+portal|portal|link)\b/i;
  const portalMatch = emailText.match(portalLoginRegex);

  if (!hasNegativeCredentialAssurance) {
    if (directMatch) {
      hasCredentialRequest = true;
      credentialSnippet = directMatch[0];
      score += 55;
      findings.push({
        id: 'RULE_CREDENTIAL_SOLICITATION',
        category: 'credentials',
        severity: 'high',
        title: 'Credential or Session Token Solicitation',
        description: 'Email explicitly requests administrative security credentials (passwords, 2FA codes, recovery tokens, or session keys). Verified brand deals never request account credentials.',
        evidenceSnippet: directMatch[0]
      });
    }

    if (portalMatch) {
      hasCredentialRequest = true;
      credentialSnippet = credentialSnippet || portalMatch[0];
      score += 55;
      findings.push({
        id: 'RULE_EXTERNAL_ACCOUNT_LOGIN_REQUEST',
        category: 'credentials',
        severity: 'high',
        title: 'External Account Login / OAuth Authorization Request',
        description: 'Message directs the creator to log in or authenticate with their Google or YouTube account through an external portal. Third-party sponsorship agreements should never require administrative Google authentication on unverified domains.',
        evidenceSnippet: portalMatch[0]
      });
    }
  }

  // 4. SUSPICIOUS ARTIFICIAL URGENCY
  // Supports any hourly deadline (e.g. 12-hour, 24-hour, within 12 hours)
  let hasUrgency = false;
  let urgencySnippet: string | undefined = undefined;
  const urgencyRegex = /\b(within\s+\d+\s*hours?|\d+\s*[-]?hours?\s*(deadline|window|left|to reply|time limit)|urgent|urgently|immediate\s+reply|strict deadline|today only|expires today|act fast|time-sensitive|limited slots?)\b/i;
  const urgencyMatch = emailText.match(urgencyRegex);
  if (urgencyMatch) {
    hasUrgency = true;
    urgencySnippet = urgencyMatch[0];
    score += 25;
    findings.push({
      id: 'RULE_SUSPICIOUS_URGENCY',
      category: 'urgency',
      severity: 'medium',
      title: 'Artificial Time Pressure / Compressed Deadline',
      description: 'The proposal imposes a tight, artificial deadline (e.g. 12 or 24 hours) to induce hasty compliance before independent security vetting can take place.',
      evidenceSnippet: urgencyMatch[0]
    });
  }

  // 5. COMPOUND SIGNAL: ACCOUNT LOGIN / CREDENTIAL REQUEST + ARTIFICIAL URGENCY
  // Test A & NovaTech Gaming scenario
  if (hasCredentialRequest && hasUrgency) {
    score += 50;
    findings.push({
      id: 'RULE_COMPOUND_CREDENTIAL_AND_URGENCY',
      category: 'credentials',
      severity: 'high',
      title: 'High-Pressure Credential Harvesting Pattern',
      description: 'The pitch combines a request for external account authentication/login with an urgent deadline. This high-pressure combination is a classic indicator of credential harvesting campaigns designed to bypass verification.',
      evidenceSnippet: `${credentialSnippet} + ${urgencySnippet}`
    });
  }

  // 6. UPFRONT PAYMENTS / FINANCIAL TRAPS / UNREALISTIC OFFERS
  const feeRegex = /\b(advance fee|insurance deposit|processing fee|wire transfer fee|registration fee|pay via crypto|bitcoin deposit|send \$[0-9]+ first)\b/i;
  const feeMatch = emailText.match(feeRegex);
  if (feeMatch) {
    score += 45;
    findings.push({
      id: 'RULE_ADVANCE_FEE_SOLICITATION',
      category: 'upfront_payment',
      severity: 'high',
      title: 'Advance Fee or Upfront Payment Request',
      description: 'Lure requests the creator to pay an upfront "insurance", "processing", or "registration" fee, a classic hallmark of advance-fee sponsorship fraud.',
      evidenceSnippet: feeMatch[0]
    });
  }

  const excessivePayoutRegex = /\b(\$[1-9][0-9],[0-9]{3}|\$[5-9][0-9]{3}\s*(for|per)\s*(30s|60s|shoutout|short|reel)|100% upfront wire)\b/i;
  const payoutMatch = emailText.match(excessivePayoutRegex);
  if (payoutMatch && !feeMatch) {
    score += 15;
    findings.push({
      id: 'RULE_DISPROPORTIONATE_FINANCIAL_LURE',
      category: 'upfront_payment',
      severity: 'medium',
      title: 'Unusually High Financial Bait',
      description: 'Financial compensation offered appears disproportionately high for standard creator integrations, a common psychological hook used by malware distribution rings.',
      evidenceSnippet: payoutMatch[0]
    });
  }

  // 7. SUSPICIOUS URL PATTERNS & UNVERIFIED EXTERNAL LINKS
  if (submittedUrl) {
    // a. Malicious Executable / Archive Extension
    const executableRegex = /\.(scr|exe|bat|cmd|vbs|iso|ps1|apk|msi)(\?.*)?$/i;
    const isDirectExecutable = executableRegex.test(submittedUrl);
    if (isDirectExecutable) {
      score += 50;
      findings.push({
        id: 'RULE_URL_EXECUTABLE_PAYLOAD',
        category: 'suspicious_url',
        severity: 'high',
        title: 'Direct Executable / Script Download Link',
        description: 'URL targets an executable binary, script, or disk image (.exe, .scr, .bat, .iso). Legitimate sponsorship contracts are never delivered as executable binaries.',
        evidenceSnippet: submittedUrl
      });
    }

    // b. Password-protected Archive Mention
    const isArchive = /\.(zip|rar|7z|tar)(\?.*)?$/i.test(submittedUrl) || 
      /(mega\.nz|mediafire\.com|drive\.google\.com|wetransfer\.com|dropbox\.com)/i.test(submittedUrl);
    const hasPasswordMention = /\b(password|pass|pwd|code)[:=\s]+["']?[a-zA-Z0-9!@#]+["']?/i.test(emailText);

    if (isArchive && hasPasswordMention) {
      score += 50;
      findings.push({
        id: 'RULE_PASSWORD_PROTECTED_ARCHIVE',
        category: 'suspicious_url',
        severity: 'high',
        title: 'Password-Protected Archive Evasion',
        description: 'Email provides a cloud or direct archive link alongside an extraction password. Infostealers routinely use encrypted archives to prevent email gateway antivirus inspection.',
        evidenceSnippet: 'Archive URL with password string in body'
      });
    }

    // c. IP-based URL
    try {
      const parsedUrl = new URL(submittedUrl.startsWith('http') ? submittedUrl : 'https://' + submittedUrl);
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(parsedUrl.hostname)) {
        score += 35;
        findings.push({
          id: 'RULE_URL_RAW_IP_HOST',
          category: 'suspicious_url',
          severity: 'high',
          title: 'Direct IP Host Address in Link',
          description: `URL points directly to an IP address (${parsedUrl.hostname}) instead of a registered domain name.`,
          evidenceSnippet: parsedUrl.hostname
        });
      }
    } catch {}

    // d. High Abuse / Suspicious TLD
    const urlTld = urlDomain.split('.').pop() || '';
    if (SUSPICIOUS_TLDS.has(urlTld.toLowerCase())) {
      score += 25;
      findings.push({
        id: 'RULE_URL_SUSPICIOUS_TLD',
        category: 'suspicious_url',
        severity: 'medium',
        title: 'High-Abuse Top Level Domain',
        description: `Link domain uses ".${urlTld}", a top-level domain frequently associated with automated disposable phishing infrastructure.`,
        evidenceSnippet: `.${urlTld}`
      });
    }

    // e. Redirection to Telegram / Off-platform chat
    if (/(t\.me|telegram|whatsapp|wa\.me|discord\.gg)/i.test(submittedUrl + ' ' + emailText)) {
      score += 25;
      findings.push({
        id: 'RULE_CHAT_REDIRECTION',
        category: 'suspicious_url',
        severity: 'medium',
        title: 'Off-Platform Messenger Redirection',
        description: 'Attempts to redirect creator communication away from email into instant messaging platforms (Telegram/WhatsApp) to evade audit logs.',
        evidenceSnippet: 'Telegram / Chat link'
      });
    }

    // f. Vague collaboration pitch with unverified external portal link (Test C)
    if (!hasCredentialRequest && !isDirectExecutable && !isArchive && (!cleanBrand || !officialDomain)) {
      score += 20;
      findings.push({
        id: 'RULE_UNVERIFIED_EXTERNAL_LINK',
        category: 'suspicious_url',
        severity: 'medium',
        title: 'Unverified External Portal Link',
        description: 'Communication references an unverified external portal link without corroboration from a recognized official brand domain. Presents elevated vetting risk.',
        evidenceSnippet: submittedUrl
      });
    }
  }

  // 8. FINAL DETERMINISTIC RISK LEVEL CLASSIFICATION
  // Rule: High severity findings or compound signals MUST produce HIGH RISK
  score = Math.min(100, Math.max(0, score));

  const hasHighSeverityFinding = findings.some(f => f.severity === 'high');
  const hasMediumSeverityFinding = findings.some(f => f.severity === 'medium');

  let riskLevel: RiskLevel;
  if (hasHighSeverityFinding || score >= 50) {
    riskLevel = 'high';
  } else if (hasMediumSeverityFinding || score >= 20) {
    riskLevel = 'medium';
  } else if (findings.length === 0 && !emailText.trim() && !submittedUrl) {
    riskLevel = 'unknown';
  } else {
    riskLevel = 'low';
  }

  // 9. CONFIDENCE IN ASSESSMENT
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if ((senderEmail && submittedUrl && emailText) || hasHighSeverityFinding) {
    confidence = 'high';
  } else if (!submittedUrl && !senderEmail) {
    confidence = 'low';
  }

  return {
    findings,
    riskScore: score,
    riskLevel,
    confidence,
    extractedDomain: primaryDomain,
    officialDomain,
    isTestData
  };
}
