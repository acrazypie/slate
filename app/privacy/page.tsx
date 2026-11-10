import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Informativa sulla Privacy — Slate',
  description: 'Informativa sul trattamento dei dati personali degli utenti di Slate, ai sensi del Regolamento (UE) 2016/679 (GDPR).',
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-medium text-text-primary mt-10 mb-3">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-secondary leading-relaxed mb-3">{children}</p>;
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg px-4 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna alla home
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl text-text-primary mb-2">
          Informativa sulla Privacy
        </h1>
        <p className="text-xs text-text-tertiary mb-10">Ultimo aggiornamento: 10 novembre 2026</p>

        <P>
          La presente informativa descrive le modalità di trattamento dei dati personali degli utenti
          che utilizzano Slate (il &ldquo;Servizio&rdquo;), ai sensi dell&apos;art. 13 del Regolamento (UE)
          2016/679 (&ldquo;GDPR&rdquo;) e del D.Lgs. 196/2003 come modificato dal D.Lgs. 101/2018
          (&ldquo;Codice Privacy&rdquo;).
        </P>

        <H2>1. Titolare del trattamento</H2>
        <P>
          Il Titolare del trattamento è{' '}
          <strong className="text-text-primary">[NOME E COGNOME / RAGIONE SOCIALE]</strong>, contattabile
          all&apos;indirizzo e-mail{' '}
          <strong className="text-text-primary">[INSERISCI EMAIL DI CONTATTO]</strong>.
        </P>
        <P>
          <em>
            Nota per lo sviluppatore: sostituisci i campi tra parentesi quadre con i tuoi dati reali prima
            di pubblicare questa pagina — sono richiesti dall&apos;art. 13 GDPR per identificare il
            Titolare.
          </em>
        </P>

        <H2>2. Dati raccolti</H2>
        <P>Trattiamo le seguenti categorie di dati personali:</P>
        <ul className="list-disc pl-5 text-sm text-text-secondary leading-relaxed space-y-2 mb-3">
          <li>
            <strong className="text-text-primary">Dati di account</strong>: indirizzo e-mail e, se scegli
            la registrazione con e-mail e password, la password (conservata in forma cifrata e mai
            leggibile da noi). Se accedi tramite Google, riceviamo da Google il tuo indirizzo e-mail, nome
            e immagine del profilo, secondo quanto da te autorizzato nella schermata di consenso di Google.
          </li>
          <li>
            <strong className="text-text-primary">Dati di utilizzo del Servizio</strong>: i contenuti che
            crei all&apos;interno di Slate (titoli dei blocchi orari, categoria, orari di inizio e fine,
            colore, ricorrenza) necessari a far funzionare la pianificazione settimanale.
          </li>
          <li>
            <strong className="text-text-primary">Dati tecnici</strong>: indirizzo IP, tipo di browser e
            dispositivo, raccolti automaticamente dai nostri fornitori infrastrutturali (Vercel, Supabase)
            per ragioni di sicurezza e funzionamento del servizio.
          </li>
          <li>
            <strong className="text-text-primary">Cookie</strong>: utilizziamo esclusivamente cookie
            tecnici necessari a mantenere la sessione di accesso (autenticazione). Non utilizziamo cookie
            di profilazione, analytics o marketing di terze parti.
          </li>
        </ul>

        <H2>3. Finalità e base giuridica del trattamento</H2>
        <ul className="list-disc pl-5 text-sm text-text-secondary leading-relaxed space-y-2 mb-3">
          <li>
            <strong className="text-text-primary">Erogazione del Servizio</strong> (creazione
            dell&apos;account, sincronizzazione dei dati tra dispositivi): base giuridica art. 6.1.b GDPR,
            esecuzione di un contratto di cui l&apos;interessato è parte.
          </li>
          <li>
            <strong className="text-text-primary">Sicurezza, prevenzione di abusi e frodi</strong>: base
            giuridica art. 6.1.f GDPR, legittimo interesse del Titolare.
          </li>
          <li>
            <strong className="text-text-primary">Comunicazioni di servizio essenziali</strong>{' '}
            (es. notifiche relative al tuo account): base giuridica art. 6.1.b GDPR.
          </li>
        </ul>
        <P>
          Non effettuiamo attualmente attività di marketing diretto, profilazione o pubblicità basata sui
          tuoi dati.
        </P>

        <H2>4. Destinatari dei dati e fornitori terzi</H2>
        <P>
          I tuoi dati sono trattati da fornitori terzi che agiscono in qualità di responsabili del
          trattamento (art. 28 GDPR), vincolati da accordi contrattuali a trattare i dati solo per le
          finalità sopra indicate:
        </P>
        <ul className="list-disc pl-5 text-sm text-text-secondary leading-relaxed space-y-2 mb-3">
          <li>
            <strong className="text-text-primary">Supabase Inc.</strong> — hosting del database e gestione
            dell&apos;autenticazione. I dati sono conservati su server situati in Irlanda (UE).
          </li>
          <li>
            <strong className="text-text-primary">Vercel Inc.</strong> — hosting dell&apos;applicazione web.
            Società con sede negli Stati Uniti.
          </li>
          <li>
            <strong className="text-text-primary">Google LLC</strong> — autenticazione tramite account
            Google (OAuth), solo se scegli di accedere con questo metodo. Società con sede negli Stati
            Uniti.
          </li>
        </ul>

        <H2>5. Trasferimento dei dati extra-UE</H2>
        <P>
          Vercel Inc. e Google LLC hanno sede negli Stati Uniti. Il trasferimento dei dati verso questi
          fornitori avviene sulla base di garanzie adeguate ai sensi del Capo V del GDPR, quali le Clausole
          Contrattuali Standard approvate dalla Commissione Europea e/o l&apos;adesione al Data Privacy
          Framework UE-USA, ove applicabile. Puoi richiedere maggiori informazioni su queste garanzie
          contattando il Titolare.
        </P>

        <H2>6. Periodo di conservazione</H2>
        <P>
          I dati del tuo account e i contenuti che crei sono conservati per tutta la durata in cui mantieni
          un account attivo su Slate. Se richiedi la cancellazione del tuo account, i tuoi dati personali e
          i contenuti associati vengono cancellati entro 30 giorni, salvo quanto debba essere conservato
          più a lungo per obblighi di legge. I log tecnici sono conservati per un periodo massimo di 12
          mesi.
        </P>

        <H2>7. I tuoi diritti</H2>
        <P>In qualità di interessato, hai il diritto di:</P>
        <ul className="list-disc pl-5 text-sm text-text-secondary leading-relaxed space-y-2 mb-3">
          <li>accedere ai tuoi dati personali (art. 15 GDPR);</li>
          <li>ottenerne la rettifica se inesatti (art. 16 GDPR);</li>
          <li>ottenerne la cancellazione, nei limiti previsti dalla legge (art. 17 GDPR);</li>
          <li>ottenere la limitazione del trattamento (art. 18 GDPR);</li>
          <li>ricevere i tuoi dati in un formato strutturato e leggibile (portabilità, art. 20 GDPR);</li>
          <li>opporti al trattamento basato sul legittimo interesse (art. 21 GDPR);</li>
          <li>revocare in qualsiasi momento un consenso eventualmente prestato, senza pregiudicare la liceità del trattamento già effettuato.</li>
        </ul>
        <P>
          Puoi esercitare questi diritti in qualsiasi momento scrivendo a{' '}
          <strong className="text-text-primary">[INSERISCI EMAIL DI CONTATTO]</strong>. Hai inoltre il
          diritto di proporre reclamo all&apos;autorità di controllo competente:
        </P>
        <P>
          Garante per la protezione dei dati personali — Piazza Venezia, 11, 00187 Roma — www.garanteprivacy.it
        </P>

        <H2>8. Minori</H2>
        <P>
          Il Servizio non è rivolto a minori di 14 anni (età del consenso digitale ai sensi dell&apos;art.
          2-quinquies del Codice Privacy). Non raccogliamo consapevolmente dati di minori di tale età; se
          venissimo a conoscenza di aver raccolto tali dati, provvederemo alla loro cancellazione.
        </P>

        <H2>9. Sicurezza dei dati</H2>
        <P>
          Adottiamo misure tecniche e organizzative adeguate a proteggere i tuoi dati, tra cui connessioni
          cifrate (TLS/HTTPS), isolamento dei dati tra utenti tramite Row Level Security a livello di
          database e accesso limitato ai dati da parte del personale autorizzato.
        </P>

        <H2>10. Modifiche alla presente informativa</H2>
        <P>
          Questa informativa può essere aggiornata nel tempo. In caso di modifiche sostanziali, ti
          informeremo tramite il Servizio o via e-mail prima che le modifiche abbiano effetto.
        </P>

        <H2>11. Contatti</H2>
        <P>
          Per qualsiasi domanda relativa a questa informativa o al trattamento dei tuoi dati, scrivi a{' '}
          <strong className="text-text-primary">[INSERISCI EMAIL DI CONTATTO]</strong>.
        </P>
      </div>
    </div>
  );
}
