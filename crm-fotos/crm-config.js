// Config de la REPLICA "Sesiones Fotográficas" (2do número / WhatsApp Web).
// Usa el MISMO index.html del panel principal (una sola fuente de código) — solo cambia
// esta config: marca, color y que arranca FIJO en el 2do número (whatsapp_qr).
// defaultNumFilter/lockNumFilter hacen que este panel solo atienda ese número.
window.CRM_CONFIG = window.DCARELA_CRM_CONFIG = {
  brandName: "D'Carela Compufoto",
  productName: "CRM WhatsApp Web",
  appTitle: "D'Carela · CRM WhatsApp Web",
  subtitle: "Panel separado · sesiones fotográficas · 2do número",
  logoText: "DC",
  logoUrl: "https://dcarelacompufoto.com/img/logo.webp",
  // Misma estética monocromática del CRM; la cinta de canal identifica esta réplica.
  accent: "#fafafa",
  accent2: "#737373",

  supabaseUrl: "https://rdmhyhsrewvrpqygtufa.supabase.co",
  supabaseAnonKey: "sb_publishable_XgucPR_5tPklv6sdUFAhDQ_6NbSf8fQ",

  // clave de notificaciones/almacenamiento PROPIA (no se pisa con el panel principal)
  notificationTag: "dcarela-fotos",
  // arranca y se queda FIJO en el 2do número: solo atiende esos clientes
  defaultNumFilter: "qr",
  lockNumFilter: true,
  showBridgeSetup: true,
  bridgePairingMode: "phone_code",
  appVersionUrl: "./app-version.json",
  // Opcional: completar cuando se vincule el número físico. Mientras esté vacío,
  // la agenda lo infiere de la primera conversación recibida por el puente.
  // Numero confirmado por el puente activo. Tambien se usa para recuperar
  // conversaciones antiguas del mismo dispositivo aunque una fila haya
  // quedado sin la marca source=whatsapp_qr.
  bridgeBusinessNumber: "18094785620",
  bridgeBusinessDisplayNumber: "809-478-5620",

  publicPortfolioUrl: "https://dcarelacompufoto.com/portafolio.html",
  publicCatalogUrl: "https://dcarelacompufoto.com/combos.html",
  publicGalleryUrl: "https://dcarelacompufoto.com/portafolio.html",
  publicWeddingUrl: "https://dcarelacompufoto.com/boda.html",

  metaPixelId: "1377359270081777",
  privateCombosMessage: "Te comparto los combos por aqui. Antes de confirmar disponibilidad necesito saber categoria, fecha tentativa y nombre.",

  addressText: "Estamos en C/ Juan Pablo Duarte, esquina Freddy Prestol Castillo, Los Mulos, Piedra Linda, Villa Hermosa, La Romana.",
  mapsUrl: "https://maps.app.goo.gl/WcmjureAxNySXza59",

  businessNumber: "18495245620",
  businessDisplayNumber: "849-524-5620",
  defaultView: "conversations",
  showAllViews: true,
  enabledViews: [
    "dashboard",
    "planning",
    "conversations",
    "bridge",
    "funnel",
    "prospecting",
    "poscustomers",
    "satisfaccion",
    "plantillas",
    "estados",
    "reminders",
    "manual",
    "config"
  ]
};
