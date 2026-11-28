import type { LegalDocs } from './types';

export const fr: LegalDocs = {
  privacy: {
    description:
      'Comment Slate traite les données personnelles de ses utilisateurs, au regard du règlement (UE) 2016/679 (RGPD).',
    updated: 'Dernière mise à jour : 28 novembre 2026',
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
          'Le site web utilise le même planificateur dans votre navigateur. Il n’a ni comptes ni connexion. Vos blocs, services, rotations et réglages sont enregistrés dans le stockage local de votre navigateur et ne sont pas envoyés à nos serveurs. Les seules données que le site envoie à nos serveurs sont les rappels que vous activez, comme décrit ci-dessous.',
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
          'Pour les rappels sur le site web, nous traitons les catégories de données personnelles suivantes :',
          [
            '**Données de rappel** : une clé aléatoire de l’appareil, conservée uniquement dans votre navigateur. Nous ne conservons qu’un hachage cryptographique de cette clé, jamais la clé. Avec elle, les éléments de rappel que votre navigateur nous transmet : les titres et heures de début de vos blocs et services des deux prochaines semaines, le délai choisi et les réglages de notification. Le titre fait partie de la notification affichée sur votre appareil.',
            '**Abonnement push** : l’adresse que votre navigateur fournit pour les notifications push (point de terminaison et clés de chiffrement), avec la langue de l’application.',
            '**Données techniques** : adresse IP et données techniques des requêtes, collectées par nos prestataires d’infrastructure (Vercel, Supabase) pour la sécurité et le fonctionnement du service.',
            '**Stockage** : le site conserve vos réglages et vos données de planning dans le stockage local de votre navigateur. Il ne dépose aucun cookie de suivi, d’analyse ou de marketing.',
          ],
          'Dans l’application, nous ne collectons aucune donnée personnelle. Les données que vous saisissez dans l’application sont décrites ci-dessus et restent sur votre appareil.',
        ],
      },
      {
        title: '3. Finalités et bases juridiques du traitement',
        blocks: [
          [
            '**Fourniture des rappels** que vous activez : art. 6(1)(b) RGPD, exécution d’un contrat.',
            '**Sécurité et prévention des abus et de la fraude** : art. 6(1)(f) RGPD, intérêt légitime du responsable.',
            '**Activation et désactivation des rappels** : art. 6(1)(a) RGPD, votre consentement, que vous pouvez retirer à tout moment.',
            '**Calendrier du téléphone, Google Agenda et notifications dans l’application** : art. 6(1)(a) RGPD, votre consentement, donné lorsque vous accordez l’autorisation ou activez la fonction. Vous pouvez le retirer à tout moment dans l’application ou dans les réglages de votre téléphone.',
            '**Vérification des mises à jour et avis de nouvelle version** (Android) : art. 6(1)(f) RGPD, intérêt légitime à vous faire installer la version actuelle. Vous pouvez désactiver l’avis dans Réglages › Notifications.',
          ],
          'Nous ne pratiquons ni prospection directe, ni profilage, ni publicité fondés sur vos données.',
        ],
      },
      {
        title: '4. Destinataires des données et prestataires tiers',
        blocks: [
          'Les données de rappel sont traitées par des prestataires agissant en qualité de sous-traitants (art. 28 RGPD), liés par contrat à ne les traiter que pour les finalités énoncées ci-dessus :',
          [
            '**Supabase Inc.** : conserve les données de rappel et exécute les fonctions qui envoient les notifications. Les données sont stockées sur des serveurs situés en Irlande (UE).',
            '**Vercel Inc.** : hébergement du site web. Société basée aux États-Unis.',
            '**Services push des navigateurs** (par exemple Google, Mozilla ou Apple) : ils acheminent chaque rappel vers votre navigateur ; nous ne les contrôlons pas. Google reçoit aussi les requêtes que vous faites si vous connectez Google Agenda dans l’application. Société établie aux États-Unis.',
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
          'Les données de rappel sont conservées ainsi. Les éléments sont supprimés une fois leur heure de début passée (au plus tard un jour après) et remplacés à chaque synchronisation de votre navigateur. La clé de l’appareil et l’abonnement push sont conservés jusqu’à ce que vous désactiviez les rappels dans les réglages, ce qui les supprime immédiatement. Les journaux techniques sont conservés 12 mois au maximum.',
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
          'Pour les données conservées uniquement sur votre appareil, vous pouvez exercer ces droits vous-même : exporter une sauvegarde, corriger ou supprimer des éléments dans l’application, ou effacer toutes les données. Pour les données de rappel du site web, vous pouvez désactiver les rappels dans les réglages, ce qui les supprime immédiatement de nos serveurs. Pour tout le reste, écrivez à **egenesio@proton.me**. Vous avez également le droit d’introduire une réclamation auprès de l’autorité de contrôle compétente :',
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
          'L’application conserve ses données sur votre appareil, où les autres applications ne peuvent pas les lire. Pour les rappels, nous appliquons des mesures techniques et organisationnelles appropriées : la clé de l’appareil n’est conservée que dans votre navigateur et seul un hachage est stocké sur nos serveurs ; les connexions sont chiffrées (TLS/HTTPS) ; les tables de rappel ne peuvent pas être lues depuis le site web et ne sont utilisées que par nos fonctions de rappel ; l’accès est limité au personnel autorisé.',
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
    updated: 'Dernière mise à jour : 28 novembre 2026',
    intro: [
      'Les présentes Conditions d’utilisation (« Conditions ») régissent l’utilisation de Slate (le « Service »), l’application Android et iOS et le site web, fournis par **Matteo Genesio** (« le Titulaire », « nous »). En utilisant le Service, vous acceptez intégralement les présentes Conditions.',
    ],
    sections: [
      {
        title: '1. Description du Service',
        blocks: [
          'Slate est une application et un site pour organiser votre semaine en blocs horaires (études, travail, cours et autres catégories), avec services, rotations, estimations de salaire et rappels. Les deux fonctionnent sur votre appareil sans compte. Le service est gratuit : il n’a ni fonctionnalités payantes ni abonnements. Le soutien volontaire via Ko-fi est facultatif et ne débloque rien. Le service est en développement actif : des fonctionnalités peuvent être ajoutées, modifiées ou retirées avec le temps.',
        ],
      },
      {
        title: '2. Absence de comptes et conditions requises',
        blocks: [
          'Slate n’a pas de comptes. Vos données sont conservées dans le navigateur ou l’application de l’appareil que vous utilisez, et vous êtes responsable de la sécurité de cet appareil. Effacer les données du site dans votre navigateur, ou désinstaller l’application, supprime les données conservées sur cet appareil ; comme il n’y a pas de compte, nous ne pouvons pas les récupérer pour vous. Les rappels sur le site web nécessitent un navigateur prenant en charge les notifications push.',
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
          'Vous conservez la pleine propriété des contenus que vous saisissez dans Slate (titres de blocs, heures, catégories, services). Les contenus restent sur votre appareil. Les données de rappel ne nous sont transmises que comme décrit dans notre [Politique de confidentialité](/privacy), et uniquement pour fournir les rappels que vous activez. Nous ne revendiquons aucun droit sur vos contenus et ne les partageons pas avec des tiers, sauf comme indiqué dans la Politique de confidentialité.',
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
          'Vous pouvez désactiver les rappels à tout moment dans les réglages, ce qui supprime les données de rappel conservées pour votre navigateur. Effacer les données du site dans votre navigateur, ou désinstaller l’application, supprime les données conservées sur votre appareil. Nous nous réservons le droit de suspendre le service ou les rappels de toute personne qui enfreint ces conditions, en la prévenant lorsque c’est raisonnablement possible.',
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
