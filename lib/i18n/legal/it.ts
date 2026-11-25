import type { LegalDocs } from './types';

// The Italian text is the original. The other languages are translations of it:
// when this file changes, they have to change with it.
export const it: LegalDocs = {
  privacy: {
    description:
      'Informativa sul trattamento dei dati personali degli utenti di Slate, ai sensi del Regolamento (UE) 2016/679 (GDPR).',
    updated: 'Ultimo aggiornamento: 10 novembre 2026',
    intro: [
      "La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che utilizzano Slate (il “Servizio”), ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (“GDPR”) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018 (“Codice Privacy”).",
    ],
    sections: [
      {
        title: "Dati del calendario nell’app Slate",
        blocks: [
          "Il sito di Slate non legge né scrive il tuo Google Calendar o il calendario del telefono.",
          "L’app Slate per Android può mostrare e modificare eventi nei calendari del telefono e mostrare eventi del tuo account Google, solo dopo che gliene dai il permesso. Questi dati restano sul dispositivo. Non vengono inviati a noi né a nessun server gestito da noi.",
          "Se attivi la sincronizzazione Google nell’app, i blocchi e i turni che crei in Slate vengono copiati in un calendario chiamato Slate nel tuo account Google, con il tuo accesso. Slate non conserva il tuo token di accesso a Google su nessun server. Puoi revocare l’accesso dal tuo account Google in qualsiasi momento.",
          "Se gestisci un tuo server Slate, riceve solo i blocchi, i turni e le impostazioni che scegli di sincronizzare. Gli eventi dei calendari del telefono o di Google non gli vengono mai inviati.",
        ],
      },
      {
        title: '1. Titolare del trattamento',
        blocks: [
          "Il Titolare del trattamento è **Matteo Genesio**, contattabile all'indirizzo e-mail **egenesio@proton.me**.",
        ],
      },
      {
        title: '2. Dati raccolti',
        blocks: [
          'Trattiamo le seguenti categorie di dati personali:',
          [
            '**Dati di account**: indirizzo e-mail e, se scegli la registrazione con e-mail e password, la password (conservata in forma cifrata e mai leggibile da noi). Se accedi tramite Google, riceviamo da Google il tuo indirizzo e-mail, nome e immagine del profilo, secondo quanto da te autorizzato nella schermata di consenso di Google.',
            "**Dati di utilizzo del Servizio**: i contenuti che crei all'interno di Slate (titoli dei blocchi orari, categoria, orari di inizio e fine, colore, ricorrenza) necessari a far funzionare la pianificazione settimanale.",
            '**Dati tecnici**: indirizzo IP, tipo di browser e dispositivo, raccolti automaticamente dai nostri fornitori infrastrutturali (Vercel, Supabase) per ragioni di sicurezza e funzionamento del servizio.',
            '**Cookie**: utilizziamo esclusivamente cookie tecnici necessari a mantenere la sessione di accesso (autenticazione). Non utilizziamo cookie di profilazione, analytics o marketing di terze parti.',
          ],
        ],
      },
      {
        title: '3. Finalità e base giuridica del trattamento',
        blocks: [
          [
            "**Erogazione del Servizio** (creazione dell'account, sincronizzazione dei dati tra dispositivi): base giuridica art. 6.1.b GDPR, esecuzione di un contratto di cui l'interessato è parte.",
            '**Sicurezza, prevenzione di abusi e frodi**: base giuridica art. 6.1.f GDPR, legittimo interesse del Titolare.',
            '**Comunicazioni di servizio essenziali** (es. notifiche relative al tuo account): base giuridica art. 6.1.b GDPR.',
          ],
          'Non effettuiamo attualmente attività di marketing diretto, profilazione o pubblicità basata sui tuoi dati.',
        ],
      },
      {
        title: '4. Destinatari dei dati e fornitori terzi',
        blocks: [
          'I tuoi dati sono trattati da fornitori terzi che agiscono in qualità di responsabili del trattamento (art. 28 GDPR), vincolati da accordi contrattuali a trattare i dati solo per le finalità sopra indicate:',
          [
            "**Supabase Inc.** — hosting del database e gestione dell'autenticazione. I dati sono conservati su server situati in Irlanda (UE).",
            "**Vercel Inc.** — hosting dell'applicazione web. Società con sede negli Stati Uniti.",
            '**Google LLC** — autenticazione tramite account Google (OAuth), solo se scegli di accedere con questo metodo. Società con sede negli Stati Uniti.',
          ],
        ],
      },
      {
        title: '5. Trasferimento dei dati extra-UE',
        blocks: [
          "Vercel Inc. e Google LLC hanno sede negli Stati Uniti. Il trasferimento dei dati verso questi fornitori avviene sulla base di garanzie adeguate ai sensi del Capo V del GDPR, quali le Clausole Contrattuali Standard approvate dalla Commissione Europea e/o l'adesione al Data Privacy Framework UE-USA, ove applicabile. Puoi richiedere maggiori informazioni su queste garanzie contattando il Titolare.",
        ],
      },
      {
        title: '6. Periodo di conservazione',
        blocks: [
          'I dati del tuo account e i contenuti che crei sono conservati per tutta la durata in cui mantieni un account attivo su Slate. Se richiedi la cancellazione del tuo account, i tuoi dati personali e i contenuti associati vengono cancellati entro 30 giorni, salvo quanto debba essere conservato più a lungo per obblighi di legge. I log tecnici sono conservati per un periodo massimo di 12 mesi.',
        ],
      },
      {
        title: '7. I tuoi diritti',
        blocks: [
          'In qualità di interessato, hai il diritto di:',
          [
            'accedere ai tuoi dati personali (art. 15 GDPR);',
            'ottenerne la rettifica se inesatti (art. 16 GDPR);',
            'ottenerne la cancellazione, nei limiti previsti dalla legge (art. 17 GDPR);',
            'ottenere la limitazione del trattamento (art. 18 GDPR);',
            'ricevere i tuoi dati in un formato strutturato e leggibile (portabilità, art. 20 GDPR);',
            'opporti al trattamento basato sul legittimo interesse (art. 21 GDPR);',
            'revocare in qualsiasi momento un consenso eventualmente prestato, senza pregiudicare la liceità del trattamento già effettuato.',
          ],
          "Puoi esercitare questi diritti in qualsiasi momento scrivendo a **egenesio@proton.me**. Hai inoltre il diritto di proporre reclamo all'autorità di controllo competente:",
          'Garante per la protezione dei dati personali — Piazza Venezia, 11, 00187 Roma — www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Minori',
        blocks: [
          "Il Servizio non è rivolto a minori di 14 anni (età del consenso digitale ai sensi dell'art. 2-quinquies del Codice Privacy). Non raccogliamo consapevolmente dati di minori di tale età; se venissimo a conoscenza di aver raccolto tali dati, provvederemo alla loro cancellazione.",
        ],
      },
      {
        title: '9. Sicurezza dei dati',
        blocks: [
          'Adottiamo misure tecniche e organizzative adeguate a proteggere i tuoi dati, tra cui connessioni cifrate (TLS/HTTPS), isolamento dei dati tra utenti tramite Row Level Security a livello di database e accesso limitato ai dati da parte del personale autorizzato.',
        ],
      },
      {
        title: '10. Modifiche alla presente informativa',
        blocks: [
          'Questa informativa può essere aggiornata nel tempo. In caso di modifiche sostanziali, ti informeremo tramite il Servizio o via e-mail prima che le modifiche abbiano effetto.',
        ],
      },
      {
        title: '11. Contatti',
        blocks: [
          'Per qualsiasi domanda relativa a questa informativa o al trattamento dei tuoi dati, scrivi a **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Termini e condizioni di utilizzo del Servizio Slate.',
    updated: 'Ultimo aggiornamento: 10 novembre 2026',
    intro: [
      "I presenti Termini di Servizio (“Termini”) regolano l'utilizzo di Slate (il “Servizio”), fornito da **Matteo Genesio** (“il Titolare”, “noi”). Creando un account o utilizzando il Servizio, accetti integralmente questi Termini.",
    ],
    sections: [
      {
        title: '1. Descrizione del Servizio',
        blocks: [
          "Slate è un'applicazione web che permette di organizzare la propria settimana tramite blocchi orari (studio, lavoro, lezioni e altre categorie). Il Servizio è attualmente offerto gratuitamente ed è in fase di sviluppo attivo: funzionalità possono essere aggiunte, modificate o rimosse nel tempo. In futuro potremmo introdurre un piano a pagamento con funzionalità aggiuntive (“Pro”); in tal caso ti verranno presentati termini specifici prima di qualsiasi addebito, e l'uso delle funzionalità gratuite esistenti non sarà compromesso.",
        ],
      },
      {
        title: '2. Registrazione e requisiti',
        blocks: [
          'Per utilizzare Slate devi creare un account tramite e-mail e password oppure tramite accesso con Google. Devi avere almeno 14 anni per creare un account. Sei responsabile della riservatezza delle tue credenziali e di tutte le attività svolte tramite il tuo account.',
        ],
      },
      {
        title: '3. Utilizzo consentito',
        blocks: [
          'Utilizzando Slate ti impegni a non:',
          [
            'utilizzare il Servizio per scopi illegali o non autorizzati;',
            'tentare di accedere senza autorizzazione a dati o sistemi del Servizio;',
            'interferire con il normale funzionamento del Servizio (es. tramite attacchi, scraping automatizzato o sovraccarico intenzionale);',
            'caricare contenuti illegali, offensivi o lesivi dei diritti di terzi.',
          ],
        ],
      },
      {
        title: '4. I tuoi contenuti',
        blocks: [
          'Mantieni la piena proprietà dei contenuti che inserisci in Slate (titoli dei blocchi, orari, categorie). Ci concedi una licenza limitata, non esclusiva, a conservare ed elaborare tali contenuti esclusivamente al fine di fornirti il Servizio (ad esempio sincronizzarli tra i tuoi dispositivi). Non rivendichiamo alcun diritto sui tuoi contenuti e non li condividiamo con terzi al di fuori di quanto indicato nella nostra [Informativa sulla Privacy](/privacy).',
        ],
      },
      {
        title: '5. Proprietà intellettuale del Servizio',
        blocks: [
          'Il codice, il design, il marchio “Slate” e ogni altro elemento del Servizio non riconducibile ai tuoi contenuti restano di proprietà del Titolare e sono protetti dalle leggi applicabili in materia di proprietà intellettuale. Non è consentito copiare, modificare o distribuire tali elementi senza autorizzazione scritta.',
        ],
      },
      {
        title: '6. Disponibilità del Servizio',
        blocks: [
          "Il Servizio è fornito “così com'è” (“as is”), senza garanzie di continuità, assenza di errori o idoneità a uno scopo particolare. Trattandosi di un prodotto in fase di sviluppo attivo, possono verificarsi interruzioni, manutenzioni o modifiche delle funzionalità. Ti consigliamo di non considerare Slate l'unica fonte di informazioni critiche per i tuoi impegni.",
        ],
      },
      {
        title: '7. Limitazione di responsabilità',
        blocks: [
          "Nei limiti massimi consentiti dalla legge applicabile, il Titolare non è responsabile per danni indiretti, perdita di dati o mancato guadagno derivanti dall'utilizzo o dall'impossibilità di utilizzo del Servizio. Nulla nei presenti Termini esclude o limita responsabilità che non possono essere escluse o limitate ai sensi della legge applicabile, inclusi i diritti inderogabili riconosciuti ai consumatori dal Codice del Consumo (D.Lgs. 206/2005).",
        ],
      },
      {
        title: "8. Sospensione e cessazione dell'account",
        blocks: [
          'Puoi cancellare il tuo account in qualsiasi momento; alla cancellazione, i tuoi dati saranno trattati come descritto nella nostra [Informativa sulla Privacy](/privacy). Ci riserviamo il diritto di sospendere o terminare account che violino questi Termini, dandotene comunicazione ove ragionevolmente possibile.',
        ],
      },
      {
        title: '9. Modifiche ai Termini',
        blocks: [
          'Possiamo aggiornare questi Termini nel tempo. In caso di modifiche sostanziali, ti informeremo tramite il Servizio o via e-mail con ragionevole anticipo rispetto alla loro entrata in vigore.',
        ],
      },
      {
        title: '10. Legge applicabile e foro competente',
        blocks: [
          "I presenti Termini sono regolati dalla legge italiana. Se utilizzi il Servizio in qualità di consumatore residente nell'Unione Europea, hai diritto di adire il foro del luogo in cui risiedi, ai sensi delle norme inderogabili a tutela dei consumatori. Hai inoltre la possibilità di ricorrere alla piattaforma europea di risoluzione delle controversie online (ODR), disponibile all'indirizzo [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).",
        ],
      },
      {
        title: '11. Contatti',
        blocks: ['Per domande relative a questi Termini, scrivi a **egenesio@proton.me**.'],
      },
    ],
  },
};
