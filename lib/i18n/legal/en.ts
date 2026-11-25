import type { LegalDocs } from './types';

export const en: LegalDocs = {
  privacy: {
    description:
      'How Slate processes the personal data of its users, under Regulation (EU) 2016/679 (GDPR).',
    updated: 'Last updated: 10 November 2026',
    intro: [
      'This policy describes how the personal data of people who use Slate (the “Service”) is processed, in accordance with Article 13 of Regulation (EU) 2016/679 (“GDPR”) and Italian Legislative Decree 196/2003 as amended by Legislative Decree 101/2018 (the “Italian Privacy Code”).',
    ],
    sections: [
      {
        title: "Calendar data in the Slate app",
        blocks: [
          "The Slate website does not read or write your Google Calendar or your phone calendar.",
          "The Slate app for Android can show and change events in the calendars on your phone, and show events from your Google account, only after you give it permission. This data stays on the device. It is not sent to us or to any server run by us.",
          "If you turn on Google sync in the app, blocks and shifts you create in Slate are copied to a calendar named Slate in your Google account, using your own sign-in. Slate does not keep your Google access token on any server. You can revoke access in your Google account at any time.",
          "If you run your own Slate server, it receives only the blocks, shifts and settings you choose to sync with it. Events from your phone calendars or from Google are never sent to it.",
        ],
      },
      {
        title: '1. Data controller',
        blocks: [
          'The data controller is **Matteo Genesio**, who can be reached by email at **egenesio@proton.me**.',
        ],
      },
      {
        title: '2. Data we collect',
        blocks: [
          'We process the following categories of personal data:',
          [
            '**Account data**: your email address and, if you sign up with email and password, your password (stored in encrypted form and never readable by us). If you sign in with Google, we receive from Google your email address, name and profile picture, as authorised by you on the Google consent screen.',
            '**Service usage data**: the content you create in Slate (time-block titles, category, start and end times, colour, recurrence), which is needed for the weekly planner to work.',
            '**Technical data**: IP address, browser type and device, collected automatically by our infrastructure providers (Vercel, Supabase) for the security and operation of the service.',
            '**Cookies**: we only use technical cookies needed to keep you signed in (authentication). We do not use profiling, analytics or third-party marketing cookies.',
          ],
        ],
      },
      {
        title: '3. Purposes and legal basis of processing',
        blocks: [
          [
            '**Providing the Service** (creating your account, syncing data between devices): legal basis Art. 6(1)(b) GDPR, performance of a contract to which the data subject is party.',
            '**Security and the prevention of abuse and fraud**: legal basis Art. 6(1)(f) GDPR, legitimate interest of the controller.',
            '**Essential service communications** (e.g. notifications about your account): legal basis Art. 6(1)(b) GDPR.',
          ],
          'We do not currently carry out direct marketing, profiling or advertising based on your data.',
        ],
      },
      {
        title: '4. Recipients of the data and third-party providers',
        blocks: [
          'Your data is processed by third-party providers acting as data processors (Art. 28 GDPR), bound by contract to process the data only for the purposes set out above:',
          [
            '**Supabase Inc.** — database hosting and authentication. Data is stored on servers located in Ireland (EU).',
            '**Vercel Inc.** — hosting of the web application. A company based in the United States.',
            '**Google LLC** — authentication through a Google account (OAuth), only if you choose to sign in this way. A company based in the United States.',
          ],
        ],
      },
      {
        title: '5. Transfers of data outside the EU',
        blocks: [
          'Vercel Inc. and Google LLC are based in the United States. Data is transferred to these providers on the basis of appropriate safeguards under Chapter V of the GDPR, such as the Standard Contractual Clauses approved by the European Commission and/or participation in the EU-US Data Privacy Framework, where applicable. You can ask the controller for more information about these safeguards.',
        ],
      },
      {
        title: '6. Retention period',
        blocks: [
          'Your account data and the content you create are kept for as long as you have an active Slate account. If you ask for your account to be deleted, your personal data and the related content are deleted within 30 days, except for anything that must be kept longer to comply with legal obligations. Technical logs are kept for a maximum of 12 months.',
        ],
      },
      {
        title: '7. Your rights',
        blocks: [
          'As a data subject, you have the right to:',
          [
            'access your personal data (Art. 15 GDPR);',
            'have it corrected if it is inaccurate (Art. 16 GDPR);',
            'have it erased, within the limits set by law (Art. 17 GDPR);',
            'have its processing restricted (Art. 18 GDPR);',
            'receive your data in a structured, readable format (portability, Art. 20 GDPR);',
            'object to processing based on legitimate interest (Art. 21 GDPR);',
            'withdraw at any time any consent you have given, without affecting the lawfulness of processing already carried out.',
          ],
          'You can exercise these rights at any time by writing to **egenesio@proton.me**. You also have the right to lodge a complaint with the competent supervisory authority:',
          'Italian Data Protection Authority (Garante per la protezione dei dati personali) — Piazza Venezia, 11, 00187 Rome, Italy — www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Minors',
        blocks: [
          'The Service is not intended for children under 14 (the age of digital consent under Art. 2-quinquies of the Italian Privacy Code). We do not knowingly collect data from children under that age; if we become aware that we have collected such data, we will delete it.',
        ],
      },
      {
        title: '9. Data security',
        blocks: [
          'We take appropriate technical and organisational measures to protect your data, including encrypted connections (TLS/HTTPS), separation of data between users through Row Level Security at database level, and access to data limited to authorised personnel.',
        ],
      },
      {
        title: '10. Changes to this policy',
        blocks: [
          'This policy may be updated over time. If we make substantial changes, we will let you know through the Service or by email before the changes take effect.',
        ],
      },
      {
        title: '11. Contact',
        blocks: [
          'For any question about this policy or about the processing of your data, write to **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Terms and conditions for using the Slate Service.',
    updated: 'Last updated: 10 November 2026',
    intro: [
      'These Terms of Service (“Terms”) govern the use of Slate (the “Service”), provided by **Matteo Genesio** (“the Owner”, “we”). By creating an account or using the Service, you accept these Terms in full.',
    ],
    sections: [
      {
        title: '1. Description of the Service',
        blocks: [
          'Slate is a web application for organising your week in time blocks (study, work, classes and other categories). The Service is currently offered free of charge and is under active development: features may be added, changed or removed over time. In the future we may introduce a paid plan with additional features (“Pro”); if we do, you will be shown specific terms before any charge is made, and your use of the existing free features will not be affected.',
        ],
      },
      {
        title: '2. Registration and requirements',
        blocks: [
          'To use Slate you must create an account with email and password or by signing in with Google. You must be at least 14 years old to create an account. You are responsible for keeping your credentials confidential and for all activity carried out through your account.',
        ],
      },
      {
        title: '3. Permitted use',
        blocks: [
          'By using Slate you agree not to:',
          [
            'use the Service for illegal or unauthorised purposes;',
            'attempt to gain unauthorised access to the data or systems of the Service;',
            'interfere with the normal operation of the Service (e.g. through attacks, automated scraping or intentional overloading);',
            'upload content that is illegal, offensive or infringes the rights of others.',
          ],
        ],
      },
      {
        title: '4. Your content',
        blocks: [
          'You keep full ownership of the content you put into Slate (block titles, times, categories). You grant us a limited, non-exclusive licence to store and process that content solely in order to provide the Service to you (for example, syncing it between your devices). We claim no rights over your content and do not share it with third parties other than as set out in our [Privacy Policy](/privacy).',
        ],
      },
      {
        title: '5. Intellectual property in the Service',
        blocks: [
          'The code, the design, the “Slate” brand and every other part of the Service that is not your content remain the property of the Owner and are protected by the applicable intellectual property laws. You may not copy, modify or distribute them without written permission.',
        ],
      },
      {
        title: '6. Availability of the Service',
        blocks: [
          'The Service is provided “as is”, with no guarantee of continuity, freedom from errors or fitness for a particular purpose. As it is a product under active development, there may be interruptions, maintenance or changes to features. We recommend that you do not treat Slate as your only source of critical information about your commitments.',
        ],
      },
      {
        title: '7. Limitation of liability',
        blocks: [
          'To the fullest extent permitted by applicable law, the Owner is not liable for indirect damages, loss of data or loss of profit arising from the use of, or inability to use, the Service. Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including the mandatory rights granted to consumers by the Italian Consumer Code (Legislative Decree 206/2005).',
        ],
      },
      {
        title: '8. Suspension and termination of the account',
        blocks: [
          'You can delete your account at any time; on deletion, your data will be handled as described in our [Privacy Policy](/privacy). We reserve the right to suspend or terminate accounts that breach these Terms, giving you notice where reasonably possible.',
        ],
      },
      {
        title: '9. Changes to the Terms',
        blocks: [
          'We may update these Terms over time. If we make substantial changes, we will let you know through the Service or by email reasonably in advance of their taking effect.',
        ],
      },
      {
        title: '10. Governing law and jurisdiction',
        blocks: [
          'These Terms are governed by Italian law. If you use the Service as a consumer resident in the European Union, you have the right to bring proceedings before the courts of the place where you live, under the mandatory rules that protect consumers. You can also use the European online dispute resolution (ODR) platform, available at [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '11. Contact',
        blocks: ['For questions about these Terms, write to **egenesio@proton.me**.'],
      },
    ],
  },
};
