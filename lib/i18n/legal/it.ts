import type { LegalDocs } from './types';

export const it: LegalDocs = {
  privacy: {
    description:
      'Come Slate tratta i dati personali dei suoi utenti, ai sensi del Regolamento (UE) 2016/679 (GDPR).',
    updated: 'Ultimo aggiornamento: 25 novembre 2026',
    intro: [
      'Questa informativa descrive come Slate tratta i dati personali: l’app per Android e iOS e il sito web di Slate. È redatta ai sensi dell’articolo 13 del Regolamento (UE) 2016/679 (“GDPR”) e del Codice in materia di protezione dei dati personali, D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018 (il “Codice Privacy”).',
    ],
    sections: [
      {
        title: 'Come l’app Slate tratta i tuoi dati',
        blocks: [
          'L’app Slate conserva i tuoi dati sul telefono. Non ha un account né un server gestito da noi: blocchi, turni, rotazioni, impostazioni e promemoria restano solo sul dispositivo. Non li riceviamo. L’app non contiene analisi statistiche, pubblicità né tracciamento.',
          [
            '**Calendari del telefono** (Android e iOS). Se consenti l’accesso al calendario, l’app mostra gli eventi dei calendari del telefono e, se lo scegli, copia i tuoi blocchi e turni in un calendario. Tutto avviene sul dispositivo; non inviamo nulla.',
            '**Google Calendar** (facoltativo, Android; non ancora disponibile su iOS). Se accedi con Google e attivi la sincronizzazione, l’app si collega direttamente dal telefono al servizio Google Calendar, con i permessi che approvi: lettura e scrittura degli eventi ed elenco dei tuoi calendari. I blocchi vengono copiati in un calendario chiamato “Slate” nel tuo account Google, e gli eventi Google vengono mostrati accanto ad essi. Il token di accesso Google è conservato sul dispositivo e non viene inviato a nessun server gestito da noi. L’uso e il trasferimento a qualsiasi altra app delle informazioni ricevute dalle API di Google da parte di Slate rispettano la Google API Services User Data Policy, inclusi i requisiti di “Limited Use”. Puoi revocare l’accesso in qualsiasi momento dal tuo account Google o disattivando la sincronizzazione nell’app.',
            '**Promemoria e notifiche**. I promemoria prima di eventi e turni sono programmati e mostrati dal telefono. Non usano nessun server. Puoi modificarli o disattivarli in Impostazioni › Notifiche.',
            '**Controllo degli aggiornamenti** (Android). Circa ogni sei ore l’app chiede a GitHub (api.github.com) se esiste una versione più recente di Slate. Quando scegli di installare un aggiornamento, l’APK viene scaricato da GitHub e il suo checksum SHA-256 viene verificato prima dell’installazione. GitHub riceve i dati tecnici che una richiesta di questo tipo comporta, come l’indirizzo IP, secondo la propria informativa privacy.',
            '**Ko-fi**. Il link di sostegno apre ko-fi.com nel browser. L’app non invia nulla a Ko-fi. Per eventuali donazioni si applica l’informativa privacy di Ko-fi.',
            '**Backup**. Puoi esportare i tuoi dati in un file e reimportarlo. Il file viene salvato dove scegli e non ci viene mai inviato. Chi possiede il file può leggerne il contenuto: conservalo con cura.',
          ],
        ],
      },
      {
        title: 'Il sito web di Slate',
        blocks: [
          'Il sito web non legge né scrive i tuoi calendari. Gli account del sito servono per accedere e per conservare i contenuti che crei sul sito.',
        ],
      },
      {
        title: '1. Titolare del trattamento',
        blocks: [
          'Il titolare del trattamento è **Matteo Genesio**, contattabile via email all’indirizzo **egenesio@proton.me**. Per i dati che esistono solo sul tuo dispositivo, come descritto sopra, non abbiamo accesso e l’app non li trasmette a noi.',
        ],
      },
      {
        title: '2. Dati trattati',
        blocks: [
          'Per il sito web trattiamo le seguenti categorie di dati personali:',
          [
            '**Dati dell’account**: il tuo indirizzo email e, se ti registri con email e password, la password (conservata in forma cifrata e mai leggibile da noi). Se accedi con Google, riceviamo da Google il tuo indirizzo email, nome e immagine del profilo, come autorizzato da te nella schermata di consenso di Google.',
            '**Dati del servizio**: i contenuti che crei sul sito (titoli dei blocchi, categoria, orari di inizio e fine, colore, ricorrenza), necessari al funzionamento del planner.',
            '**Dati tecnici**: indirizzo IP, tipo di browser e dispositivo, raccolti automaticamente dai nostri fornitori di infrastruttura (Vercel, Supabase) per la sicurezza e il funzionamento del servizio.',
            '**Cookie**: usiamo solo cookie tecnici necessari a mantenerti connesso. Non usiamo cookie di profilazione, di analisi o di marketing di terze parti.',
          ],
          'Per l’app non raccogliamo dati personali. I dati che inserisci nell’app sono descritti sopra e restano sul tuo dispositivo.',
        ],
      },
      {
        title: '3. Finalità e basi giuridiche del trattamento',
        blocks: [
          [
            '**Fornitura del sito** (account, conservazione dei tuoi contenuti): art. 6(1)(b) GDPR, esecuzione di un contratto.',
            '**Sicurezza e prevenzione di abusi e frodi**: art. 6(1)(f) GDPR, legittimo interesse del titolare.',
            '**Comunicazioni di servizio essenziali** (ad es. avvisi sull’account): art. 6(1)(b) GDPR.',
            '**Calendario del telefono, Google Calendar e notifiche nell’app**: art. 6(1)(a) GDPR, il tuo consenso, espresso quando concedi il permesso o attivi la funzione. Puoi revocarlo in qualsiasi momento dall’app o dalle impostazioni del telefono.',
            '**Controllo degli aggiornamenti e avviso di nuova versione** (Android): art. 6(1)(f) GDPR, legittimo interesse a farti installare la versione corrente. Puoi disattivare l’avviso in Impostazioni › Notifiche.',
          ],
          'Non svolgiamo attività di marketing diretto, profilazione o pubblicità basate sui tuoi dati.',
        ],
      },
      {
        title: '4. Destinatari dei dati e fornitori terzi',
        blocks: [
          'I dati trattati per il sito sono affidati a fornitori che agiscono come responsabili del trattamento (art. 28 GDPR), vincolati per contratto a trattarli solo per le finalità indicate sopra:',
          [
            '**Supabase Inc.**: hosting del database e autenticazione per gli account del sito. I dati sono conservati su server in Irlanda (UE).',
            '**Vercel Inc.**: hosting del sito web. Società con sede negli Stati Uniti.',
            '**Google LLC**: accesso con account Google, se lo scegli sul sito; e, se attivi la sincronizzazione Google nell’app, il servizio calendario a cui ti colleghi. Google riceve le richieste che fai; noi non le riceviamo. Società con sede negli Stati Uniti.',
            '**GitHub, Inc.**: ospita le release di Slate e risponde ai controlli di aggiornamento dell’app. Società con sede negli Stati Uniti.',
          ],
          'Ko-fi è un sito di terze parti. L’app lo apre solo quando tocchi il link.',
        ],
      },
      {
        title: '5. Trasferimenti di dati al di fuori dell’UE',
        blocks: [
          'Vercel Inc., Google LLC e GitHub, Inc. hanno sede negli Stati Uniti. I trasferimenti verso questi fornitori si basano su garanzie adeguate ai sensi del Capo V del GDPR, quali le Clausole Contrattuali Standard approvate dalla Commissione europea e/o l’adesione al Data Privacy Framework UE-USA, ove applicabile. Puoi chiedere al titolare maggiori informazioni su tali garanzie.',
        ],
      },
      {
        title: '6. Periodo di conservazione',
        blocks: [
          'I dati dell’account del sito e i contenuti sono conservati finché hai un account attivo. Se chiedi la cancellazione dell’account, i dati personali e i contenuti correlati vengono cancellati entro 30 giorni, salvo quanto debba essere conservato più a lungo per obblighi di legge. I log tecnici sono conservati per un massimo di 12 mesi.',
          'I dati dell’app restano sul tuo dispositivo finché non li cancelli (Impostazioni › Backup › cancella tutti i dati) o non disinstalli l’app. Gli eventi copiati nei calendari Google o del telefono restano lì finché non li elimini da quei servizi.',
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
            'ottenerne la limitazione del trattamento (art. 18 GDPR);',
            'ricevere i tuoi dati in un formato strutturato e leggibile (portabilità, art. 20 GDPR);',
            'opporti al trattamento basato sul legittimo interesse (art. 21 GDPR);',
            'revocare in qualsiasi momento il consenso prestato, senza pregiudicare la liceità del trattamento effettuato in precedenza.',
          ],
          'Per i dati conservati solo sul tuo dispositivo puoi esercitare questi diritti da solo: esporta un backup, correggi o elimina elementi nell’app, oppure cancella tutti i dati. Per i dati del sito, scrivi a **egenesio@proton.me**. Hai inoltre il diritto di proporre reclamo all’autorità di controllo competente:',
          'Garante per la protezione dei dati personali, Piazza Venezia 11, 00187 Roma: www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Minori',
        blocks: [
          'Il Servizio non è destinato a bambini di età inferiore a 14 anni (età del consenso digitale ai sensi dell’art. 2-quinquies del Codice Privacy). Non raccogliamo consapevolmente dati di minori di tale età; se venissimo a conoscenza di averli raccolti, li cancelleremo.',
        ],
      },
      {
        title: '9. Sicurezza dei dati',
        blocks: [
          'L’app conserva i propri dati nello spazio privato dell’app sul tuo dispositivo, che le altre app non possono leggere. Per il sito adottiamo misure tecniche e organizzative adeguate, tra cui connessioni cifrate (TLS/HTTPS), separazione dei dati tra utenti tramite Row Level Security a livello di database e accesso ai dati limitato al personale autorizzato.',
        ],
      },
      {
        title: '10. Modifiche alla presente informativa',
        blocks: [
          'La presente informativa può essere aggiornata nel tempo, ad esempio quando una nuova funzione cambia ciò che l’app fa. In caso di modifiche sostanziali ti informeremo tramite il Servizio o via email prima che entrino in vigore.',
        ],
      },
      {
        title: '11. Contatti',
        blocks: [
          'Per qualsiasi domanda su questa informativa o sul trattamento dei tuoi dati, scrivi a **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Condizioni per l’uso dell’app e del sito Slate.',
    updated: 'Ultimo aggiornamento: 25 novembre 2026',
    intro: [
      'I presenti Termini di servizio (“Termini”) regolano l’uso di Slate (il “Servizio”), l’app per Android e iOS e il sito web, forniti da **Matteo Genesio** (“il Titolare”, “noi”). Usando il Servizio accetti integralmente questi Termini.',
    ],
    sections: [
      {
        title: '1. Descrizione del Servizio',
        blocks: [
          'Slate è un’app e un sito per organizzare la settimana in blocchi di tempo (studio, lavoro, lezioni e altre categorie), con turni, rotazioni, stime della paga e promemoria. L’app funziona sul tuo dispositivo senza account. Il Servizio è gratuito: non ha funzioni a pagamento né abbonamenti. Il sostegno volontario tramite Ko-fi è facoltativo e non sblocca nulla. Il Servizio è in sviluppo attivo, quindi le funzioni possono essere aggiunte, modificate o rimosse nel tempo.',
        ],
      },
      {
        title: '2. Account e requisiti',
        blocks: [
          'L’app non richiede un account. Alcune funzioni del sito richiedono un account, creato con email e password oppure accedendo con Google. Per creare un account devi avere almeno 14 anni. Sei responsabile della riservatezza delle tue credenziali e di tutte le attività svolte tramite il tuo account.',
        ],
      },
      {
        title: '3. Uso consentito',
        blocks: [
          'Usando Slate accetti di non:',
          [
            'usare il Servizio per scopi illeciti o non autorizzati;',
            'tentare di accedere senza autorizzazione ai dati o ai sistemi del Servizio;',
            'interferire con il normale funzionamento del Servizio (ad es. con attacchi, scraping automatizzato o sovraccarichi intenzionali);',
            'caricare contenuti illeciti, offensivi o che violano i diritti altrui.',
          ],
        ],
      },
      {
        title: '4. I tuoi contenuti',
        blocks: [
          'Conservi la piena titolarità dei contenuti che inserisci in Slate (titoli dei blocchi, orari, categorie, turni). I contenuti nell’app restano sul tuo dispositivo. Per i contenuti sul sito, concedi a noi una licenza limitata e non esclusiva per conservarli e trattarli al solo scopo di fornirti il Servizio. Non rivendichiamo alcun diritto sui tuoi contenuti e non li condividiamo con terzi se non come indicato nella nostra [Informativa privacy](/privacy).',
        ],
      },
      {
        title: '5. Permessi e servizi di terze parti',
        blocks: [
          'Se consenti l’accesso al calendario, o accedi con Google per sincronizzare con Google Calendar, sei responsabile dei permessi che concedi. Google, GitHub e Ko-fi sono servizi di terze parti con i propri termini e le proprie informative privacy; l’app si collega a loro solo nei modi descritti nella [Informativa privacy](/privacy).',
          'Gli aggiornamenti sono facoltativi. L’app può segnalarti che è disponibile una nuova versione, ma sei tu a scegliere se e quando installarla.',
        ],
      },
      {
        title: '6. Proprietà intellettuale del Servizio',
        blocks: [
          'Il codice, il design, il marchio “Slate” e ogni altra parte del Servizio che non sia un tuo contenuto restano di proprietà del Titolare e sono tutelati dalle leggi applicabili in materia di proprietà intellettuale. Non puoi copiarli, modificarli o distribuirli senza autorizzazione scritta.',
        ],
      },
      {
        title: '7. Disponibilità del Servizio',
        blocks: [
          'Il Servizio è fornito “così com’è”, senza garanzia di continuità, assenza di errori o idoneità a uno scopo particolare. I promemoria dipendono dalle impostazioni del telefono e dal sistema operativo, e possono arrivare in ritardo o non arrivare. Trattandosi di un prodotto in sviluppo attivo, possono verificarsi interruzioni, manutenzioni o modifiche alle funzioni. Non considerare Slate l’unica fonte di informazioni critiche sui tuoi impegni.',
        ],
      },
      {
        title: '8. Limitazione di responsabilità',
        blocks: [
          'Nei limiti massimi consentiti dalla legge applicabile, il Titolare non risponde di danni indiretti, perdita di dati o perdita di profitto derivanti dall’uso o dall’impossibilità di usare il Servizio. Nulla nei presenti Termini esclude o limita una responsabilità che non può essere esclusa o limitata ai sensi della legge applicabile, compresi i diritti inderogabili riconosciuti ai consumatori dal Codice del Consumo (D.Lgs. 206/2005). Fai backup regolari con la funzione di esportazione dell’app.',
        ],
      },
      {
        title: '9. Sospensione e cessazione',
        blocks: [
          'Puoi eliminare il tuo account del sito in qualsiasi momento; in caso di cancellazione, i tuoi dati saranno trattati come descritto nella nostra [Informativa privacy](/privacy). Disinstallando l’app ne rimuovi i dati dal telefono. Ci riserviamo il diritto di sospendere o chiudere gli account che violano i presenti Termini, dandone avviso ove ragionevolmente possibile.',
        ],
      },
      {
        title: '10. Modifiche ai Termini',
        blocks: [
          'Possiamo aggiornare questi Termini nel tempo. In caso di modifiche sostanziali te lo comunicheremo tramite il Servizio o via email con ragionevole anticipo rispetto alla loro entrata in vigore.',
        ],
      },
      {
        title: '11. Legge applicabile e foro competente',
        blocks: [
          'I presenti Termini sono regolati dalla legge italiana. Se usi il Servizio come consumatore residente nell’Unione europea, hai il diritto di agire in giudizio davanti al giudice del luogo in cui risiedi, ai sensi delle norme inderogabili a tutela dei consumatori. Puoi inoltre utilizzare la piattaforma europea di risoluzione delle controversie online (ODR), disponibile su [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '12. Contatti',
        blocks: ['Per domande su questi Termini, scrivi a **egenesio@proton.me**.'],
      },
    ],
  },
};
