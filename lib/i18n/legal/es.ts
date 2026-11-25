import type { LegalDocs } from './types';

export const es: LegalDocs = {
  privacy: {
    description:
      'Cómo Slate trata los datos personales de sus usuarios, conforme al Reglamento (UE) 2016/679 (RGPD).',
    updated: 'Última actualización: 25 de noviembre de 2026',
    intro: [
      'Esta política describe cómo trata Slate los datos personales: la app para Android e iOS y el sitio web de Slate. Se redacta conforme al artículo 13 del Reglamento (UE) 2016/679 («RGPD») y al Decreto Legislativo italiano 196/2003, modificado por el Decreto Legislativo 101/2018 (el «Código de Privacidad italiano»).',
    ],
    sections: [
      {
        title: 'Cómo trata la app Slate tus datos',
        blocks: [
          'La app Slate guarda tus datos en el teléfono. No tiene cuenta ni servidor gestionado por nosotros: bloques, turnos, rotaciones, ajustes y recordatorios se quedan solo en el dispositivo. No los recibimos. La app no contiene analítica, publicidad ni seguimiento.',
          [
            '**Calendarios del teléfono** (Android e iOS). Si permites el acceso al calendario, la app muestra los eventos de los calendarios del teléfono y, si lo eliges, copia tus bloques y turnos a un calendario. Todo ocurre en el dispositivo; no enviamos nada.',
            '**Google Calendar** (opcional, Android; todavía no disponible en iOS). Si inicias sesión con Google y activas la sincronización, la app se conecta directamente desde el teléfono al servicio Google Calendar, con los permisos que apruebas: leer y escribir eventos y listar tus calendarios. Los bloques se copian a un calendario llamado «Slate» en tu cuenta de Google, y tus eventos de Google se muestran junto a ellos. El token de acceso de Google se guarda en el dispositivo y no se envía a ningún servidor nuestro. El uso y la transferencia a cualquier otra app de la información recibida de las API de Google por parte de Slate cumplen la Google API Services User Data Policy, incluidos sus requisitos de «Limited Use». Puedes revocar el acceso en cualquier momento desde tu cuenta de Google o desactivando la sincronización en la app.',
            '**Recordatorios y notificaciones**. Los recordatorios antes de eventos y turnos los programa y muestra el teléfono. No usan ningún servidor. Puedes cambiarlos o desactivarlos en Ajustes › Notificaciones.',
            '**Comprobación de actualizaciones** (Android). Aproximadamente cada seis horas, la app consulta a GitHub (api.github.com) si existe una versión más reciente de Slate. Cuando eliges instalar una actualización, el APK se descarga de GitHub y se verifica su suma SHA-256 antes de instalarlo. GitHub recibe los datos técnicos que lleva cualquier solicitud de este tipo, como tu dirección IP, según su propia declaración de privacidad.',
            '**Ko-fi**. El enlace de apoyo abre ko-fi.com en el navegador. La app no envía nada a Ko-fi. Para cualquier donación se aplica la política de privacidad de Ko-fi.',
            '**Copias de seguridad**. Puedes exportar tus datos a un archivo y volver a importarlos. El archivo se guarda donde tú elijas y nunca nos llega. Quien tenga el archivo puede leerlo, así que guárdalo con cuidado.',
          ],
        ],
      },
      {
        title: 'El sitio web de Slate',
        blocks: [
          'El sitio web no lee ni escribe tus calendarios. Las cuentas del sitio sirven para iniciar sesión y conservar el contenido que creas en él.',
        ],
      },
      {
        title: '1. Responsable del tratamiento',
        blocks: [
          'El responsable del tratamiento es **Matteo Genesio**, al que se puede escribir a **egenesio@proton.me**. Para los datos que existen solo en tu dispositivo, tal como se describe arriba, no tenemos acceso y la app no nos los transmite.',
        ],
      },
      {
        title: '2. Datos que tratamos',
        blocks: [
          'Para el sitio web tratamos las siguientes categorías de datos personales:',
          [
            '**Datos de la cuenta**: tu dirección de correo y, si te registras con correo y contraseña, la contraseña (guardada cifrada y nunca legible por nosotros). Si inicias sesión con Google, recibimos de Google tu correo, nombre y foto de perfil, según autorizaste en la pantalla de consentimiento de Google.',
            '**Datos del servicio**: el contenido que creas en el sitio (títulos de bloques, categoría, horas de inicio y fin, color, recurrencia), necesario para que funcione el planificador.',
            '**Datos técnicos**: dirección IP, tipo de navegador y de dispositivo, recogidos automáticamente por nuestros proveedores de infraestructura (Vercel, Supabase) para la seguridad y el funcionamiento del servicio.',
            '**Cookies**: solo usamos cookies técnicas necesarias para mantener tu sesión iniciada. No usamos cookies de perfilado, de analítica ni de marketing de terceros.',
          ],
          'En la app no recogemos datos personales. Los datos que introduces en la app se describen arriba y se quedan en tu dispositivo.',
        ],
      },
      {
        title: '3. Finalidades y bases jurídicas del tratamiento',
        blocks: [
          [
            '**Prestación del sitio** (cuentas, conservación de tu contenido): art. 6(1)(b) RGPD, ejecución de un contrato.',
            '**Seguridad y prevención de abusos y fraudes**: art. 6(1)(f) RGPD, interés legítimo del responsable.',
            '**Comunicaciones esenciales del servicio** (p. ej., avisos de cuenta): art. 6(1)(b) RGPD.',
            '**Calendario del teléfono, Google Calendar y notificaciones en la app**: art. 6(1)(a) RGPD, tu consentimiento, otorgado al conceder el permiso o activar la función. Puedes retirarlo en cualquier momento desde la app o los ajustes del teléfono.',
            '**Comprobación de actualizaciones y aviso de nueva versión** (Android): art. 6(1)(f) RGPD, interés legítimo en que instales la versión actual. Puedes desactivar el aviso en Ajustes › Notificaciones.',
          ],
          'No realizamos marketing directo, perfilado ni publicidad basados en tus datos.',
        ],
      },
      {
        title: '4. Destinatarios de los datos y proveedores terceros',
        blocks: [
          'Los datos tratados para el sitio se encargan a proveedores que actúan como encargados del tratamiento (art. 28 RGPD), obligados por contrato a tratarlos solo para las finalidades indicadas:',
          [
            '**Supabase Inc.**: alojamiento de la base de datos y autenticación de las cuentas del sitio. Los datos se guardan en servidores ubicados en Irlanda (UE).',
            '**Vercel Inc.**: alojamiento del sitio web. Empresa con sede en Estados Unidos.',
            '**Google LLC**: inicio de sesión con cuenta de Google, si lo eliges en el sitio; y, si activas la sincronización con Google en la app, el servicio de calendario al que te conectas. Google recibe las solicitudes que haces; nosotros no las recibimos. Empresa con sede en Estados Unidos.',
            '**GitHub, Inc.**: aloja las versiones de Slate y responde a las comprobaciones de actualización de la app. Empresa con sede en Estados Unidos.',
          ],
          'Ko-fi es un sitio de terceros. La app solo lo abre cuando tocas el enlace.',
        ],
      },
      {
        title: '5. Transferencias de datos fuera de la UE',
        blocks: [
          'Vercel Inc., Google LLC y GitHub, Inc. tienen sede en Estados Unidos. Las transferencias a estos proveedores se basan en garantías adecuadas conforme al Capítulo V del RGPD, como las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea y/o la adhesión al Marco de Privacidad de Datos UE-EE. UU., cuando sea aplicable. Puedes pedir al responsable más información sobre estas garantías.',
        ],
      },
      {
        title: '6. Plazo de conservación',
        blocks: [
          'Los datos de la cuenta del sitio y el contenido se conservan mientras tengas una cuenta activa. Si pides la supresión de tu cuenta, los datos personales y el contenido relacionado se eliminan en un plazo de 30 días, salvo lo que deba conservarse más tiempo por obligación legal. Los registros técnicos se conservan un máximo de 12 meses.',
          'Los datos de la app permanecen en tu dispositivo hasta que los borres (Ajustes › Copia de seguridad › borrar todos los datos) o desinstales la app. Los eventos copiados a tus calendarios de Google o del teléfono siguen ahí hasta que los elimines en esos servicios.',
        ],
      },
      {
        title: '7. Tus derechos',
        blocks: [
          'Como interesado, tienes derecho a:',
          [
            'acceder a tus datos personales (art. 15 RGPD);',
            'rectificarlos si son inexactos (art. 16 RGPD);',
            'suprimirlos, dentro de los límites legales (art. 17 RGPD);',
            'limitar su tratamiento (art. 18 RGPD);',
            'recibir tus datos en un formato estructurado y legible (portabilidad, art. 20 RGPD);',
            'oponerte al tratamiento basado en interés legítimo (art. 21 RGPD);',
            'retirar en cualquier momento el consentimiento dado, sin afectar a la licitud del tratamiento previo.',
          ],
          'Para los datos guardados solo en tu dispositivo puedes ejercer estos derechos tú mismo: exporta una copia de seguridad, corrige o elimina elementos en la app, o borra todos los datos. Para los datos del sitio, escribe a **egenesio@proton.me**. También tienes derecho a presentar una reclamación ante la autoridad de control competente:',
          'Garante para la protección de datos personales (Italia), Piazza Venezia 11, 00187 Roma: www.garanteprivacy.it',
        ],
      },
      {
        title: '8. Menores',
        blocks: [
          'El Servicio no está destinado a niños menores de 14 años (edad de consentimiento digital según el art. 2-quinquies del Código de Privacidad italiano). No recogemos a sabiendas datos de menores de esa edad; si supiéramos que los hemos recogido, los eliminaríamos.',
        ],
      },
      {
        title: '9. Seguridad de los datos',
        blocks: [
          'La app guarda sus datos en el espacio privado de la app en tu dispositivo, que otras apps no pueden leer. Para el sitio adoptamos medidas técnicas y organizativas adecuadas, entre ellas conexiones cifradas (TLS/HTTPS), separación de datos entre usuarios mediante Row Level Security a nivel de base de datos y acceso limitado al personal autorizado.',
        ],
      },
      {
        title: '10. Cambios en esta política',
        blocks: [
          'Esta política puede actualizarse con el tiempo, por ejemplo cuando una función nueva cambie lo que hace la app. Si hacemos cambios sustanciales, te lo comunicaremos a través del Servicio o por correo antes de que entren en vigor.',
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
    description: 'Condiciones de uso de la app y del sitio Slate.',
    updated: 'Última actualización: 25 de noviembre de 2026',
    intro: [
      'Estas Condiciones de servicio («Condiciones») regulan el uso de Slate (el «Servicio»), la app para Android e iOS y el sitio web, prestados por **Matteo Genesio** («el Titular», «nosotros»). Al usar el Servicio aceptas estas Condiciones en su totalidad.',
    ],
    sections: [
      {
        title: '1. Descripción del Servicio',
        blocks: [
          'Slate es una app y un sitio para organizar tu semana en bloques de tiempo (estudio, trabajo, clases y otras categorías), con turnos, rotaciones, estimaciones de pago y recordatorios. La app funciona en tu dispositivo sin cuenta. El Servicio es gratuito: no tiene funciones de pago ni suscripciones. El apoyo voluntario a través de Ko-fi es opcional y no desbloquea nada. El Servicio está en desarrollo activo, por lo que las funciones pueden añadirse, cambiarse o eliminarse con el tiempo.',
        ],
      },
      {
        title: '2. Cuentas y requisitos',
        blocks: [
          'La app no requiere cuenta. Algunas funciones del sitio requieren una cuenta, creada con correo y contraseña o iniciando sesión con Google. Para crear una cuenta debes tener al menos 14 años. Eres responsable de mantener tus credenciales en secreto y de toda la actividad realizada a través de tu cuenta.',
        ],
      },
      {
        title: '3. Uso permitido',
        blocks: [
          'Al usar Slate aceptas no:',
          [
            'usar el Servicio con fines ilícitos o no autorizados;',
            'intentar acceder sin autorización a los datos o sistemas del Servicio;',
            'interferir con el funcionamiento normal del Servicio (p. ej., mediante ataques, scraping automatizado o sobrecargas intencionadas);',
            'subir contenidos ilícitos, ofensivos o que vulneren derechos de terceros.',
          ],
        ],
      },
      {
        title: '4. Tu contenido',
        blocks: [
          'Conservas la plena titularidad de los contenidos que introduces en Slate (títulos de bloques, horas, categorías, turnos). El contenido de la app se queda en tu dispositivo. Para el contenido del sitio, nos concedes una licencia limitada y no exclusiva para almacenarlo y tratarlo únicamente con el fin de prestarte el Servicio. No reclamamos derechos sobre tu contenido y no lo compartimos con terceros salvo lo indicado en nuestra [Política de privacidad](/privacy).',
        ],
      },
      {
        title: '5. Permisos y servicios de terceros',
        blocks: [
          'Si permites el acceso al calendario, o inicias sesión con Google para sincronizar con Google Calendar, eres responsable de los permisos que concedes. Google, GitHub y Ko-fi son servicios de terceros con sus propias condiciones y políticas de privacidad; la app se conecta a ellos solo en los términos descritos en la [Política de privacidad](/privacy).',
          'Las actualizaciones son opcionales. La app puede avisarte de que hay una nueva versión, pero tú decides si instalarla y cuándo.',
        ],
      },
      {
        title: '6. Propiedad intelectual del Servicio',
        blocks: [
          'El código, el diseño, la marca «Slate» y cualquier otra parte del Servicio que no sea tu contenido siguen siendo propiedad del Titular y están protegidos por las leyes de propiedad intelectual aplicables. No puedes copiarlos, modificarlos ni distribuirlos sin permiso por escrito.',
        ],
      },
      {
        title: '7. Disponibilidad del Servicio',
        blocks: [
          'El Servicio se ofrece «tal cual», sin garantía de continuidad, ausencia de errores ni idoneidad para un fin concreto. Los recordatorios dependen de los ajustes del teléfono y del sistema operativo, y pueden llegar con retraso o no llegar. Al tratarse de un producto en desarrollo activo, puede haber interrupciones, mantenimientos o cambios en las funciones. No consideres Slate como tu única fuente de información crítica sobre tus compromisos.',
        ],
      },
      {
        title: '8. Limitación de responsabilidad',
        blocks: [
          'En la máxima medida permitida por la ley aplicable, el Titular no responde de daños indirectos, pérdida de datos ni pérdida de beneficios derivados del uso o de la imposibilidad de usar el Servicio. Nada en estas Condiciones excluye ni limita una responsabilidad que no pueda excluirse ni limitarse conforme a la ley aplicable, incluidos los derechos imperativos que la normativa de consumo reconoce a los consumidores. Haz copias de seguridad periódicas con la función de exportar de la app.',
        ],
      },
      {
        title: '9. Suspensión y terminación',
        blocks: [
          'Puedes eliminar tu cuenta del sitio en cualquier momento; al eliminarla, tus datos se tratarán como se describe en nuestra [Política de privacidad](/privacy). Al desinstalar la app se borran sus datos del teléfono. Nos reservamos el derecho de suspender o cerrar cuentas que incumplan estas Condiciones, avisándote cuando sea razonablemente posible.',
        ],
      },
      {
        title: '10. Cambios en las Condiciones',
        blocks: [
          'Podemos actualizar estas Condiciones con el tiempo. Si hacemos cambios sustanciales, te lo comunicaremos a través del Servicio o por correo con antelación razonable a su entrada en vigor.',
        ],
      },
      {
        title: '11. Ley aplicable y jurisdicción',
        blocks: [
          'Estas Condiciones se rigen por la ley italiana. Si usas el Servicio como consumidor residente en la Unión Europea, tienes derecho a acudir a los tribunales del lugar donde resides, conforme a las normas imperativas de protección de los consumidores. También puedes usar la plataforma europea de resolución de litigios en línea (ODR), disponible en [ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr).',
        ],
      },
      {
        title: '12. Contacto',
        blocks: ['Para preguntas sobre estas Condiciones, escribe a **egenesio@proton.me**.'],
      },
    ],
  },
};
