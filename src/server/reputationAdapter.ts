import { ReputationStatus } from '../types/index.js';

export interface ReputationAdapter {
  checkUrl(targetUrl: string, domain: string): Promise<ReputationStatus>;
}

/**
 * Server-side URL Reputation Service Adapter.
 * Queries configured third-party reputation providers (e.g. Google Safe Browsing or custom threat API)
 * when valid API credentials are provided in environment variables.
 *
 * If credentials are not configured, it transparently returns 'not_configured'
 * without inventing scan results or fabricated reputation scores.
 */
export class ServerUrlReputationAdapter implements ReputationAdapter {
  private safeBrowsingKey: string | undefined;
  private genericReputationKey: string | undefined;

  constructor() {
    this.safeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    this.genericReputationKey = process.env.URL_REPUTATION_API_KEY;
  }

  async checkUrl(targetUrl: string, domain: string): Promise<ReputationStatus> {
    if (!targetUrl && !domain) {
      return {
        checked: false,
        service: 'External URL Threat Intelligence',
        status: 'unavailable',
        details: 'No URL or domain was provided for external reputation querying.',
        source: 'server_adapter'
      };
    }

    // Case 1: Google Safe Browsing API is configured
    if (this.safeBrowsingKey) {
      try {
        const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.safeBrowsingKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            client: { clientId: 'CreatorShieldAI', clientVersion: '1.0.0' },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url: targetUrl || `https://${domain}` }]
            }
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return {
            checked: false,
            service: 'Google Safe Browsing v4',
            status: 'error',
            details: `Safe Browsing API responded with HTTP ${response.status}`,
            source: 'google_safe_browsing'
          };
        }

        const data = await response.json();
        const matches = data.matches || [];

        if (matches.length > 0) {
          const threatTypes = matches.map((m: any) => m.threatType).join(', ');
          return {
            checked: true,
            service: 'Google Safe Browsing v4',
            status: 'malicious',
            details: `External database match: Flagged as ${threatTypes}`,
            source: 'google_safe_browsing'
          };
        }

        return {
          checked: true,
          service: 'Google Safe Browsing v4',
          status: 'clean',
          details: 'No active threat entries matched in Google Safe Browsing database.',
          source: 'google_safe_browsing'
        };
      } catch (err: any) {
        return {
          checked: false,
          service: 'Google Safe Browsing v4',
          status: 'error',
          details: `External reputation query failed: ${err?.message || 'Network timeout'}`,
          source: 'google_safe_browsing'
        };
      }
    }

    // Case 2: Generic URL Reputation API Key is configured
    if (this.genericReputationKey) {
      // Configured generic key adapter placeholder
      return {
        checked: false,
        service: 'Configured Reputation Provider',
        status: 'unavailable',
        details: 'Custom reputation endpoint is not reached; verify URL_REPUTATION_ENDPOINT environment variable.',
        source: 'custom_reputation_adapter'
      };
    }

    // Case 3: No external credentials are configured
    // STRICT RULE: Do not invent scan results. An unconfigured reputation service must produce 'NOT CHECKED'.
    return {
      checked: false,
      service: 'External Threat Intelligence API',
      status: 'NOT CHECKED',
      details: 'No external URL reputation API credentials (URL_REPUTATION_API_KEY or GOOGLE_SAFE_BROWSING_API_KEY) are configured. External URL reputation was NOT CHECKED (no live scan performed, no safe result assumed).',
      source: 'server_adapter'
    };
  }
}
