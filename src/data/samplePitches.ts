export interface SamplePitch {
  id: string;
  label: string;
  type: 'MALWARE_ARCHIVE' | 'TOKEN_HIJACK' | 'LEGITIMATE' | 'PHISHING_LOGIN';
  brand: string;
  senderEmail: string;
  url: string;
  subject: string;
  emailText: string;
  threatSummary: string;
}

export const SAMPLE_PITCHES: SamplePitch[] = [
  {
    id: 'sample-lumma',
    label: 'LummaStealer Fake Sponsorship (NordVPN)',
    type: 'MALWARE_ARCHIVE',
    brand: 'NordVPN',
    senderEmail: 'partnerships@nord-security-deals.com',
    url: 'https://nord-security-deals.com/download/NordVPN_Q4_Creator_Kit.zip',
    subject: 'Paid Sponsorship Proposal: NordVPN x Your Channel ($8,500)',
    emailText: `Hello Channel Owner,

We represent the global influencer marketing team at NordVPN. We have closely monitored your recent uploads and would love to sponsor a 60-second dedicated integration in your upcoming video.

Our allocated budget for your channel is $8,500 USD paid 50% upfront upon contract execution via wire or cryptocurrency.

To review our talking points, guidelines, and exclusive promotion build, please download the agreement kit from our partnership portal below:
https://nord-security-deals.com/download/NordVPN_Q4_Creator_Kit.zip

Note: For security and confidentiality during pre-release campaigns, the archive is encrypted. 
Password to extract: 2026

Please sign and return page 3 within 48 hours to lock in this campaign tier.

Best regards,
Marcus Vance
Senior Talent Acquisitions Lead
Nord Security Partners`,
    threatSummary: 'Typical password-protected ZIP archive housing a disguised .scr/.exe LummaStealer binary to bypass Google Workspace / Outlook gateway inspection.'
  },
  {
    id: 'sample-razer',
    label: 'Razer Hardware Beta + Telegram Redirection',
    type: 'TOKEN_HIJACK',
    brand: 'Razer',
    senderEmail: 'collabs.razer.talent@gmail.com',
    url: 'https://mega.nz/file/razer-synapse-v4-preview#key921',
    subject: 'Urgent: Razer Synapse 4 Pre-Release Creator Test & $5,000 Sponsorship',
    emailText: `Dear Creator,

Razer is selecting 25 top tier digital creators for an unreleased hardware and software preview. We are offering $5,000 cash plus a Razer Viper V3 Pro and BlackShark V2 headset.

In order to participate, you must install our pre-production benchmark utility from Mega to test compatibility with your streaming rig:
https://mega.nz/file/razer-synapse-v4-preview#key921

Once downloaded, run the installer to generate your hardware diagnostic token. 

Because our corporate email server is experiencing high traffic, please immediately message our talent lead directly on Telegram @razer_affiliates_desk with your diagnostic output to receive the wire payment.

Cheers,
Razer Influencer Relations Team`,
    threatSummary: 'Free Gmail sender domain, off-platform Telegram relocation, and unsigned executable delivered via cloud storage.'
  },
  {
    id: 'sample-epidemic',
    label: 'Epidemic Sound Fake Copyright Phishing',
    type: 'PHISHING_LOGIN',
    brand: 'Epidemic Sound',
    senderEmail: 'creator-licensing@epidemic-creator-portal.net',
    url: 'https://epidemic-creator-portal.net/auth/verify-license',
    subject: 'Notice: Epidemic Sound Ambassador Clearance & Licensing Grant',
    emailText: `Greetings,

Our automated content monitoring identified Epidemic Sound audio catalog assets utilized in your recent channel uploads. 

As part of our 2026 Creator Growth Initiative, we would like to grant your channel a complimentary 1-Year Commercial Royalty License plus a $2,500 onboarding stipend.

To claim your license grant and prevent automated Content ID claims, sign in through our verified creator portal within 24 hours:
https://epidemic-creator-portal.net/auth/verify-license

You will need to authenticate with your primary Google / YouTube channel administrator credentials to bind the license certificate.

Epidemic Sound Copyright Operations`,
    threatSummary: 'Credential & OAuth session token phishing kit targeting YouTube creator Google accounts with false urgency.'
  },
  {
    id: 'sample-legit',
    label: 'Legitimate Brand Deal (Audible Verification)',
    type: 'LEGITIMATE',
    brand: 'Audible',
    senderEmail: 'creatorpartnerships@audible.com',
    url: 'https://www.audible.com',
    subject: 'Partnership Inquiry: Audible Audiobooks',
    emailText: `Hi there,

My name is Sarah Chen from the Creator Partnerships team at Audible. I've been following your channel's deep dive analyses, especially your recent discussion on productivity and tech history.

We think Audible would be a natural fit for your audience and would love to explore a potential 60-second mid-roll sponsor integration for next month.

If you are open to discussing opportunities, could you share your current media kit or typical integration rates? We never send executable files or ask for login credentials—all our standard contracts are reviewed and signed securely via DocuSign through our verified corporate account.

Looking forward to hearing from you!

Best,
Sarah Chen
Creator Partnerships Specialist | Audible Inc.
sarah.chen@audible.com
https://www.audible.com`,
    threatSummary: 'Legitimate outreach from official corporate domain (@audible.com), no executable links, no passworded archives, standard business workflow.'
  }
];
