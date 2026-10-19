import { validateUrl, validateEmail } from '../src/server/urlValidator.js';
import { evaluateDeterministicRules, isReservedTestingDomain } from '../src/server/rulesEngine.js';
import { ServerUrlReputationAdapter } from '../src/server/reputationAdapter.js';
import { generateEvidenceGroundedExplanation } from '../src/server/llmExplainer.js';
import { analyzeSponsorship, InputValidationError } from '../src/server/analysisEngine.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`, detail || '');
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n=== CREATORSHIELD AI: /api/analyze TEST SUITE ===\n');

  // -------------------------------------------------------------
  // Test A: Credential request plus 12-hour deadline → HIGH RISK
  // -------------------------------------------------------------
  console.log('[Test A] Credential request plus 12-hour deadline (NovaTech Gaming test case):');

  const testAPayload = {
    emailText: 'NovaTech Gaming partnership offer! Please sign in with your Google account through our creator portal to authorize your YouTube channel. Note: You have a strict 12-hour deadline to reply and complete registration.',
    senderEmail: 'partnerships@novatech-gaming.example',
    claimedBrand: 'NovaTech Gaming',
    submittedUrl: 'https://portal.novatech-gaming.example/auth/google-login'
  };

  const responseA = await analyzeSponsorship(testAPayload);

  assert(responseA.riskLevel === 'high', 'Test A: Risk level is HIGH RISK', `Got: ${responseA.riskLevel}`);
  assert(responseA.behavioralRisk === 'high', 'Test A: Behavioral risk is explicitly HIGH', `Got: ${responseA.behavioralRisk}`);
  
  const hasCredentialFinding = responseA.findings.some(f => 
    f.id === 'RULE_EXTERNAL_ACCOUNT_LOGIN_REQUEST' || f.id === 'RULE_CREDENTIAL_SOLICITATION' || f.id === 'RULE_COMPOUND_CREDENTIAL_AND_URGENCY'
  );
  assert(hasCredentialFinding, 'Test A: Identifies account-authorisation or credential request finding');

  const hasUrgencyFinding = responseA.findings.some(f => 
    f.id === 'RULE_SUSPICIOUS_URGENCY' || f.id === 'RULE_COMPOUND_CREDENTIAL_AND_URGENCY'
  );
  assert(hasUrgencyFinding, 'Test A: Identifies 12-hour artificial urgency finding');

  const hasCompoundFinding = responseA.findings.some(f => f.id === 'RULE_COMPOUND_CREDENTIAL_AND_URGENCY');
  assert(hasCompoundFinding, 'Test A: Identifies compound signal (account authorization + urgency)');

  assert(responseA.isTestData === true, 'Test A: Identifies .example domain as reserved test data');

  // -------------------------------------------------------------
  // Test B: Ordinary collaboration that explicitly disclaims credentials
  // -------------------------------------------------------------
  console.log('\n[Test B] Ordinary collaboration stating no password or verification code is needed:');

  const testBPayload = {
    emailText: 'Hi Sarah, we love your tech channel and would love to sponsor your next video. We will never ask for your password or verification code. Let us know if you are open to discussing rates.',
    senderEmail: 'collabs@audio-studio.com',
    claimedBrand: 'AudioStudio',
    submittedUrl: 'https://audio-studio.com'
  };

  const responseB = await analyzeSponsorship(testBPayload);

  assert(responseB.riskLevel !== 'high', 'Test B: Risk level is NOT high', `Got: ${responseB.riskLevel}`);
  const falselyTriggeredCred = responseB.findings.some(f => 
    f.id === 'RULE_CREDENTIAL_SOLICITATION' || f.id === 'RULE_EXTERNAL_ACCOUNT_LOGIN_REQUEST'
  );
  assert(!falselyTriggeredCred, 'Test B: Does NOT falsely flag credential solicitation on negative assurance');

  const hasNegativeDisclaimerFinding = responseB.findings.some(f => f.id === 'RULE_EXPLICIT_NO_CREDENTIAL_ASSURANCE' || f.id === 'RULE_NEGATIVE_CREDENTIAL_DISCLAIMER');
  assert(hasNegativeDisclaimerFinding, 'Test B: Recognizes explicit non-solicitation disclaimer');

  const claimsSafe = responseB.explanation.toLowerCase().includes('guaranteed safe') || responseB.explanation.toLowerCase().includes('100% safe');
  assert(!claimsSafe, 'Test B: Does NOT claim message is guaranteed safe');

  // -------------------------------------------------------------
  // Test C: Vague collaboration pitch with unverified link but no explicit credential request
  // -------------------------------------------------------------
  console.log('\n[Test C] Vague collaboration pitch with an unverified link (no credential request):');

  const testCPayload = {
    emailText: 'Dear Creator, we have an exciting opportunity. Please review the campaign overview at our external portal: https://unverified-portal-review.org/brief',
    senderEmail: 'marketing@unverified-agency-desk.org',
    claimedBrand: 'UnverifiedBrand',
    submittedUrl: 'https://unverified-portal-review.org/brief'
  };

  const responseC = await analyzeSponsorship(testCPayload);

  assert(responseC.riskLevel === 'medium' || responseC.riskLevel === 'unknown', 'Test C: Uncertain or elevated risk (medium or unknown)', `Got: ${responseC.riskLevel}`);
  const hasUnverifiedLinkFinding = responseC.findings.some(f => f.id === 'RULE_UNVERIFIED_EXTERNAL_LINK');
  assert(hasUnverifiedLinkFinding, 'Test C: Identifies unverified external portal link finding');

  // -------------------------------------------------------------
  // Test D: Reputation API unconfigured → NOT CHECKED
  // -------------------------------------------------------------
  console.log('\n[Test D] Reputation API unconfigured produces "NOT CHECKED":');

  const adapter = new ServerUrlReputationAdapter();
  const repStatus = await adapter.checkUrl('https://anydomain.example', 'anydomain.example');

  assert(repStatus.checked === false, 'Test D: checked flag is false when unconfigured');
  assert(repStatus.status === 'NOT CHECKED', 'Test D: status is strictly "NOT CHECKED"', `Got: ${repStatus.status}`);
  assert(!repStatus.details.includes('safe'), 'Test D: Details do not state an implicit safe result');

  // -------------------------------------------------------------
  // Test E: No triggered rules → do not automatically claim safe
  // -------------------------------------------------------------
  console.log('\n[Test E] No triggered rules: does not automatically claim the message is safe:');

  const testEPayload = {
    emailText: 'Hello, looking forward to catching up soon.',
    senderEmail: 'friend@personaldomain.com'
  };

  const responseE = await analyzeSponsorship(testEPayload);

  assert(responseE.riskLevel === 'low' || responseE.riskLevel === 'unknown', 'Test E: Produces low or unknown risk', `Got: ${responseE.riskLevel}`);
  assert(
    responseE.limitations.some(l => l.toLowerCase().includes('lack of known') || l.toLowerCase().includes('does not guarantee')),
    'Test E: Limitations explicitly declare that lack of signatures does not confirm safety'
  );
  assert(
    !responseE.explanation.toLowerCase().includes('this message is safe'),
    'Test E: Explanation avoids claiming the message is safe'
  );

  // -------------------------------------------------------------
  // Test F: Reserved testing domain recognition
  // -------------------------------------------------------------
  console.log('\n[Test F] Reserved testing domain recognition (.example, .test):');

  assert(isReservedTestingDomain('sponsor.example'), 'Identifies sponsor.example as reserved test domain');
  assert(isReservedTestingDomain('auth.test'), 'Identifies auth.test as reserved test domain');
  assert(isReservedTestingDomain('example.com'), 'Identifies example.com as reserved test domain');
  assert(!isReservedTestingDomain('nordvpn.com'), 'Does not classify nordvpn.com as test domain');

  // -------------------------------------------------------------
  // Test G: Malformed URL and Input Rejection
  // -------------------------------------------------------------
  console.log('\n[Test G] Malformed URL and Input Validation:');

  assert(!validateUrl('javascript:alert(1)').isValid, 'Rejects javascript: URI');
  assert(!validateUrl('https://bad domain with space.com').isValid, 'Rejects URL with spaces');
  assert(!validateUrl('not-a-url').isValid, 'Rejects non-URL string');
  assert(validateUrl('https://example.com/agreement').isValid, 'Accepts valid HTTPS URL');

  let rejectedMalformedUrl = false;
  try {
    await analyzeSponsorship({
      emailText: 'Pitch',
      submittedUrl: 'htp:/invalid-url'
    });
  } catch (err) {
    if (err instanceof InputValidationError && err.field === 'submittedUrl') {
      rejectedMalformedUrl = true;
    }
  }
  assert(rejectedMalformedUrl, 'analyzeSponsorship rejects malformed URL with 400 validation error');

  console.log(`\n=============================================`);
  console.log(`TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
