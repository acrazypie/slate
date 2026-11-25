import type { LegalDocs } from './types';

export const nl: LegalDocs = {
  privacy: {
    description:
      'Hoe Slate de persoonsgegevens van zijn gebruikers verwerkt, op grond van Verordening (EU) 2016/679 (AVG).',
    updated: 'Laatst bijgewerkt: 25 november 2026',
    intro: [
      'Dit beleid beschrijft hoe Slate persoonsgegevens verwerkt: de Android- en iOS-app en de website van Slate. Het is opgesteld conform artikel 13 van Verordening (EU) 2016/679 (“AVG”) en het Italiaanse Wetsbesluit 196/2003, zoals gewijzigd door Wetsbesluit 101/2018 (de “Italiaanse privacycode”).',
    ],
    sections: [
      {
        title: 'Hoe de Slate-app met je gegevens omgaat',
        blocks: [
          'De Slate-app bewaart je gegevens op je telefoon. Hij heeft geen account en geen server die wij beheren: blokken, diensten, rotaties, instellingen en herinneringen blijven alleen op het toestel. Wij ontvangen ze niet. De app bevat geen analyse, advertenties of tracking.',
          [
            '**Agenda’s op de telefoon** (Android en iOS). Als je toegang tot de agenda toestaat, toont de app de afspraken uit de agenda’s op je telefoon en kopieert hij, als je dat kiest, je blokken en diensten naar een agenda. Dit gebeurt op het toestel; wij sturen niets op.',
            '**Google Agenda** (optioneel, Android; nog niet beschikbaar op iOS). Als je inlogt met Google en synchronisatie aanzet, verbindt de app rechtstreeks vanaf je telefoon met de Google Agenda-dienst, met de machtigingen die je goedkeurt: afspraken lezen en schrijven en je agenda’s opvragen. Blokken worden gekopieerd naar een agenda met de naam “Slate” in je Google-account, en je Google-afspraken worden ernaast getoond. Het Google-toegangstoken wordt op het toestel bewaard en wordt niet naar een server van ons gestuurd. Het gebruik en de doorgifte aan andere apps van informatie die Slate van Google-API’s ontvangt, voldoen aan de Google API Services User Data Policy, inclusief de eisen van “Limited Use”. Je kunt de toegang op elk moment intrekken in je Google-account of door de synchronisatie in de app uit te zetten.',
            '**Herinneringen en meldingen**. Herinneringen vóór afspraken en diensten worden door je telefoon ingepland en getoond. Ze gebruiken geen server. Je kunt ze wijzigen of uitzetten in Instellingen › Meldingen.',
            '**Controle op updates** (Android). Ongeveer elke zes uur vraagt de app aan GitHub (api.github.com) of er een nieuwere versie van Slate is. Wanneer je kiest een update te installeren, wordt de APK van GitHub gedownload en wordt de SHA-256-controlesom gecontroleerd vóór de installatie. GitHub ontvangt de technische gegevens die zo’n verzoek meebrengt, zoals je IP-adres, volgens de eigen privacyverklaring van GitHub.',
            '**Ko-fi**. De steunlink opent ko-fi.com in je browser. De app stuurt niets naar Ko-fi. Op eventuele donaties is het privacybeleid van Ko-fi van toepassing.',
            '**Back-ups**. Je kunt je gegevens exporteren naar een bestand en later weer importeren. Het bestand wordt opgeslagen waar jij kiest en wordt nooit naar ons gestuurd. Wie het bestand heeft, kan het lezen: bewaar het zorgvuldig.',
          ],
        ],
      },
      {
        title: 'De website van Slate',
        blocks: [
          'De website leest en schrijft je agenda’s niet. Accounts op de website dienen om in te loggen en om de inhoud te bewaren die je op de website maakt.',
        ],
      },
      {
        title: '1. Verwerkingsverantwoordelijke',
        blocks: [
          'De verwerkingsverantwoordelijke is **Matteo Genesio**, te bereiken per e-mail op **egenesio@proton.me**. Voor gegevens die alleen op je toestel bestaan, zoals hierboven beschreven, hebben wij geen toegang en stuurt de app ze niet naar ons.',
        ],
      },
      {
        title: '2. Gegevens die wij verwerken',
        blocks: [
          'Voor de website verwerken wij de volgende categorieën persoonsgegevens:',
          [
            '**Accountgegevens**: je e-mailadres en, als je je met e-mail en wachtwoord registreert, je wachtwoord (versleuteld opgeslagen en nooit door ons leesbaar). Als je inlogt met Google, ontvangen wij van Google je e-mailadres, naam en profielfoto, zoals je die hebt toegestaan op het toestemmingsscherm van Google.',
            '**Dienstgegevens**: de inhoud die je op de website maakt (titels van blokken, categorie, begin- en eindtijd, kleur, herhaling), die nodig is om de planner te laten werken.',
            '**Technische gegevens**: IP-adres, type browser en apparaat, die automatisch worden verzameld door onze infrastructuurleveranciers (Vercel, Supabase) voor de beveiliging en werking van de dienst.',
            '**Cookies**: wij gebruiken alleen technische cookies die nodig zijn om je ingelogd te houden. Wij gebruiken geen profilerings-, analyse- of marketingcookies van derden.',
          ],
          'In de app verzamelen wij geen persoonsgegevens. De gegevens die je in de app invoert, zijn hierboven beschreven en blijven op je toestel.',
        ],
      },
      {
        title: '3. Doeleinden en rechtsgronden van de verwerking',
        blocks: [
          [
            '**Levering van de website** (accounts, bewaren van je inhoud): art. 6(1)(b) AVG, uitvoering van een overeenkomst.',
            '**Beveiliging en voorkomen van misbruik en fraude**: art. 6(1)(f) AVG, gerechtvaardigd belang van de verwerkingsverantwoordelijke.',
            '**Essentiële servicemeldingen** (bijv. accountberichten): art. 6(1)(b) AVG.',
            '**Telefoonagenda, Google Agenda en meldingen in de app**: art. 6(1)(a) AVG, je toestemming, gegeven wanneer je de machtiging verleent of de functie aanzet. Je kunt die op elk moment intrekken in de app of in de instellingen van je telefoon.',
            '**Controle op updates en melding van een nieuwe versie** (Android): art. 6(1)(f) AVG, gerechtvaardigd belang om je de actuele versie te laten installeren. Je kunt de melding uitzetten in Instellingen › Meldingen.',
          ],
          'Wij doen geen directe marketing, profilering of reclame op basis van je gegevens.',
        ],
      },
      {
        title: '4. Ontvangers van de gegevens en externe leveranciers',
        blocks: [
          'Gegevens die voor de website worden verwerkt, worden verwerkt door leveranciers die optreden als verwerkers (art. 28 AVG), contractueel gebonden om ze alleen voor de hierboven genoemde doeleinden te verwerken:',
          [
            '**Supabase Inc.**: hosting van de database en authenticatie voor accounts op de website. Gegevens worden opgeslagen op servers in Ierland (EU).',
            '**Vercel Inc.**: hosting van de website. Bedrijf gevestigd in de Verenigde Staten.',
            '**Google LLC**: inloggen met een Google-account, als je dat op de website kiest; en, als je de Google-synchronisatie in de app aanzet, de agendadienst waarmee je verbindt. Google ontvangt de verzoeken die jij doet; wij ontvangen ze niet. Bedrijf gevestigd in de Verenigde Staten.',
            '**GitHub, Inc.**: host de Slate-releases en beantwoordt de updatecontroles van de app. Bedrijf gevestigd in de Verenigde Staten.',
          ],
          'Ko-fi is een site van derden. De app opent die alleen als je de link aantikt.',
        ],
      },
      {
        title: '5. Doorgifte van gegevens buiten de EU',
        blocks: [
          'Vercel Inc., Google LLC en GitHub, Inc. zijn gevestigd in de Verenigde Staten. Doorgiftes naar deze leveranciers berusten op passende waarborgen volgens hoofdstuk V van de AVG, zoals de standaardcontractbepalingen die de Europese Commissie heeft goedgekeurd en/of deelname aan het EU-VS Data Privacy Framework, waar van toepassing. Je kunt de verwerkingsverantwoordelijke om meer informatie over deze waarborgen vragen.',
        ],
      },
      {
        title: '6. Bewaartermijn',
        blocks: [
          'Accountgegevens van de website en inhoud worden bewaard zolang je een actief account hebt. Als je vraagt je account te verwijderen, worden de persoonsgegevens en de bijbehorende inhoud binnen 30 dagen gewist, behalve wat wettelijk langer moet worden bewaard. Technische logs worden maximaal 12 maanden bewaard.',
          'Gegevens van de app blijven op je toestel totdat je ze wist (Instellingen › Back-up › alle gegevens wissen) of de app verwijdert. Afspraken die zijn gekopieerd naar je Google- of telefoonagenda blijven daar staan totdat je ze in die diensten verwijdert.',
        ],
      },
      {
        title: '7. Je rechten',
        blocks: [
          'Als betrokkene heb je het recht om:',
          [
            'je persoonsgegevens in te zien (art. 15 AVG);',
            'ze te laten corrigeren als ze onjuist zijn (art. 16 AVG);',
            'ze te laten wissen, binnen de grenzen van de wet (art. 17 AVG);',
            'de verwerking te laten beperken (art. 18 AVG);',
            'je gegevens te ontvangen in een gestructureerd, leesbaar formaat (overdraagbaarheid, art. 20 AVG);',
            'bezwaar te maken tegen verwerking op grond van gerechtvaardigd belang (art. 21 AVG);',
            'een gegeven toestemming op elk moment in te trekken, zonder dat dit de rechtmatigheid van eerdere verwerking aantast.',
          ],
          'Voor gegevens die alleen op je toestel staan, kun je deze rechten zelf uitoefenen: een back-up exporteren, items in de app corrigeren of verwijderen, of alle gegevens wissen. Voor gegevens van de website schrijf je naar **egenesio@proton.me**. Je hebt ook het recht om een klacht in te dienen bij de bevoegde toezichthoudende autoriteit:',
          'Garante per la protezione dei dati personali (Italiaanse toezichthouder), Piazza Venezia 11, 00187 Rome: www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Minderjarigen',
        blocks: [
          'De Dienst is niet bedoeld voor kinderen jonger dan 14 jaar (leeftijd voor digitale toestemming volgens art. 2-quinquies van de Italiaanse privacycode). Wij verzamelen niet bewust gegevens van kinderen onder die leeftijd; als we tot de ontdekking komen dat we die wel hebben verzameld, wissen we ze.',
        ],
      },
      {
        title: '9. Beveiliging van gegevens',
        blocks: [
          'De app bewaart zijn gegevens in de privéopslag van de app op je toestel, die andere apps niet kunnen lezen. Voor de website nemen wij passende technische en organisatorische maatregelen, waaronder versleutelde verbindingen (TLS/HTTPS), scheiding van gegevens tussen gebruikers via Row Level Security op databaseniveau, en toegang tot gegevens beperkt tot geautoriseerd personeel.',
        ],
      },
      {
        title: '10. Wijzigingen in dit beleid',
        blocks: [
          'Dit beleid kan in de loop van de tijd worden bijgewerkt, bijvoorbeeld wanneer een nieuwe functie verandert wat de app doet. Bij substantiële wijzigingen laten wij je dat weten via de Dienst of per e-mail voordat ze ingaan.',
        ],
      },
      {
        title: '11. Contact',
        blocks: [
          'Voor vragen over dit beleid of over de verwerking van je gegevens, schrijf naar **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Voorwaarden voor het gebruik van de Slate-app en -website.',
    updated: 'Laatst bijgewerkt: 25 november 2026',
    intro: [
      'Deze Gebruiksvoorwaarden (“Voorwaarden”) regelen het gebruik van Slate (de “Dienst”), de Android- en iOS-app en de website, aangeboden door **Matteo Genesio** (“de Eigenaar”, “wij”). Door de Dienst te gebruiken accepteer je deze Voorwaarden volledig.',
    ],
    sections: [
      {
        title: '1. Beschrijving van de Dienst',
        blocks: [
          'Slate is een app en een website om je week in tijdblokken te organiseren (studie, werk, lessen en andere categorieën), met diensten, rotaties, loonschattingen en herinneringen. De app werkt op je toestel zonder account. De Dienst is gratis: er zijn geen betaalde functies en geen abonnementen. Vrijwillige steun via Ko-fi is optioneel en ontgrendelt niets. De Dienst is in actieve ontwikkeling, dus functies kunnen na verloop van tijd worden toegevoegd, gewijzigd of verwijderd.',
        ],
      },
      {
        title: '2. Accounts en vereisten',
        blocks: [
          'De app vereist geen account. Sommige functies van de website vereisen een account, gemaakt met e-mail en wachtwoord of door in te loggen met Google. Je moet minstens 14 jaar oud zijn om een account aan te maken. Je bent verantwoordelijk voor het geheimhouden van je inloggegevens en voor alle activiteit via je account.',
        ],
      },
      {
        title: '3. Toegestaan gebruik',
        blocks: [
          'Door Slate te gebruiken ga je ermee akkoord om niet:',
          [
            'de Dienst te gebruiken voor illegale of ongeoorloofde doeleinden;',
            'ongeoorloofd toegang te proberen te krijgen tot gegevens of systemen van de Dienst;',
            'de normale werking van de Dienst te verstoren (bijv. door aanvallen, geautomatiseerd scrapen of opzettelijke overbelasting);',
            'inhoud te uploaden die illegaal, beledigend is of de rechten van anderen schendt.',
          ],
        ],
      },
      {
        title: '4. Je inhoud',
        blocks: [
          'Je behoudt het volledige eigendom van de inhoud die je in Slate invoert (titels van blokken, tijden, categorieën, diensten). Inhoud in de app blijft op je toestel. Voor inhoud op de website verleen je ons een beperkte, niet-exclusieve licentie om die alleen op te slaan en te verwerken om je de Dienst te leveren. Wij claimen geen rechten op je inhoud en delen die niet met derden, behalve zoals beschreven in ons [Privacybeleid](/privacy).',
        ],
      },
      {
        title: '5. Machtigingen en diensten van derden',
        blocks: [
          'Als je toegang tot de agenda toestaat, of inlogt met Google om met Google Agenda te synchroniseren, ben je verantwoordelijk voor de machtigingen die je verleent. Google, GitHub en Ko-fi zijn diensten van derden met eigen voorwaarden en privacyverklaringen; de app verbindt alleen met hen op de manier die in het [Privacybeleid](/privacy) is beschreven.',
          'Updates zijn optioneel. De app kan je laten weten dat er een nieuwe versie is, maar jij beslist of en wanneer je die installeert.',
        ],
      },
      {
        title: '6. Intellectueel eigendom van de Dienst',
        blocks: [
          'De code, het ontwerp, het merk “Slate” en elk ander onderdeel van de Dienst dat geen jouw inhoud is, blijven eigendom van de Eigenaar en zijn beschermd door de toepasselijke intellectuele-eigendomswetgeving. Je mag ze niet kopiëren, wijzigen of verspreiden zonder schriftelijke toestemming.',
        ],
      },
      {
        title: '7. Beschikbaarheid van de Dienst',
        blocks: [
          'De Dienst wordt geleverd “zoals hij is”, zonder garantie op continuïteit, foutvrijheid of geschiktheid voor een bepaald doel. Herinneringen hangen af van de instellingen van je telefoon en het besturingssysteem en kunnen te laat komen of uitblijven. Omdat het een product in actieve ontwikkeling is, kunnen er onderbrekingen, onderhoud of wijzigingen in functies optreden. Beschouw Slate niet als je enige bron van kritieke informatie over je afspraken.',
        ],
      },
      {
        title: '8. Beperking van aansprakelijkheid',
        blocks: [
          'Voor zover het toepasselijke recht dat toestaat, is de Eigenaar niet aansprakelijk voor indirecte schade, verlies van gegevens of gederfde winst die voortvloeit uit het gebruik van of het onvermogen om de Dienst te gebruiken. Niets in deze Voorwaarden sluit aansprakelijkheid uit of beperkt die die niet uitgesloten of beperkt kan worden op grond van het toepasselijke recht, waaronder de dwingende rechten die consumenten worden toegekend. Maak regelmatig back-ups met de exportfunctie van de app.',
        ],
      },
      {
        title: '9. Opschorting en beëindiging',
        blocks: [
          'Je kunt je account op de website op elk moment verwijderen; bij verwijdering worden je gegevens verwerkt zoals beschreven in ons [Privacybeleid](/privacy). Het verwijderen van de app wist de gegevens op je telefoon. Wij behouden ons het recht voor accounts op te schorten of te beëindigen die deze Voorwaarden schenden, waarbij we je waar redelijkerwijs mogelijk vooraf informeren.',
        ],
      },
      {
        title: '10. Wijzigingen in de Voorwaarden',
        blocks: [
          'Wij kunnen deze Voorwaarden in de loop van de tijd bijwerken. Bij substantiële wijzigingen laten wij je dat redelijkerwijs vooraf weten via de Dienst of per e-mail.',
        ],
      },
      {
        title: '11. Toepasselijk recht en bevoegde rechter',
        blocks: [
          'Deze Voorwaarden worden beheerst door Italiaans recht. Als je de Dienst gebruikt als consument die in de Europese Unie woont, heb je het recht om een procedure te starten bij de rechter van de plaats waar je woont, onder de dwingende regels ter bescherming van consumenten. Je kunt ook het Europese platform voor online geschillenbeslechting (ODR) gebruiken, beschikbaar op [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '12. Contact',
        blocks: ['Voor vragen over deze Voorwaarden, schrijf naar **egenesio@proton.me**.'],
      },
    ],
  },
};
