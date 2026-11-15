import type { LegalDocs } from './types';

export const es: LegalDocs = {
  privacy: {
    description:
      'Información sobre el tratamiento de los datos personales de los usuarios de Slate, conforme al Reglamento (UE) 2016/679 (RGPD).',
    updated: 'Última actualización: 10 de noviembre de 2026',
    intro: [
      'Esta política describe cómo se tratan los datos personales de los usuarios que utilizan Slate (el «Servicio»), conforme al art. 13 del Reglamento (UE) 2016/679 («RGPD») y al Decreto Legislativo italiano 196/2003, modificado por el Decreto Legislativo 101/2018 (el «Código de Privacidad italiano»).',
    ],
    sections: [
      {
        title: '1. Responsable del tratamiento',
        blocks: [
          'El responsable del tratamiento es **Matteo Genesio**, con quien puedes contactar en la dirección de correo electrónico **egenesio@proton.me**.',
        ],
      },
      {
        title: '2. Datos recogidos',
        blocks: [
          'Tratamos las siguientes categorías de datos personales:',
          [
            '**Datos de la cuenta**: dirección de correo electrónico y, si eliges registrarte con correo y contraseña, la contraseña (conservada de forma cifrada y nunca legible para nosotros). Si accedes mediante Google, recibimos de Google tu dirección de correo electrónico, nombre e imagen de perfil, según lo que hayas autorizado en la pantalla de consentimiento de Google.',
            '**Datos de uso del Servicio**: los contenidos que creas en Slate (títulos de los bloques horarios, categoría, horas de inicio y fin, color, repetición), necesarios para que funcione la planificación semanal.',
            '**Datos técnicos**: dirección IP, tipo de navegador y dispositivo, recogidos automáticamente por nuestros proveedores de infraestructura (Vercel, Supabase) por motivos de seguridad y funcionamiento del servicio.',
            '**Cookies**: utilizamos exclusivamente cookies técnicas necesarias para mantener la sesión iniciada (autenticación). No utilizamos cookies de elaboración de perfiles, analítica ni marketing de terceros.',
          ],
        ],
      },
      {
        title: '3. Finalidades y base jurídica del tratamiento',
        blocks: [
          [
            '**Prestación del Servicio** (creación de la cuenta, sincronización de los datos entre dispositivos): base jurídica art. 6.1.b RGPD, ejecución de un contrato en el que el interesado es parte.',
            '**Seguridad, prevención de abusos y fraudes**: base jurídica art. 6.1.f RGPD, interés legítimo del responsable.',
            '**Comunicaciones de servicio esenciales** (p. ej., notificaciones relativas a tu cuenta): base jurídica art. 6.1.b RGPD.',
          ],
          'Actualmente no realizamos marketing directo, elaboración de perfiles ni publicidad basada en tus datos.',
        ],
      },
      {
        title: '4. Destinatarios de los datos y proveedores externos',
        blocks: [
          'Tus datos son tratados por proveedores externos que actúan como encargados del tratamiento (art. 28 RGPD), obligados por contrato a tratar los datos únicamente para las finalidades indicadas arriba:',
          [
            '**Supabase Inc.** — alojamiento de la base de datos y gestión de la autenticación. Los datos se conservan en servidores situados en Irlanda (UE).',
            '**Vercel Inc.** — alojamiento de la aplicación web. Empresa con sede en Estados Unidos.',
            '**Google LLC** — autenticación mediante cuenta de Google (OAuth), solo si eliges acceder con este método. Empresa con sede en Estados Unidos.',
          ],
        ],
      },
      {
        title: '5. Transferencia de datos fuera de la UE',
        blocks: [
          'Vercel Inc. y Google LLC tienen su sede en Estados Unidos. La transferencia de datos a estos proveedores se realiza sobre la base de garantías adecuadas conforme al Capítulo V del RGPD, como las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea y/o la adhesión al Marco de Privacidad de Datos UE-EE. UU., cuando proceda. Puedes solicitar más información sobre estas garantías contactando con el responsable.',
        ],
      },
      {
        title: '6. Plazo de conservación',
        blocks: [
          'Los datos de tu cuenta y los contenidos que creas se conservan mientras mantengas una cuenta activa en Slate. Si solicitas la eliminación de tu cuenta, tus datos personales y los contenidos asociados se eliminan en un plazo de 30 días, salvo lo que deba conservarse más tiempo por obligaciones legales. Los registros técnicos se conservan durante un máximo de 12 meses.',
        ],
      },
      {
        title: '7. Tus derechos',
        blocks: [
          'Como interesado, tienes derecho a:',
          [
            'acceder a tus datos personales (art. 15 RGPD);',
            'obtener su rectificación si son inexactos (art. 16 RGPD);',
            'obtener su supresión, dentro de los límites previstos por la ley (art. 17 RGPD);',
            'obtener la limitación del tratamiento (art. 18 RGPD);',
            'recibir tus datos en un formato estructurado y legible (portabilidad, art. 20 RGPD);',
            'oponerte al tratamiento basado en el interés legítimo (art. 21 RGPD);',
            'retirar en cualquier momento un consentimiento que hayas dado, sin que ello afecte a la licitud del tratamiento ya realizado.',
          ],
          'Puedes ejercer estos derechos en cualquier momento escribiendo a **egenesio@proton.me**. También tienes derecho a presentar una reclamación ante la autoridad de control competente:',
          'Autoridad italiana de protección de datos (Garante per la protezione dei dati personali) — Piazza Venezia, 11, 00187 Roma, Italia — www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Menores',
        blocks: [
          'El Servicio no está dirigido a menores de 14 años (edad del consentimiento digital conforme al art. 2-quinquies del Código de Privacidad italiano). No recogemos conscientemente datos de menores de esa edad; si tuviéramos conocimiento de haber recogido tales datos, procederemos a eliminarlos.',
        ],
      },
      {
        title: '9. Seguridad de los datos',
        blocks: [
          'Adoptamos medidas técnicas y organizativas adecuadas para proteger tus datos, entre ellas conexiones cifradas (TLS/HTTPS), aislamiento de los datos entre usuarios mediante Row Level Security en la base de datos y acceso a los datos limitado al personal autorizado.',
        ],
      },
      {
        title: '10. Cambios en esta política',
        blocks: [
          'Esta política puede actualizarse con el tiempo. En caso de cambios sustanciales, te informaremos a través del Servicio o por correo electrónico antes de que los cambios surtan efecto.',
        ],
      },
      {
        title: '11. Contacto',
        blocks: [
          'Para cualquier pregunta sobre esta política o sobre el tratamiento de tus datos, escribe a **egenesio@proton.me**.',
        ],
      },
    ],
  },

  terms: {
    description: 'Términos y condiciones de uso del Servicio Slate.',
    updated: 'Última actualización: 10 de noviembre de 2026',
    intro: [
      'Estos Términos del Servicio («Términos») regulan el uso de Slate (el «Servicio»), prestado por **Matteo Genesio** («el Titular», «nosotros»). Al crear una cuenta o utilizar el Servicio, aceptas íntegramente estos Términos.',
    ],
    sections: [
      {
        title: '1. Descripción del Servicio',
        blocks: [
          'Slate es una aplicación web que permite organizar la semana mediante bloques horarios (estudio, trabajo, clases y otras categorías). El Servicio se ofrece actualmente de forma gratuita y está en desarrollo activo: pueden añadirse, modificarse o eliminarse funciones con el tiempo. En el futuro podríamos introducir un plan de pago con funciones adicionales («Pro»); en ese caso se te presentarán términos específicos antes de cualquier cargo, y el uso de las funciones gratuitas existentes no se verá afectado.',
        ],
      },
      {
        title: '2. Registro y requisitos',
        blocks: [
          'Para utilizar Slate debes crear una cuenta con correo electrónico y contraseña o accediendo con Google. Debes tener al menos 14 años para crear una cuenta. Eres responsable de la confidencialidad de tus credenciales y de toda la actividad realizada a través de tu cuenta.',
        ],
      },
      {
        title: '3. Uso permitido',
        blocks: [
          'Al utilizar Slate te comprometes a no:',
          [
            'utilizar el Servicio con fines ilegales o no autorizados;',
            'intentar acceder sin autorización a datos o sistemas del Servicio;',
            'interferir en el funcionamiento normal del Servicio (p. ej., mediante ataques, scraping automatizado o sobrecarga intencionada);',
            'subir contenidos ilegales, ofensivos o que vulneren derechos de terceros.',
          ],
        ],
      },
      {
        title: '4. Tus contenidos',
        blocks: [
          'Conservas la plena propiedad de los contenidos que introduces en Slate (títulos de los bloques, horarios, categorías). Nos concedes una licencia limitada y no exclusiva para conservar y tratar dichos contenidos únicamente con el fin de prestarte el Servicio (por ejemplo, sincronizarlos entre tus dispositivos). No reclamamos ningún derecho sobre tus contenidos y no los compartimos con terceros fuera de lo indicado en nuestra [Política de Privacidad](/privacy).',
        ],
      },
      {
        title: '5. Propiedad intelectual del Servicio',
        blocks: [
          'El código, el diseño, la marca «Slate» y cualquier otro elemento del Servicio que no forme parte de tus contenidos siguen siendo propiedad del Titular y están protegidos por la legislación aplicable en materia de propiedad intelectual. No está permitido copiar, modificar ni distribuir dichos elementos sin autorización por escrito.',
        ],
      },
      {
        title: '6. Disponibilidad del Servicio',
        blocks: [
          'El Servicio se presta «tal cual» («as is»), sin garantías de continuidad, ausencia de errores o idoneidad para un fin determinado. Al tratarse de un producto en desarrollo activo, pueden producirse interrupciones, tareas de mantenimiento o cambios en las funciones. Te recomendamos no considerar Slate la única fuente de información crítica sobre tus compromisos.',
        ],
      },
      {
        title: '7. Limitación de responsabilidad',
        blocks: [
          'En la máxima medida permitida por la ley aplicable, el Titular no es responsable de daños indirectos, pérdida de datos o lucro cesante derivados del uso o de la imposibilidad de uso del Servicio. Nada de lo dispuesto en estos Términos excluye o limita responsabilidades que no puedan excluirse o limitarse conforme a la ley aplicable, incluidos los derechos irrenunciables reconocidos a los consumidores por el Código de Consumo italiano (Decreto Legislativo 206/2005).',
        ],
      },
      {
        title: '8. Suspensión y cancelación de la cuenta',
        blocks: [
          'Puedes eliminar tu cuenta en cualquier momento; tras la eliminación, tus datos se tratarán como se describe en nuestra [Política de Privacidad](/privacy). Nos reservamos el derecho de suspender o cancelar las cuentas que infrinjan estos Términos, avisándote cuando sea razonablemente posible.',
        ],
      },
      {
        title: '9. Cambios en los Términos',
        blocks: [
          'Podemos actualizar estos Términos con el tiempo. En caso de cambios sustanciales, te informaremos a través del Servicio o por correo electrónico con una antelación razonable a su entrada en vigor.',
        ],
      },
      {
        title: '10. Ley aplicable y jurisdicción',
        blocks: [
          'Estos Términos se rigen por la ley italiana. Si utilizas el Servicio como consumidor residente en la Unión Europea, tienes derecho a acudir a los tribunales del lugar donde resides, conforme a las normas imperativas de protección de los consumidores. También puedes recurrir a la plataforma europea de resolución de litigios en línea (ODR), disponible en [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '11. Contacto',
        blocks: ['Para preguntas sobre estos Términos, escribe a **egenesio@proton.me**.'],
      },
    ],
  },
};
