import type { LegalDocs } from './types';

export const nl: LegalDocs = {
  privacy: {
    description:
      'Informatie over de verwerking van persoonsgegevens van gebruikers van Slate, op grond van Verordening (EU) 2016/679 (AVG).',
    updated: 'Laatst bijgewerkt: 10 november 2026',
    intro: [
      'Deze verklaring beschrijft hoe de persoonsgegevens worden verwerkt van gebruikers die Slate (de “Dienst”) gebruiken, overeenkomstig art. 13 van Verordening (EU) 2016/679 (“AVG”) en het Italiaanse wetsbesluit 196/2003, zoals gewijzigd bij wetsbesluit 101/2018 (de “Italiaanse Privacycode”).',
    ],
    sections: [
      {
        title: '1. Verwerkingsverantwoordelijke',
        blocks: [
          'De verwerkingsverantwoordelijke is **Matteo Genesio**, bereikbaar via het e-mailadres **egenesio@proton.me**.',
        ],
      },
      {
        title: '2. Gegevens die we verzamelen',
        blocks: [
          'We verwerken de volgende categorieën persoonsgegevens:',
          [
            '**Accountgegevens**: e-mailadres en, als je je registreert met e-mail en wachtwoord, het wachtwoord (versleuteld opgeslagen en nooit leesbaar voor ons). Als je inlogt via Google, ontvangen we van Google je e-mailadres, naam en profielfoto, zoals je dat hebt toegestaan op het toestemmingsscherm van Google.',
            '**Gebruiksgegevens van de Dienst**: de inhoud die je in Slate aanmaakt (titels van tijdblokken, categorie, begin- en eindtijden, kleur, herhaling), die nodig is om de weekplanning te laten werken.',
            '**Technische gegevens**: IP-adres, type browser en apparaat, automatisch verzameld door onze infrastructuurleveranciers (Vercel, Supabase) voor de beveiliging en werking van de dienst.',
            '**Cookies**: we gebruiken uitsluitend technische cookies die nodig zijn om je ingelogd te houden (authenticatie). We gebruiken geen cookies voor profilering, analytics of marketing van derden.',
          ],
        ],
      },
      {
        title: '3. Doeleinden en rechtsgrond van de verwerking',
        blocks: [
          [
            '**Levering van de Dienst** (aanmaken van het account, synchronisatie van gegevens tussen apparaten): rechtsgrond art. 6 lid 1 onder b AVG, uitvoering van een overeenkomst waarbij de betrokkene partij is.',
            '**Beveiliging, voorkomen van misbruik en fraude**: rechtsgrond art. 6 lid 1 onder f AVG, gerechtvaardigd belang van de verwerkingsverantwoordelijke.',
            '**Essentiële serviceberichten** (bijv. meldingen over je account): rechtsgrond art. 6 lid 1 onder b AVG.',
          ],
          'We doen momenteel niet aan direct marketing, profilering of reclame op basis van je gegevens.',
        ],
      },
      {
        title: '4. Ontvangers van de gegevens en externe leveranciers',
        blocks: [
          'Je gegevens worden verwerkt door externe leveranciers die optreden als verwerker (art. 28 AVG) en contractueel verplicht zijn de gegevens alleen voor de hierboven genoemde doeleinden te verwerken:',
          [
            '**Supabase Inc.** — hosting van de database en beheer van de authenticatie. De gegevens worden opgeslagen op servers in Ierland (EU).',
            '**Vercel Inc.** — hosting van de webapplicatie. Bedrijf gevestigd in de Verenigde Staten.',
            '**Google LLC** — authenticatie via een Google-account (OAuth), alleen als je ervoor kiest op deze manier in te loggen. Bedrijf gevestigd in de Verenigde Staten.',
          ],
        ],
      },
      {
        title: '5. Doorgifte van gegevens buiten de EU',
        blocks: [
          'Vercel Inc. en Google LLC zijn gevestigd in de Verenigde Staten. De doorgifte van gegevens aan deze leveranciers vindt plaats op basis van passende waarborgen in de zin van hoofdstuk V van de AVG, zoals de door de Europese Commissie goedgekeurde standaardcontractbepalingen en/of deelname aan het EU-VS Data Privacy Framework, waar van toepassing. Je kunt meer informatie over deze waarborgen opvragen bij de verwerkingsverantwoordelijke.',
        ],
      },
      {
        title: '6. Bewaartermijn',
        blocks: [
          'Je accountgegevens en de inhoud die je aanmaakt worden bewaard zolang je een actief account bij Slate hebt. Als je vraagt om je account te verwijderen, worden je persoonsgegevens en de bijbehorende inhoud binnen 30 dagen verwijderd, behalve wat op grond van wettelijke verplichtingen langer moet worden bewaard. Technische logs worden maximaal 12 maanden bewaard.',
        ],
      },
      {
        title: '7. Je rechten',
        blocks: [
          'Als betrokkene heb je het recht om:',
          [
            'je persoonsgegevens in te zien (art. 15 AVG);',
            'ze te laten rectificeren als ze onjuist zijn (art. 16 AVG);',
            'ze te laten wissen, binnen de grenzen van de wet (art. 17 AVG);',
            'de verwerking te laten beperken (art. 18 AVG);',
            'je gegevens te ontvangen in een gestructureerd en leesbaar formaat (overdraagbaarheid, art. 20 AVG);',
            'bezwaar te maken tegen verwerking op basis van gerechtvaardigd belang (art. 21 AVG);',
            'een eventueel gegeven toestemming op elk moment in te trekken, zonder dat dit afbreuk doet aan de rechtmatigheid van de verwerking die al heeft plaatsgevonden.',
          ],
          'Je kunt deze rechten op elk moment uitoefenen door te schrijven naar **egenesio@proton.me**. Je hebt ook het recht een klacht in te dienen bij de bevoegde toezichthoudende autoriteit:',
          'Italiaanse gegevensbeschermingsautoriteit (Garante per la protezione dei dati personali) — Piazza Venezia, 11, 00187 Rome, Italië — www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Minderjarigen',
        blocks: [
          'De Dienst is niet bedoeld voor kinderen jonger dan 14 jaar (de leeftijd voor digitale toestemming volgens art. 2-quinquies van de Italiaanse Privacycode). We verzamelen niet bewust gegevens van kinderen onder die leeftijd; als we ontdekken dat we zulke gegevens hebben verzameld, verwijderen we ze.',
        ],
      },
      {
        title: '9. Beveiliging van gegevens',
        blocks: [
          'We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen, waaronder versleutelde verbindingen (TLS/HTTPS), scheiding van gegevens tussen gebruikers via Row Level Security op databaseniveau en toegang tot gegevens die beperkt is tot bevoegd personeel.',
        ],
      },
      {
        title: '10. Wijzigingen in deze verklaring',
        blocks: [
          'Deze verklaring kan in de loop van de tijd worden bijgewerkt. Bij wezenlijke wijzigingen informeren we je via de Dienst of per e-mail voordat de wijzigingen ingaan.',
        ],
      },
      {
        title: '11. Contact',
        blocks: [
          'Voor vragen over deze verklaring of over de verwerking van je gegevens kun je schrijven naar **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Voorwaarden voor het gebruik van de dienst Slate.',
    updated: 'Laatst bijgewerkt: 10 november 2026',
    intro: [
      'Deze Servicevoorwaarden (“Voorwaarden”) regelen het gebruik van Slate (de “Dienst”), aangeboden door **Matteo Genesio** (“de Eigenaar”, “wij”). Door een account aan te maken of de Dienst te gebruiken, aanvaard je deze Voorwaarden volledig.',
    ],
    sections: [
      {
        title: '1. Beschrijving van de Dienst',
        blocks: [
          'Slate is een webapplicatie waarmee je je week kunt indelen in tijdblokken (studie, werk, lessen en andere categorieën). De Dienst wordt momenteel gratis aangeboden en is volop in ontwikkeling: functies kunnen in de loop van de tijd worden toegevoegd, gewijzigd of verwijderd. In de toekomst kunnen we een betaald abonnement met extra functies (“Pro”) invoeren; in dat geval krijg je specifieke voorwaarden te zien voordat er iets in rekening wordt gebracht, en blijft het gebruik van de bestaande gratis functies onaangetast.',
        ],
      },
      {
        title: '2. Registratie en vereisten',
        blocks: [
          'Om Slate te gebruiken moet je een account aanmaken met e-mail en wachtwoord of door in te loggen met Google. Je moet minimaal 14 jaar oud zijn om een account aan te maken. Je bent verantwoordelijk voor het geheimhouden van je inloggegevens en voor alle activiteiten die via je account plaatsvinden.',
        ],
      },
      {
        title: '3. Toegestaan gebruik',
        blocks: [
          'Door Slate te gebruiken verbind je je ertoe om niet:',
          [
            'de Dienst te gebruiken voor illegale of ongeoorloofde doeleinden;',
            'te proberen zonder toestemming toegang te krijgen tot gegevens of systemen van de Dienst;',
            'de normale werking van de Dienst te verstoren (bijv. door aanvallen, geautomatiseerde scraping of opzettelijke overbelasting);',
            'inhoud te uploaden die illegaal of aanstootgevend is of inbreuk maakt op rechten van derden.',
          ],
        ],
      },
      {
        title: '4. Jouw inhoud',
        blocks: [
          'Je blijft volledig eigenaar van de inhoud die je in Slate invoert (titels van blokken, tijden, categorieën). Je verleent ons een beperkte, niet-exclusieve licentie om die inhoud op te slaan en te verwerken, uitsluitend om je de Dienst te kunnen leveren (bijvoorbeeld om de inhoud tussen je apparaten te synchroniseren). We maken geen aanspraak op rechten op je inhoud en delen die niet met derden, behalve zoals aangegeven in onze [Privacyverklaring](/privacy).',
        ],
      },
      {
        title: '5. Intellectuele eigendom van de Dienst',
        blocks: [
          'De code, het ontwerp, het merk “Slate” en elk ander onderdeel van de Dienst dat niet tot jouw inhoud behoort, blijven eigendom van de Eigenaar en worden beschermd door de toepasselijke wetgeving inzake intellectuele eigendom. Het is niet toegestaan deze onderdelen zonder schriftelijke toestemming te kopiëren, te wijzigen of te verspreiden.',
        ],
      },
      {
        title: '6. Beschikbaarheid van de Dienst',
        blocks: [
          'De Dienst wordt geleverd “zoals hij is” (“as is”), zonder garanties voor continuïteit, foutloosheid of geschiktheid voor een bepaald doel. Omdat het product volop in ontwikkeling is, kunnen er onderbrekingen, onderhoud of wijzigingen in functies voorkomen. We raden je aan Slate niet als enige bron van cruciale informatie over je afspraken te beschouwen.',
        ],
      },
      {
        title: '7. Beperking van aansprakelijkheid',
        blocks: [
          'Voor zover maximaal toegestaan door het toepasselijke recht is de Eigenaar niet aansprakelijk voor indirecte schade, verlies van gegevens of gederfde winst als gevolg van het gebruik of de onmogelijkheid van gebruik van de Dienst. Niets in deze Voorwaarden sluit aansprakelijkheid uit of beperkt die waar dat volgens het toepasselijke recht niet mag, met inbegrip van de dwingende rechten die consumenten hebben op grond van het Italiaanse Consumentenwetboek (wetsbesluit 206/2005).',
        ],
      },
      {
        title: '8. Opschorting en beëindiging van het account',
        blocks: [
          'Je kunt je account op elk moment verwijderen; na verwijdering worden je gegevens behandeld zoals beschreven in onze [Privacyverklaring](/privacy). We behouden ons het recht voor accounts die deze Voorwaarden schenden op te schorten of te beëindigen, en stellen je daarvan op de hoogte waar dat redelijkerwijs mogelijk is.',
        ],
      },
      {
        title: '9. Wijzigingen in de Voorwaarden',
        blocks: [
          'We kunnen deze Voorwaarden in de loop van de tijd bijwerken. Bij wezenlijke wijzigingen informeren we je via de Dienst of per e-mail, een redelijke termijn voordat ze ingaan.',
        ],
      },
      {
        title: '10. Toepasselijk recht en bevoegde rechter',
        blocks: [
          'Op deze Voorwaarden is Italiaans recht van toepassing. Als je de Dienst gebruikt als consument die in de Europese Unie woont, heb je het recht je te wenden tot de rechter van je woonplaats, op grond van de dwingende regels ter bescherming van consumenten. Je kunt ook gebruikmaken van het Europese platform voor onlinegeschillenbeslechting (ODR), beschikbaar op [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '11. Contact',
        blocks: ['Voor vragen over deze Voorwaarden kun je schrijven naar **egenesio@proton.me**.'],
      },
    ],
  },
};
