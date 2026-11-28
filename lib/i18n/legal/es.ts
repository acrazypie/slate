import type { LegalDocs } from './types';

export const es: LegalDocs = {
  privacy: {
    description:
      'Cómo Slate trata los datos personales de sus usuarios, conforme al Reglamento (UE) 2016/679 (RGPD).',
    updated: 'Última actualización: 28 de noviembre de 2026',
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
          'El sitio web funciona con el mismo planificador en tu navegador. No tiene cuentas ni inicio de sesión. Tus bloques, turnos, rotaciones y ajustes se guardan en el almacenamiento local de tu navegador y no se envían a nuestros servidores. Lo único que el sitio web envía a nuestros servidores son los recordatorios que activas, como se describe más abajo.',
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
          'Para los recordatorios del sitio web tratamos las siguientes categorías de datos personales:',
          [
            '**Datos de recordatorios**: una clave aleatoria del dispositivo que se guarda solo en tu navegador. Solo guardamos un hash criptográfico de ella, nunca la clave. Con ella, los elementos de recordatorio que tu navegador nos envía: los títulos y horas de inicio de tus bloques y turnos de las próximas dos semanas, el tiempo de antelación que elegiste y los ajustes de notificaciones. El título forma parte de la notificación que se muestra en tu dispositivo.',
            '**Suscripción push**: la dirección que tu navegador da para las notificaciones push web (endpoint y claves de cifrado), junto con el idioma de la app.',
            '**Datos técnicos**: dirección IP y datos técnicos de las peticiones, recogidos por nuestros proveedores de infraestructura (Vercel, Supabase) para la seguridad y el funcionamiento del servicio.',
            '**Almacenamiento**: el sitio guarda tus ajustes y los datos del planificador en el almacenamiento local de tu navegador. No establece cookies de seguimiento, analítica ni marketing.',
          ],
          'En la app no recogemos datos personales. Los datos que introduces en la app se describen arriba y se quedan en tu dispositivo.',
        ],
      },
      {
        title: '3. Finalidades y bases jurídicas del tratamiento',
        blocks: [
          [
            '**Prestación de los recordatorios** que activas: art. 6(1)(b) RGPD, ejecución de un contrato.',
            '**Seguridad y prevención de abusos y fraudes**: art. 6(1)(f) RGPD, interés legítimo del responsable.',
            '**Activar y desactivar los recordatorios**: art. 6(1)(a) RGPD, tu consentimiento, que puedes retirar en cualquier momento.',
            '**Calendario del teléfono, Google Calendar y notificaciones en la app**: art. 6(1)(a) RGPD, tu consentimiento, otorgado al conceder el permiso o activar la función. Puedes retirarlo en cualquier momento desde la app o los ajustes del teléfono.',
            '**Comprobación de actualizaciones y aviso de nueva versión** (Android): art. 6(1)(f) RGPD, interés legítimo en que instales la versión actual. Puedes desactivar el aviso en Ajustes › Notificaciones.',
          ],
          'No realizamos marketing directo, perfilado ni publicidad basados en tus datos.',
        ],
      },
      {
        title: '4. Destinatarios de los datos y proveedores terceros',
        blocks: [
          'Los datos de recordatorios los tratan proveedores que actúan como encargados del tratamiento (art. 28 RGPD), obligados por contrato a tratarlos solo para los fines indicados:',
          [
            '**Supabase Inc.**: guarda los datos de recordatorios y ejecuta las funciones que envían las notificaciones. Los datos se almacenan en servidores situados en Irlanda (UE).',
            '**Vercel Inc.**: alojamiento del sitio web. Empresa con sede en Estados Unidos.',
            '**Servicios push de los navegadores** (por ejemplo, Google, Mozilla o Apple): entregan cada recordatorio a tu navegador; no los controlamos. Google también recibe las peticiones que haces si conectas Google Calendar en la app. Empresa con sede en Estados Unidos.',
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
          'Los datos de recordatorios se conservan así. Los elementos se borran cuando pasa su hora de inicio (como máximo un día después) y se sustituyen cada vez que tu navegador se sincroniza. La clave del dispositivo y la suscripción push se conservan hasta que desactivas los recordatorios en Ajustes, lo que las borra de inmediato. Los registros técnicos se conservan un máximo de 12 meses.',
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
          'Para los datos guardados solo en tu dispositivo puedes ejercer estos derechos tú mismo: exportar una copia de seguridad, corregir o borrar elementos en la app, o borrar todos los datos. Para los datos de recordatorios del sitio web, puedes desactivar los recordatorios en Ajustes, lo que los borra de nuestros servidores de inmediato. Para cualquier otra cosa, escribe a **egenesio@proton.me**. También tienes derecho a presentar una reclamación ante la autoridad de control competente:',
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
          'La app guarda sus datos en tu dispositivo, donde otras apps no pueden leerlos. Para los recordatorios aplicamos medidas técnicas y organizativas adecuadas: la clave del dispositivo se guarda solo en tu navegador y solo se guarda un hash de ella en nuestros servidores; las conexiones están cifradas (TLS/HTTPS); las tablas de recordatorios no se pueden leer desde el sitio web y solo las usan nuestras funciones de recordatorios; y el acceso está limitado al personal autorizado.',
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
    updated: 'Última actualización: 28 de noviembre de 2026',
    intro: [
      'Estas Condiciones de servicio («Condiciones») regulan el uso de Slate (el «Servicio»), la app para Android e iOS y el sitio web, prestados por **Matteo Genesio** («el Titular», «nosotros»). Al usar el Servicio aceptas estas Condiciones en su totalidad.',
    ],
    sections: [
      {
        title: '1. Descripción del Servicio',
        blocks: [
          'Slate es una app y un sitio para organizar tu semana en bloques de tiempo (estudio, trabajo, clases y otras categorías), con turnos, rotaciones, estimaciones de salario y recordatorios. Ambos funcionan en tu dispositivo sin cuenta. El servicio es gratuito: no tiene funciones de pago ni suscripciones. El apoyo voluntario a través de Ko-fi es opcional y no desbloquea nada. El servicio está en desarrollo activo, así que las funciones pueden añadirse, cambiarse o eliminarse con el tiempo.',
        ],
      },
      {
        title: '2. Sin cuentas y requisitos',
        blocks: [
          'Slate no tiene cuentas. Tus datos se guardan en el navegador o la app del dispositivo que uses, y eres responsable de mantener ese dispositivo a salvo. Borrar los datos del sitio de tu navegador, o desinstalar la app, elimina los datos guardados en ese dispositivo, y como no hay cuenta no podemos recuperarlos por ti. Los recordatorios del sitio web necesitan un navegador que admita notificaciones push web.',
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
          'Conservas la plena titularidad de los contenidos que introduces en Slate (títulos de bloques, horas, categorías, turnos). Los contenidos se quedan en tu dispositivo. Los datos de recordatorios solo nos llegan como se describe en nuestra [Política de privacidad](/privacy), y únicamente para ofrecerte los recordatorios que activas. No reclamamos ningún derecho sobre tus contenidos y no los compartimos con terceros salvo lo indicado en la Política de privacidad.',
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
          'Puedes desactivar los recordatorios en cualquier momento en Ajustes, lo que borra los datos de recordatorios guardados para tu navegador. Borrar los datos del sitio en tu navegador, o desinstalar la app, elimina los datos guardados en tu dispositivo. Nos reservamos el derecho de suspender el servicio o los recordatorios de quien incumpla estas Condiciones, avisando cuando sea razonablemente posible.',
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
