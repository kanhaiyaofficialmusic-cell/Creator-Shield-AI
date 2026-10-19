/**
 * URL and Input Validation for CreatorShield AI
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  field?: string;
}

/**
 * Validates a submitted URL strictly.
 * Rejects malformed URLs, non-HTTP/HTTPS schemes, whitespace, and missing hostnames.
 */
export function validateUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, field: 'submittedUrl', error: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();

  // Whitespace within URL is invalid
  if (/\s/.test(trimmed)) {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: contains whitespace characters.' };
  }

  // Check for disallowed or dangerous protocols
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') || 
    lower.startsWith('data:') || 
    lower.startsWith('vbscript:') || 
    lower.startsWith('file:')
  ) {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: unsupported or dangerous URI scheme.' };
  }

  let parsed: URL;
  try {
    // If user provided a bare domain like "example.com/path", we can attempt parsing or enforce protocol
    let urlToParse = trimmed;
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      // Must be a plausible domain before auto-prepending
      if (!/^[a-zA-Z0-9][a-zA-Z0-9-._]+[a-zA-Z0-9]\.[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed)) {
        return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: invalid domain syntax or protocol.' };
      }
      urlToParse = 'https://' + urlToParse;
    }

    parsed = new URL(urlToParse);
  } catch {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: failed RFC 3986 parse.' };
  }

  // Must have http: or https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: only HTTP and HTTPS protocols are accepted.' };
  }

  // Must have a valid hostname (no empty host, must contain at least one dot or be localhost/valid IP)
  const host = parsed.hostname;
  if (!host || host.length < 3) {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: missing or invalid hostname.' };
  }

  // Check host characters
  if (!/^[a-zA-Z0-9.-]+$/i.test(host)) {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: invalid characters in hostname.' };
  }

  // Check TLD or valid IP
  const isIpv4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(host);
  if (!isIpv4 && !host.includes('.')) {
    return { isValid: false, field: 'submittedUrl', error: 'Malformed URL: hostname lacks top-level domain.' };
  }

  return { isValid: true };
}

/**
 * Validates an email address.
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, field: 'senderEmail', error: 'Sender email must be a non-empty string.' };
  }

  const trimmed = email.trim();
  // Standard RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, field: 'senderEmail', error: 'Malformed email address: invalid syntax.' };
  }

  return { isValid: true };
}
