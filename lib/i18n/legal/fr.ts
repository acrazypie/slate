import type { LegalDocs } from './types';

export const fr: LegalDocs = {
  privacy: {
    description:
      'Comment Slate traite les données personnelles de ses utilisateurs, au regard du règlement (UE) 2016/679 (RGPD).',
    updated: 'Dernière mise à jour : 25 novembre 2026',
    intro: [
      'Cette politique décrit comment Slate traite les données personnelles : l’application Android et iOS et le site web de Slate. Elle est rédigée conformément à l’article 13 du règlement (UE) 2016/679 (« RGPD ») et au décret législatif italien 196/2003 modifié par le décret législatif 101/2018 (le « Code italien de la vie privée »).',
    ],
    sections: [
      {
        title: 'Comment l’application Slate traite vos données',
        blocks: [
          'L’application Slate conserve vos données sur votre téléphone. Elle n’a ni compte ni serveur géré par nous : vos blocs, postes, rotations, réglages et rappels restent uniquement sur l’appareil. Nous ne les recevons pas. L’application ne contient ni analyse, ni publicité, ni suivi.',
          [
            '**Calendriers du téléphone** (Android et iOS). Si vous autorisez l’accès au calendrier, l’application affiche les événements des calendriers du téléphone et, si vous le choisissez, copie vos blocs et postes dans un calendrier. Tout cela se passe sur l’appareil ; nous n’envoyons rien.',
            '**Google Agenda** (facultatif, Android ; pas encore disponible sur iOS). Si vous vous connectez avec Google et activez la synchronisation, l’application se connecte directement depuis votre téléphone au service Google Agenda, avec les autorisations que vous approuvez : lire et écrire des événements et lister vos agendas. Les blocs sont copiés dans un agenda nommé « Slate » sur votre compte Google, et vos événements Google s’affichent à côté. Le jeton d’accès Google est conservé sur l’appareil et n’est envoyé à aucun serveur géré par nous. L’utilisation et le transfert, vers toute autre application, des informations reçues des API Google par Slate respectent la Google API Services User Data Policy, y compris ses exigences de « Limited Use ». Vous pouvez révoquer l’accès à tout moment depuis votre compte Google ou en désactivant la synchronisation dans l’application.',
            '**Rappels et notifications**. Les rappels avant les événements et les postes sont programmés et affichés par votre téléphone. Ils n’utilisent aucun serveur. Vous pouvez les modifier ou les désactiver dans Réglages › Notifications.',
            '**Vérification des mises à jour** (Android). Environ toutes les six heures, l’application demande à GitHub (api.github.com) si une version plus récente de Slate existe. Lorsque vous choisissez d’installer une mise à jour, l’APK est téléchargé depuis GitHub et sa somme SHA-256 est vérifiée avant l’installation. GitHub reçoit les données techniques qu’une telle requête transporte, comme votre adresse IP, selon sa propre politique de confidentialité.',
            '**Ko-fi**. Le lien de soutien ouvre ko-fi.com dans votre navigateur. L’application n’envoie rien à Ko-fi. La politique de confidentialité de Ko-fi s’applique à tout don que vous y faites.',
            '**Sauvegardes**. Vous pouvez exporter vos données dans un fichier et les réimporter. Le fichier est enregistré où vous le choisissez et ne nous est jamais envoyé. Toute personne qui possède ce fichier peut le lire : conservez-le en lieu sûr.',
          ],
        ],
      },
      {
        title: 'Le site web de Slate',
        blocks: [
          'Le site web ne lit ni n’écrit dans vos agendas. Les comptes du site servent à vous connecter et à conserver les contenus que vous y créez.',
        ],
      },
      {
        title: '1. Responsable du traitement',
        blocks: [
          'Le responsable du traitement est **Matteo Genesio**, joignable par email à **egenesio@proton.me**. Pour les données qui n’existent que sur votre appareil, comme décrit ci-dessus, nous n’y avons pas accès et l’application ne nous les transmet pas.',
        ],
      },
      {
        title: '2. Données traitées',
        blocks: [
          'Pour le site web, nous traitons les catégories de données personnelles suivantes :',
          [
            '**Données de compte** : votre adresse email et, si vous vous inscrivez avec email et mot de passe, votre mot de passe (conservé sous forme chiffrée et jamais lisible par nous). Si vous vous connectez avec Google, nous recevons de Google votre adresse email, votre nom et votre photo de profil, comme vous l’avez autorisé sur l’écran de consentement Google.',
            '**Données de service** : les contenus que vous créez sur le site (titres des blocs, catégorie, heures de début et de fin, couleur, récurrence), nécessaires au fonctionnement du planificateur.',
            '**Données techniques** : adresse IP, type de navigateur et d’appareil, collectés automatiquement par nos fournisseurs d’infrastructure (Vercel, Supabase) pour la sécurité et le fonctionnement du service.',
            '**Cookies** : nous n’utilisons que des cookies techniques nécessaires à votre connexion. Nous n’utilisons ni cookies de profilage, ni d’analyse, ni de marketing tiers.',
          ],
          'Dans l’application, nous ne collectons aucune donnée personnelle. Les données que vous saisissez dans l’application sont décrites ci-dessus et restent sur votre appareil.',
        ],
      },
      {
        title: '3. Finalités et bases juridiques du traitement',
        blocks: [
          [
            '**Fourniture du site** (comptes, conservation de vos contenus) : art. 6(1)(b) RGPD, exécution d’un contrat.',
            '**Sécurité et prévention des abus et de la fraude** : art. 6(1)(f) RGPD, intérêt légitime du responsable.',
            '**Communications de service essentielles** (par ex. avis de compte) : art. 6(1)(b) RGPD.',
            '**Calendrier du téléphone, Google Agenda et notifications dans l’application** : art. 6(1)(a) RGPD, votre consentement, donné lorsque vous accordez l’autorisation ou activez la fonction. Vous pouvez le retirer à tout moment dans l’application ou dans les réglages de votre téléphone.',
            '**Vérification des mises à jour et avis de nouvelle version** (Android) : art. 6(1)(f) RGPD, intérêt légitime à vous faire installer la version actuelle. Vous pouvez désactiver l’avis dans Réglages › Notifications.',
          ],
          'Nous ne pratiquons ni prospection directe, ni profilage, ni publicité fondés sur vos données.',
        ],
      },
      {
        title: '4. Destinataires des données et prestataires tiers',
        blocks: [
          'Les données traitées pour le site sont confiées à des prestataires agissant en qualité de sous-traitants (art. 28 RGPD), tenus contractuellement de ne les traiter que pour les finalités indiquées ci-dessus :',
          [
            '**Supabase Inc.** : hébergement de la base de données et authentification des comptes du site. Les données sont stockées sur des serveurs situés en Irlande (UE).',
            '**Vercel Inc.** : hébergement du site web. Société basée aux États-Unis.',
            '**Google LLC** : connexion avec un compte Google, si vous la choisissez sur le site ; et, si vous activez la synchronisation Google dans l’application, le service d’agenda auquel vous vous connectez. Google reçoit les requêtes que vous faites ; nous ne les recevons pas. Société basée aux États-Unis.',
            '**GitHub, Inc.** : héberge les versions de Slate et répond aux vérifications de mise à jour de l’application. Société basée aux États-Unis.',
          ],
          'Ko-fi est un site tiers. L’application ne l’ouvre que lorsque vous touchez le lien.',
        ],
      },
      {
        title: '5. Transferts de données hors de l’UE',
        blocks: [
          'Vercel Inc., Google LLC et GitHub, Inc. sont basés aux États-Unis. Les transferts vers ces prestataires reposent sur des garanties appropriées au titre du chapitre V du RGPD, telles que les clauses contractuelles types approuvées par la Commission européenne et/ou l’adhésion au Data Privacy Framework UE-États-Unis, le cas échéant. Vous pouvez demander au responsable du traitement plus d’informations sur ces garanties.',
        ],
      },
      {
        title: '6. Durée de conservation',
        blocks: [
          'Les données du compte du site et les contenus sont conservés tant que votre compte est actif. Si vous demandez la suppression de votre compte, les données personnelles et les contenus associés sont supprimés dans un délai de 30 jours, sauf ce qui doit être conservé plus longtemps en vertu d’obligations légales. Les journaux techniques sont conservés 12 mois au maximum.',
          'Les données de l’application restent sur votre appareil jusqu’à ce que vous les effaciez (Réglages › Sauvegarde › effacer toutes les données) ou que vous désinstalliez l’application. Les événements copiés dans vos agendas Google ou du téléphone y restent jusqu’à ce que vous les supprimiez dans ces services.',
        ],
      },
      {
        title: '7. Vos droits',
        blocks: [
          'En tant que personne concernée, vous avez le droit de :',
          [
            'accéder à vos données personnelles (art. 15 RGPD) ;',
            'les faire rectifier si elles sont inexactes (art. 16 RGPD) ;',
            'les faire effacer, dans les limites prévues par la loi (art. 17 RGPD) ;',
            'obtenir la limitation du traitement (art. 18 RGPD) ;',
            'recevoir vos données dans un format structuré et lisible (portabilité, art. 20 RGPD) ;',
            's’opposer au traitement fondé sur l’intérêt légitime (art. 21 RGPD) ;',
            'retirer à tout moment le consentement donné, sans remettre en cause la licéité du traitement effectué auparavant.',
          ],
          'Pour les données conservées uniquement sur votre appareil, vous pouvez exercer ces droits vous-même : exporter une sauvegarde, corriger ou supprimer des éléments dans l’application, ou effacer toutes les données. Pour les données du site, écrivez à **egenesio@proton.me**. Vous avez également le droit d’introduire une réclamation auprès de l’autorité de contrôle compétente :',
          'Garante per la protezione dei dati personali (autorité italienne de protection des données), Piazza Venezia 11, 00187 Rome : www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Mineurs',
        blocks: [
          'Le Service n’est pas destiné aux enfants de moins de 14 ans (âge du consentement numérique au titre de l’art. 2-quinquies du Code italien de la vie privée). Nous ne collectons pas sciemment de données de mineurs de cet âge ; si nous apprenions en avoir collecté, nous les supprimerions.',
        ],
      },
      {
        title: '9. Sécurité des données',
        blocks: [
          'L’application conserve ses données dans l’espace privé de l’application sur votre appareil, que les autres applications ne peuvent pas lire. Pour le site, nous prenons des mesures techniques et organisationnelles appropriées, notamment des connexions chiffrées (TLS/HTTPS), une séparation des données entre utilisateurs par Row Level Security au niveau de la base de données, et un accès aux données limité au personnel autorisé.',
        ],
      },
      {
        title: '10. Modifications de cette politique',
        blocks: [
          'Cette politique peut être mise à jour au fil du temps, par exemple lorsqu’une nouvelle fonction change ce que fait l’application. En cas de modification substantielle, nous vous en informerons via le Service ou par email avant son entrée en vigueur.',
        ],
      },
      {
        title: '11. Contact',
        blocks: [
          'Pour toute question sur cette politique ou sur le traitement de vos données, écrivez à **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Conditions d’utilisation de l’application et du site Slate.',
    updated: 'Dernière mise à jour : 25 novembre 2026',
    intro: [
      'Les présentes Conditions d’utilisation (« Conditions ») régissent l’utilisation de Slate (le « Service »), l’application Android et iOS et le site web, fournis par **Matteo Genesio** (« le Titulaire », « nous »). En utilisant le Service, vous acceptez intégralement les présentes Conditions.',
    ],
    sections: [
      {
        title: '1. Description du Service',
        blocks: [
          'Slate est une application et un site pour organiser votre semaine en blocs de temps (étude, travail, cours et autres catégories), avec des postes, des rotations, des estimations de salaire et des rappels. L’application fonctionne sur votre appareil sans compte. Le Service est gratuit : il n’a aucune fonction payante ni abonnement. Le soutien volontaire via Ko-fi est facultatif et ne débloque rien. Le Service est en développement actif : des fonctions peuvent être ajoutées, modifiées ou supprimées au fil du temps.',
        ],
      },
      {
        title: '2. Comptes et conditions requises',
        blocks: [
          'L’application ne nécessite pas de compte. Certaines fonctions du site exigent un compte, créé avec email et mot de passe ou par connexion avec Google. Vous devez avoir au moins 14 ans pour créer un compte. Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée via votre compte.',
        ],
      },
      {
        title: '3. Utilisation autorisée',
        blocks: [
          'En utilisant Slate, vous acceptez de ne pas :',
          [
            'utiliser le Service à des fins illégales ou non autorisées ;',
            'tenter d’accéder sans autorisation aux données ou aux systèmes du Service ;',
            'perturber le fonctionnement normal du Service (par ex. par des attaques, du scraping automatisé ou une surcharge intentionnelle) ;',
            'téléverser des contenus illégaux, offensants ou portant atteinte aux droits d’autrui.',
          ],
        ],
      },
      {
        title: '4. Vos contenus',
        blocks: [
          'Vous conservez la pleine propriété des contenus que vous saisissez dans Slate (titres des blocs, horaires, catégories, postes). Les contenus de l’application restent sur votre appareil. Pour les contenus du site, vous nous accordez une licence limitée et non exclusive de les stocker et de les traiter uniquement afin de vous fournir le Service. Nous ne revendiquons aucun droit sur vos contenus et ne les partageons avec des tiers que comme indiqué dans notre [Politique de confidentialité](/privacy).',
        ],
      },
      {
        title: '5. Autorisations et services tiers',
        blocks: [
          'Si vous autorisez l’accès au calendrier, ou si vous vous connectez avec Google pour synchroniser Google Agenda, vous êtes responsable des autorisations accordées. Google, GitHub et Ko-fi sont des services tiers avec leurs propres conditions et politiques de confidentialité ; l’application ne s’y connecte que dans les conditions décrites dans la [Politique de confidentialité](/privacy).',
          'Les mises à jour sont facultatives. L’application peut vous signaler qu’une nouvelle version est disponible, mais c’est vous qui décidez si et quand l’installer.',
        ],
      },
      {
        title: '6. Propriété intellectuelle du Service',
        blocks: [
          'Le code, le design, la marque « Slate » et toute autre partie du Service qui ne constitue pas vos contenus restent la propriété du Titulaire et sont protégés par les lois applicables en matière de propriété intellectuelle. Vous ne pouvez pas les copier, les modifier ni les distribuer sans autorisation écrite.',
        ],
      },
      {
        title: '7. Disponibilité du Service',
        blocks: [
          'Le Service est fourni « en l’état », sans garantie de continuité, d’absence d’erreurs ou d’adéquation à un usage particulier. Les rappels dépendent des réglages de votre téléphone et du système d’exploitation ; ils peuvent arriver en retard ou ne pas arriver. Il s’agit d’un produit en développement actif : des interruptions, des maintenances ou des changements de fonctions peuvent survenir. Ne considérez pas Slate comme votre seule source d’information critique sur vos engagements.',
        ],
      },
      {
        title: '8. Limitation de responsabilité',
        blocks: [
          'Dans la mesure maximale permise par la loi applicable, le Titulaire n’est pas responsable des dommages indirects, de la perte de données ou de la perte de bénéfices résultant de l’utilisation du Service ou de l’impossibilité de l’utiliser. Rien dans les présentes Conditions n’exclut ni ne limite une responsabilité qui ne peut être exclue ou limitée en vertu de la loi applicable, y compris les droits impératifs reconnus aux consommateurs. Effectuez des sauvegardes régulières avec la fonction d’export de l’application.',
        ],
      },
      {
        title: '9. Suspension et résiliation',
        blocks: [
          'Vous pouvez supprimer votre compte du site à tout moment ; lors de la suppression, vos données seront traitées comme décrit dans notre [Politique de confidentialité](/privacy). La désinstallation de l’application supprime ses données de votre téléphone. Nous nous réservons le droit de suspendre ou de fermer les comptes qui enfreignent les présentes Conditions, en vous en avertissant lorsque c’est raisonnablement possible.',
        ],
      },
      {
        title: '10. Modifications des Conditions',
        blocks: [
          'Nous pouvons mettre à jour les présentes Conditions au fil du temps. En cas de modification substantielle, nous vous en informerons via le Service ou par email, raisonnablement avant leur entrée en vigueur.',
        ],
      },
      {
        title: '11. Droit applicable et juridiction',
        blocks: [
          'Les présentes Conditions sont régies par le droit italien. Si vous utilisez le Service en tant que consommateur résidant dans l’Union européenne, vous avez le droit de saisir les tribunaux du lieu où vous résidez, conformément aux règles impératives de protection des consommateurs. Vous pouvez également utiliser la plateforme européenne de règlement en ligne des litiges (RLL), disponible sur [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '12. Contact',
        blocks: ['Pour toute question sur les présentes Conditions, écrivez à **egenesio@proton.me**.'],
      },
    ],
  },
};
