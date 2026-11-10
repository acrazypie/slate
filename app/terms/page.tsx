import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini di Servizio — Slate',
  description: 'Termini e condizioni di utilizzo del Servizio Slate.',
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-medium text-text-primary mt-10 mb-3">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-secondary leading-relaxed mb-3">{children}</p>;
}

export default function TermsOfServicePage() {
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
          Termini di Servizio
        </h1>
        <p className="text-xs text-text-tertiary mb-10">Ultimo aggiornamento: 10 novembre 2026</p>

        <P>
          I presenti Termini di Servizio (&ldquo;Termini&rdquo;) regolano l&apos;utilizzo di Slate (il
          &ldquo;Servizio&rdquo;), fornito da{' '}
          <strong className="text-text-primary">[NOME E COGNOME / RAGIONE SOCIALE]</strong>{' '}
          (&ldquo;il Titolare&rdquo;, &ldquo;noi&rdquo;). Creando un account o utilizzando il Servizio,
          accetti integralmente questi Termini.
        </P>

        <H2>1. Descrizione del Servizio</H2>
        <P>
          Slate è un&apos;applicazione web che permette di organizzare la propria settimana tramite blocchi
          orari (studio, lavoro, lezioni e altre categorie). Il Servizio è attualmente offerto
          gratuitamente ed è in fase di sviluppo attivo: funzionalità possono essere aggiunte, modificate o
          rimosse nel tempo. In futuro potremmo introdurre un piano a pagamento con funzionalità aggiuntive
          (&ldquo;Pro&rdquo;); in tal caso ti verranno presentati termini specifici prima di qualsiasi
          addebito, e l&apos;uso delle funzionalità gratuite esistenti non sarà compromesso.
        </P>

        <H2>2. Registrazione e requisiti</H2>
        <P>
          Per utilizzare Slate devi creare un account tramite e-mail e password oppure tramite accesso con
          Google. Devi avere almeno 14 anni per creare un account. Sei responsabile della riservatezza
          delle tue credenziali e di tutte le attività svolte tramite il tuo account.
        </P>

        <H2>3. Utilizzo consentito</H2>
        <P>Utilizzando Slate ti impegni a non:</P>
        <ul className="list-disc pl-5 text-sm text-text-secondary leading-relaxed space-y-2 mb-3">
          <li>utilizzare il Servizio per scopi illegali o non autorizzati;</li>
          <li>tentare di accedere senza autorizzazione a dati o sistemi del Servizio;</li>
          <li>interferire con il normale funzionamento del Servizio (es. tramite attacchi, scraping automatizzato o sovraccarico intenzionale);</li>
          <li>caricare contenuti illegali, offensivi o lesivi dei diritti di terzi.</li>
        </ul>

        <H2>4. I tuoi contenuti</H2>
        <P>
          Mantieni la piena proprietà dei contenuti che inserisci in Slate (titoli dei blocchi, orari,
          categorie). Ci concedi una licenza limitata, non esclusiva, a conservare ed elaborare tali
          contenuti esclusivamente al fine di fornirti il Servizio (ad esempio sincronizzarli tra i tuoi
          dispositivi). Non rivendichiamo alcun diritto sui tuoi contenuti e non li condividiamo con terzi
          al di fuori di quanto indicato nella nostra{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Informativa sulla Privacy
          </Link>
          .
        </P>

        <H2>5. Proprietà intellettuale del Servizio</H2>
        <P>
          Il codice, il design, il marchio &ldquo;Slate&rdquo; e ogni altro elemento del Servizio non
          riconducibile ai tuoi contenuti restano di proprietà del Titolare e sono protetti dalle leggi
          applicabili in materia di proprietà intellettuale. Non è consentito copiare, modificare o
          distribuire tali elementi senza autorizzazione scritta.
        </P>

        <H2>6. Disponibilità del Servizio</H2>
        <P>
          Il Servizio è fornito &ldquo;così com&apos;è&rdquo; (&ldquo;as is&rdquo;), senza garanzie di
          continuità, assenza di errori o idoneità a uno scopo particolare. Trattandosi di un prodotto in
          fase di sviluppo attivo, possono verificarsi interruzioni, manutenzioni o modifiche delle
          funzionalità. Ti consigliamo di non considerare Slate l&apos;unica fonte di informazioni critiche
          per i tuoi impegni.
        </P>

        <H2>7. Limitazione di responsabilità</H2>
        <P>
          Nei limiti massimi consentiti dalla legge applicabile, il Titolare non è responsabile per danni
          indiretti, perdita di dati o mancato guadagno derivanti dall&apos;utilizzo o dall&apos;impossibilità
          di utilizzo del Servizio. Nulla nei presenti Termini esclude o limita responsabilità che non
          possono essere escluse o limitate ai sensi della legge applicabile, inclusi i diritti
          inderogabili riconosciuti ai consumatori dal Codice del Consumo (D.Lgs. 206/2005).
        </P>

        <H2>8. Sospensione e cessazione dell&apos;account</H2>
        <P>
          Puoi cancellare il tuo account in qualsiasi momento; alla cancellazione, i tuoi dati saranno
          trattati come descritto nella nostra{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Informativa sulla Privacy
          </Link>
          . Ci riserviamo il diritto di sospendere o terminare account che violino questi Termini,
          dandotene comunicazione ove ragionevolmente possibile.
        </P>

        <H2>9. Modifiche ai Termini</H2>
        <P>
          Possiamo aggiornare questi Termini nel tempo. In caso di modifiche sostanziali, ti informeremo
          tramite il Servizio o via e-mail con ragionevole anticipo rispetto alla loro entrata in vigore.
        </P>

        <H2>10. Legge applicabile e foro competente</H2>
        <P>
          I presenti Termini sono regolati dalla legge italiana. Se utilizzi il Servizio in qualità di
          consumatore residente nell&apos;Unione Europea, hai diritto di adire il foro del luogo in cui
          risiedi, ai sensi delle norme inderogabili a tutela dei consumatori. Hai inoltre la possibilità
          di ricorrere alla piattaforma europea di risoluzione delle controversie online (ODR), disponibile
          all&apos;indirizzo{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </P>

        <H2>11. Contatti</H2>
        <P>
          Per domande relative a questi Termini, scrivi a{' '}
          <strong className="text-text-primary">[INSERISCI EMAIL DI CONTATTO]</strong>.
        </P>
      </div>
    </div>
  );
}
