import type { LegalDocs } from './types';

export const en: LegalDocs = {
  privacy: {
    description:
      'How Slate processes the personal data of its users, under Regulation (EU) 2016/679 (GDPR).',
    updated: 'Last updated: 28 November 2026',
    intro: [
      'This policy describes how personal data is handled by Slate: the Android and iOS app and the Slate website. It is written in accordance with Article 13 of Regulation (EU) 2016/679 (“GDPR”) and Italian Legislative Decree 196/2003 as amended by Legislative Decree 101/2018 (the “Italian Privacy Code”).',
    ],
    sections: [
      {
        title: 'How the Slate app handles your data',
        blocks: [
          'The Slate app keeps your data on your phone. It has no account and no server run by us: your blocks, shifts, rotations, settings and reminders are stored only on the device. We do not receive them. The app contains no analytics, advertising or tracking.',
          [
            '**Phone calendars** (Android and iOS). If you allow calendar access, the app shows events from the calendars on your phone and, if you choose, copies your blocks and shifts into a calendar. This happens on the device; nothing is sent to us.',
            '**Google Calendar** (optional, Android; not yet offered on iOS). If you sign in with Google and turn on sync, the app connects directly from your phone to Google’s Calendar service, with the permissions you approve: reading and writing events, and listing your calendars. Blocks are copied into a calendar named “Slate” in your Google account, and your Google events are shown next to them. The Google access token is kept on your device and is not sent to any server of ours. Slate’s use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including its Limited Use requirements. You can revoke access at any time in your Google account or by turning off sync in the app.',
            '**Reminders and notifications**. Reminders before events and shifts are scheduled and shown by your phone. They do not use any server. You can change or turn them off in Settings › Notifications.',
            '**Update check** (Android). About every six hours the app asks GitHub (api.github.com) whether a newer release of Slate exists. When you choose to install an update, the APK is downloaded from GitHub and its SHA-256 checksum is verified before installation. GitHub receives the technical data that any such request carries, such as your IP address, under its own privacy statement.',
            '**Ko-fi**. The support link opens ko-fi.com in your browser. The app sends nothing to Ko-fi. Ko-fi’s privacy policy applies to any donation you make there.',
            '**Backups**. You can export your data to a file and import it again. The file is saved where you choose and is never sent to us. Anyone who has the file can read it, so keep it safe.',
          ],
        ],
      },
      {
        title: 'The Slate website',
        blocks: [
          'The website runs the same planner in your browser. It has no accounts and no sign-in. Your blocks, shifts, rotations and settings are stored in your browser’s local storage and are not sent to us. The only things the website sends to our servers are the reminders you turn on, as described below.',
        ],
      },
      {
        title: '1. Data controller',
        blocks: [
          'The data controller is **Matteo Genesio**, who can be reached by email at **egenesio@proton.me**. For data that exists only on your device, as described above, we are not able to access it, and the app does not transmit it to us.',
        ],
      },
      {
        title: '2. Data we collect',
        blocks: [
          'For reminders on the website we process the following categories of personal data:',
          [
            '**Reminder data**: a random device key kept only in your browser. We store only a cryptographic hash of it, never the key. With it, the reminder items your browser sends us: the titles and start times of your blocks and shifts for the next two weeks, the lead time you chose, and the notification settings. The title is part of the notification shown on your device.',
            '**Push subscription**: the address your browser gives for web push notifications (endpoint and encryption keys), with the language of the app.',
            '**Technical data**: IP address and technical request data, collected by our infrastructure providers (Vercel, Supabase) for the security and operation of the service.',
            '**Storage**: the website keeps your settings and your planner data in your browser’s local storage. It sets no tracking, analytics or marketing cookies.',
          ],
          'For the app we collect no personal data. The data you enter in the app is described above and stays on your device.',
        ],
      },
      {
        title: '3. Purposes and legal basis of processing',
        blocks: [
          [
            '**Providing reminders** you turn on: Art. 6(1)(b) GDPR, performance of a contract.',
            '**Security and the prevention of abuse and fraud**: Art. 6(1)(f) GDPR, legitimate interest of the controller.',
            '**Turning reminders on and off**: Art. 6(1)(a) GDPR, your consent, which you can withdraw at any time.',
            '**Phone calendar, Google Calendar and notification features in the app**: Art. 6(1)(a) GDPR, your consent, given when you grant the permission or turn the feature on. You can withdraw it at any time in the app or in your phone’s settings.',
            '**Update checks and the new-version notice** (Android): Art. 6(1)(f) GDPR, the legitimate interest in letting you install the current version. You can turn the notice off in Settings › Notifications.',
          ],
          'We do not carry out direct marketing, profiling or advertising based on your data.',
        ],
      },
      {
        title: '4. Recipients of the data and third-party providers',
        blocks: [
          'Reminder data is processed by providers acting as data processors (Art. 28 GDPR), bound by contract to process it only for the purposes set out above:',
          [
            '**Supabase Inc.**: stores the reminder data and runs the functions that send the notifications. Data is stored on servers located in Ireland (EU).',
            '**Vercel Inc.**: hosting of the website. A company based in the United States.',
            '**Browser push services** (for example Google, Mozilla or Apple) deliver each reminder to your browser; we do not control them. Google also receives the requests you make if you connect Google Calendar in the app. A company based in the United States.',
            '**GitHub, Inc.**: hosts the Slate releases and answers the app’s update checks. A company based in the United States.',
          ],
          'Ko-fi is a third-party site. The app only opens it when you tap the link.',
        ],
      },
      {
        title: '5. Transfers of data outside the EU',
        blocks: [
          'Vercel Inc., Google LLC and GitHub, Inc. are based in the United States. Transfers to these providers rely on appropriate safeguards under Chapter V of the GDPR, such as the Standard Contractual Clauses approved by the European Commission and/or participation in the EU-US Data Privacy Framework, where applicable. You can ask the controller for more information about these safeguards.',
        ],
      },
      {
        title: '6. Retention period',
        blocks: [
          'Reminder data is kept as follows. Items are deleted once their start time has passed (at most a day later) and are replaced each time your browser syncs. Your device key and push subscription are kept until you turn reminders off in Settings, which deletes them at once. Technical logs are kept for a maximum of 12 months.',
          'App data stays on your device until you erase it (Settings › Backup › erase all data) or uninstall the app. Events copied into your Google or phone calendars remain there until you delete them in those services.',
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
          'For data kept only on your device, you can exercise these rights yourself: export a backup, correct or delete items in the app, or erase all data. For reminder data on the website, you can turn reminders off in Settings, which deletes it from our servers at once. For anything else, write to **egenesio@proton.me**. You also have the right to lodge a complaint with the competent supervisory authority:',
          'Italian Data Protection Authority (Garante per la protezione dei dati personali), Piazza Venezia 11, 00187 Rome, Italy: www.garanteprivacy.it',
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
          'The app stores its data on your device, which other apps cannot read. For reminders we take appropriate technical and organisational measures: the device key is kept only in your browser and only a hash of it is stored on our servers; connections are encrypted (TLS/HTTPS); the reminder tables cannot be read through the website and are used only by our reminder functions; and access is limited to authorised personnel.',
        ],
      },
      {
        title: '10. Changes to this policy',
        blocks: [
          'This policy may be updated over time, for example when a new feature changes what the app does. If we make substantial changes, we will let you know through the Service or by email before the changes take effect.',
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
    description: 'Terms and conditions for using the Slate app and website.',
    updated: 'Last updated: 28 November 2026',
    intro: [
      'These Terms of Service (“Terms”) govern the use of Slate (the “Service”), the Android and iOS app and the website, provided by **Matteo Genesio** (“the Owner”, “we”). By using the Service you accept these Terms in full.',
    ],
    sections: [
      {
        title: '1. Description of the Service',
        blocks: [
          'Slate is an app and a website for organising your week in time blocks (study, work, classes and other categories), with shifts, rotations, pay estimates and reminders. Both work on your device without an account. The Service is free: it has no paid features and no subscriptions. Voluntary support through Ko-fi is optional and unlocks nothing. The Service is under active development, so features may be added, changed or removed over time.',
        ],
      },
      {
        title: '2. No accounts and requirements',
        blocks: [
          'Slate has no accounts. Your data is kept in the browser or the app on the device you use, and you are responsible for keeping that device safe. Clearing your browser’s site data, or uninstalling the app, removes the data stored on that device, and because there is no account we cannot recover it for you. Website reminders need a browser that supports web push notifications.',
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
          'You keep full ownership of the content you put into Slate (block titles, times, categories, shifts). Content stays on your device. Reminder data is sent to us only as described in our [Privacy Policy](/privacy), and only to provide the reminders you turn on. We claim no rights over your content and do not share it with third parties other than as set out in the Privacy Policy.',
        ],
      },
      {
        title: '5. Permissions and third-party services',
        blocks: [
          'If you allow calendar access, or sign in with Google to sync with Google Calendar, you are responsible for the permissions you grant. Google, GitHub and Ko-fi are third-party services with their own terms and privacy policies; the app only connects to them as described in the [Privacy Policy](/privacy).',
          'Updates are optional. The app can tell you that a new version is available, but you choose whether and when to install it.',
        ],
      },
      {
        title: '6. Intellectual property in the Service',
        blocks: [
          'The code, the design, the “Slate” brand and every other part of the Service that is not your content remain the property of the Owner and are protected by the applicable intellectual property laws. You may not copy, modify or distribute them without written permission.',
        ],
      },
      {
        title: '7. Availability of the Service',
        blocks: [
          'The Service is provided “as is”, with no guarantee of continuity, freedom from errors or fitness for a particular purpose. Reminders depend on your phone’s settings and on the operating system, and may be delayed or missed. As it is a product under active development, there may be interruptions, maintenance or changes to features. Do not treat Slate as your only source of critical information about your commitments.',
        ],
      },
      {
        title: '8. Limitation of liability',
        blocks: [
          'To the fullest extent permitted by applicable law, the Owner is not liable for indirect damages, loss of data or loss of profit arising from the use of, or inability to use, the Service. Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including the mandatory rights granted to consumers by the Italian Consumer Code (Legislative Decree 206/2005). Make regular backups from the app’s export function.',
        ],
      },
      {
        title: '9. Suspension and termination',
        blocks: [
          'You can turn reminders off at any time in Settings, which deletes the reminder data stored for your browser. Clearing the site data in your browser, or uninstalling the app, removes the data stored on your device. We reserve the right to suspend the Service or the reminders for anyone who breaks these Terms, giving notice where reasonably possible.',
        ],
      },
      {
        title: '10. Changes to the Terms',
        blocks: [
          'We may update these Terms over time. If we make substantial changes, we will let you know through the Service or by email reasonably in advance of their taking effect.',
        ],
      },
      {
        title: '11. Governing law and jurisdiction',
        blocks: [
          'These Terms are governed by Italian law. If you use the Service as a consumer resident in the European Union, you have the right to bring proceedings before the courts of the place where you live, under the mandatory rules that protect consumers. You can also use the European online dispute resolution (ODR) platform, available at [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '12. Contact',
        blocks: ['For questions about these Terms, write to **egenesio@proton.me**.'],
      },
    ],
  },
};
