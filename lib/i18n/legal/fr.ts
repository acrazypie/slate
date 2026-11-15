import type { LegalDocs } from './types';

export const fr: LegalDocs = {
  privacy: {
    description:
      'Informations sur le traitement des données personnelles des utilisateurs de Slate, conformément au Règlement (UE) 2016/679 (RGPD).',
    updated: 'Dernière mise à jour : 10 novembre 2026',
    intro: [
      'La présente politique décrit la manière dont sont traitées les données personnelles des utilisateurs de Slate (le « Service »), conformément à l’art. 13 du Règlement (UE) 2016/679 (« RGPD ») et au décret législatif italien 196/2003, tel que modifié par le décret législatif 101/2018 (le « Code italien de la vie privée »).',
    ],
    sections: [
      {
        title: '1. Responsable du traitement',
        blocks: [
          'Le responsable du traitement est **Matteo Genesio**, joignable à l’adresse e-mail **egenesio@proton.me**.',
        ],
      },
      {
        title: '2. Données collectées',
        blocks: [
          'Nous traitons les catégories de données personnelles suivantes :',
          [
            '**Données de compte** : adresse e-mail et, si tu choisis de t’inscrire avec un e-mail et un mot de passe, le mot de passe (conservé sous forme chiffrée et jamais lisible par nous). Si tu te connectes via Google, nous recevons de Google ton adresse e-mail, ton nom et ta photo de profil, selon ce que tu as autorisé sur l’écran de consentement de Google.',
            '**Données d’utilisation du Service** : les contenus que tu crées dans Slate (titres des blocs horaires, catégorie, heures de début et de fin, couleur, répétition), nécessaires au fonctionnement de la planification hebdomadaire.',
            '**Données techniques** : adresse IP, type de navigateur et d’appareil, collectés automatiquement par nos fournisseurs d’infrastructure (Vercel, Supabase) pour des raisons de sécurité et de fonctionnement du service.',
            '**Cookies** : nous utilisons exclusivement des cookies techniques nécessaires au maintien de la session de connexion (authentification). Nous n’utilisons pas de cookies de profilage, d’analyse d’audience ou de marketing tiers.',
          ],
        ],
      },
      {
        title: '3. Finalités et base juridique du traitement',
        blocks: [
          [
            '**Fourniture du Service** (création du compte, synchronisation des données entre appareils) : base juridique art. 6.1.b RGPD, exécution d’un contrat auquel la personne concernée est partie.',
            '**Sécurité, prévention des abus et des fraudes** : base juridique art. 6.1.f RGPD, intérêt légitime du responsable du traitement.',
            '**Communications de service essentielles** (p. ex. notifications relatives à ton compte) : base juridique art. 6.1.b RGPD.',
          ],
          'Nous ne pratiquons actuellement ni marketing direct, ni profilage, ni publicité fondée sur tes données.',
        ],
      },
      {
        title: '4. Destinataires des données et prestataires tiers',
        blocks: [
          'Tes données sont traitées par des prestataires tiers agissant en qualité de sous-traitants (art. 28 RGPD), tenus par contrat de ne traiter les données que pour les finalités indiquées ci-dessus :',
          [
            '**Supabase Inc.** — hébergement de la base de données et gestion de l’authentification. Les données sont conservées sur des serveurs situés en Irlande (UE).',
            '**Vercel Inc.** — hébergement de l’application web. Société établie aux États-Unis.',
            '**Google LLC** — authentification via un compte Google (OAuth), uniquement si tu choisis de te connecter de cette manière. Société établie aux États-Unis.',
          ],
        ],
      },
      {
        title: '5. Transfert de données hors de l’UE',
        blocks: [
          'Vercel Inc. et Google LLC sont établies aux États-Unis. Le transfert de données vers ces prestataires s’effectue sur la base de garanties appropriées au sens du chapitre V du RGPD, telles que les clauses contractuelles types approuvées par la Commission européenne et/ou l’adhésion au cadre de protection des données UE-États-Unis (Data Privacy Framework), le cas échéant. Tu peux demander plus d’informations sur ces garanties en contactant le responsable du traitement.',
        ],
      },
      {
        title: '6. Durée de conservation',
        blocks: [
          'Les données de ton compte et les contenus que tu crées sont conservés aussi longtemps que tu as un compte actif sur Slate. Si tu demandes la suppression de ton compte, tes données personnelles et les contenus associés sont supprimés dans un délai de 30 jours, sauf ce qui doit être conservé plus longtemps en vertu d’obligations légales. Les journaux techniques sont conservés pendant 12 mois au maximum.',
        ],
      },
      {
        title: '7. Tes droits',
        blocks: [
          'En tant que personne concernée, tu as le droit :',
          [
            'd’accéder à tes données personnelles (art. 15 RGPD) ;',
            'd’en obtenir la rectification si elles sont inexactes (art. 16 RGPD) ;',
            'd’en obtenir l’effacement, dans les limites prévues par la loi (art. 17 RGPD) ;',
            'd’obtenir la limitation du traitement (art. 18 RGPD) ;',
            'de recevoir tes données dans un format structuré et lisible (portabilité, art. 20 RGPD) ;',
            'de t’opposer au traitement fondé sur l’intérêt légitime (art. 21 RGPD) ;',
            'de retirer à tout moment un consentement éventuellement donné, sans que cela affecte la licéité du traitement déjà effectué.',
          ],
          'Tu peux exercer ces droits à tout moment en écrivant à **egenesio@proton.me**. Tu as également le droit d’introduire une réclamation auprès de l’autorité de contrôle compétente :',
          'Autorité italienne de protection des données (Garante per la protezione dei dati personali) — Piazza Venezia, 11, 00187 Rome, Italie — www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Mineurs',
        blocks: [
          'Le Service ne s’adresse pas aux mineurs de moins de 14 ans (âge du consentement numérique au sens de l’art. 2-quinquies du Code italien de la vie privée). Nous ne collectons pas sciemment de données de mineurs n’ayant pas atteint cet âge ; si nous apprenions avoir collecté de telles données, nous les supprimerions.',
        ],
      },
      {
        title: '9. Sécurité des données',
        blocks: [
          'Nous prenons des mesures techniques et organisationnelles appropriées pour protéger tes données, notamment des connexions chiffrées (TLS/HTTPS), le cloisonnement des données entre utilisateurs grâce à la Row Level Security au niveau de la base de données et un accès aux données limité au personnel autorisé.',
        ],
      },
      {
        title: '10. Modifications de la présente politique',
        blocks: [
          'Cette politique peut être mise à jour au fil du temps. En cas de modifications substantielles, nous t’en informerons via le Service ou par e-mail avant qu’elles ne prennent effet.',
        ],
      },
      {
        title: '11. Contact',
        blocks: [
          'Pour toute question relative à cette politique ou au traitement de tes données, écris à **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Conditions générales d’utilisation du Service Slate.',
    updated: 'Dernière mise à jour : 10 novembre 2026',
    intro: [
      'Les présentes Conditions d’utilisation (« Conditions ») régissent l’utilisation de Slate (le « Service »), fourni par **Matteo Genesio** (« le Titulaire », « nous »). En créant un compte ou en utilisant le Service, tu acceptes ces Conditions dans leur intégralité.',
    ],
    sections: [
      {
        title: '1. Description du Service',
        blocks: [
          'Slate est une application web qui permet d’organiser sa semaine à l’aide de blocs horaires (révisions, travail, cours et autres catégories). Le Service est actuellement proposé gratuitement et est en cours de développement actif : des fonctionnalités peuvent être ajoutées, modifiées ou supprimées au fil du temps. À l’avenir, nous pourrions introduire une offre payante avec des fonctionnalités supplémentaires (« Pro ») ; dans ce cas, des conditions spécifiques te seront présentées avant tout prélèvement, et l’utilisation des fonctionnalités gratuites existantes ne sera pas remise en cause.',
        ],
      },
      {
        title: '2. Inscription et conditions requises',
        blocks: [
          'Pour utiliser Slate, tu dois créer un compte avec un e-mail et un mot de passe ou en te connectant avec Google. Tu dois avoir au moins 14 ans pour créer un compte. Tu es responsable de la confidentialité de tes identifiants et de toutes les activités effectuées via ton compte.',
        ],
      },
      {
        title: '3. Utilisation autorisée',
        blocks: [
          'En utilisant Slate, tu t’engages à ne pas :',
          [
            'utiliser le Service à des fins illégales ou non autorisées ;',
            'tenter d’accéder sans autorisation aux données ou aux systèmes du Service ;',
            'perturber le fonctionnement normal du Service (p. ex. par des attaques, du scraping automatisé ou une surcharge intentionnelle) ;',
            'mettre en ligne des contenus illégaux, offensants ou portant atteinte aux droits de tiers.',
          ],
        ],
      },
      {
        title: '4. Tes contenus',
        blocks: [
          'Tu conserves l’entière propriété des contenus que tu saisis dans Slate (titres des blocs, horaires, catégories). Tu nous accordes une licence limitée et non exclusive pour conserver et traiter ces contenus dans le seul but de te fournir le Service (par exemple les synchroniser entre tes appareils). Nous ne revendiquons aucun droit sur tes contenus et ne les partageons pas avec des tiers en dehors de ce qui est indiqué dans notre [Politique de confidentialité](/privacy).',
        ],
      },
      {
        title: '5. Propriété intellectuelle du Service',
        blocks: [
          'Le code, le design, la marque « Slate » et tout autre élément du Service qui ne relève pas de tes contenus restent la propriété du Titulaire et sont protégés par les lois applicables en matière de propriété intellectuelle. Il est interdit de copier, de modifier ou de distribuer ces éléments sans autorisation écrite.',
        ],
      },
      {
        title: '6. Disponibilité du Service',
        blocks: [
          'Le Service est fourni « en l’état » (« as is »), sans garantie de continuité, d’absence d’erreurs ou d’adéquation à un usage particulier. S’agissant d’un produit en cours de développement actif, des interruptions, des opérations de maintenance ou des modifications de fonctionnalités peuvent survenir. Nous te conseillons de ne pas considérer Slate comme ta seule source d’informations essentielles sur tes engagements.',
        ],
      },
      {
        title: '7. Limitation de responsabilité',
        blocks: [
          'Dans toute la mesure permise par la loi applicable, le Titulaire n’est pas responsable des dommages indirects, des pertes de données ou du manque à gagner résultant de l’utilisation ou de l’impossibilité d’utiliser le Service. Aucune disposition des présentes Conditions n’exclut ni ne limite une responsabilité qui ne peut être exclue ou limitée en vertu de la loi applicable, y compris les droits impératifs reconnus aux consommateurs par le Code italien de la consommation (décret législatif 206/2005).',
        ],
      },
      {
        title: '8. Suspension et résiliation du compte',
        blocks: [
          'Tu peux supprimer ton compte à tout moment ; après la suppression, tes données seront traitées comme décrit dans notre [Politique de confidentialité](/privacy). Nous nous réservons le droit de suspendre ou de résilier les comptes qui enfreignent ces Conditions, en t’en informant lorsque cela est raisonnablement possible.',
        ],
      },
      {
        title: '9. Modifications des Conditions',
        blocks: [
          'Nous pouvons mettre à jour ces Conditions au fil du temps. En cas de modifications substantielles, nous t’en informerons via le Service ou par e-mail, dans un délai raisonnable avant leur entrée en vigueur.',
        ],
      },
      {
        title: '10. Droit applicable et juridiction compétente',
        blocks: [
          'Les présentes Conditions sont régies par le droit italien. Si tu utilises le Service en tant que consommateur résidant dans l’Union européenne, tu as le droit de saisir le tribunal de ton lieu de résidence, conformément aux règles impératives de protection des consommateurs. Tu peux également recourir à la plateforme européenne de règlement en ligne des litiges (RLL), disponible à l’adresse [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '11. Contact',
        blocks: ['Pour toute question relative à ces Conditions, écris à **egenesio@proton.me**.'],
      },
    ],
  },
};
