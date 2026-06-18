import { Camera, MessageCircle, ThumbsUp, type LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Comunicaciones — bandeja unificada (DEMOSTRACIÓN).
   Las conversaciones son pre-pobladas y NO se conectan de verdad a ninguna
   red. Para el "detalle monster", el constructor vincula cada conversación a
   un cliente/caso REAL del sistema (los que se le pasen desde el servidor),
   de modo que el chip de cabecera lleve a su ficha real.

   Usamos íconos GENÉRICOS de la librería (no logos oficiales) y solo el color
   de acento de cada canal para identificar el origen; el resto del módulo vive
   en el lenguaje marino + dorado del sistema.
   ───────────────────────────────────────────────────────────────────────── */

export type Channel = "whatsapp" | "instagram" | "facebook";

export type ChannelMeta = {
  id: Channel;
  label: string;
  /** Color de acento del canal (solo para identificar el origen). */
  accent: string;
  Icon: LucideIcon;
};

export const CHANNELS: Record<Channel, ChannelMeta> = {
  whatsapp: { id: "whatsapp", label: "WhatsApp", accent: "#1faa59", Icon: MessageCircle },
  instagram: { id: "instagram", label: "Instagram", accent: "#d6256b", Icon: Camera },
  facebook: { id: "facebook", label: "Facebook", accent: "#2f72e6", Icon: ThumbsUp },
};

export const CHANNEL_ORDER: Channel[] = ["whatsapp", "instagram", "facebook"];

export type Topic =
  | "audiencia"
  | "honorarios"
  | "documentos"
  | "consulta"
  | "seguimiento"
  | "cita";

export type ChatMessage = { from: "in" | "out"; text: string; time: string };

export type Conversation = {
  id: string;
  channel: Channel;
  contact: string;
  /** Vínculo al cliente/caso real (null si no hay datos en el sistema). */
  clienteId: string | null;
  clienteNombre: string | null;
  casoId: string | null;
  casoTitulo: string | null;
  time: string;
  unread: number;
  topic: Topic;
  messages: ChatMessage[];
};

/** Vínculo real que entrega el servidor (cliente + caso ya existentes). */
export type ConvLink = {
  clienteId: string;
  clienteNombre: string;
  casoId: string;
  casoTitulo: string;
};

/* Plantillas de conversación — lenguaje natural dominicano, creíbles. */
type Template = Omit<
  Conversation,
  "id" | "contact" | "clienteId" | "clienteNombre" | "casoId" | "casoTitulo"
>;

const TEMPLATES: Template[] = [
  {
    channel: "whatsapp",
    time: "9:42 a. m.",
    unread: 2,
    topic: "audiencia",
    messages: [
      { from: "in", text: "Buenos días, Lic. Quería confirmar si la audiencia sigue para el martes.", time: "9:38 a. m." },
      { from: "out", text: "Buenos días. Sí, está confirmada para el martes a las 9:00 a. m. en el Palacio de Justicia.", time: "9:40 a. m." },
      { from: "in", text: "Perfecto, muchas gracias. ¿Debo llevar algún documento?", time: "9:41 a. m." },
      { from: "in", text: "¿O ustedes se encargan de todo?", time: "9:42 a. m." },
    ],
  },
  {
    channel: "instagram",
    time: "Ayer",
    unread: 3,
    topic: "honorarios",
    messages: [
      { from: "in", text: "Saludos, vi su perfil. Necesito asesoría con un tema de inquilinato.", time: "Ayer · 4:10 p. m." },
      { from: "in", text: "El propietario quiere desalojarme sin contrato firmado.", time: "Ayer · 4:11 p. m." },
      { from: "in", text: "¿Cuáles son sus honorarios para una primera consulta?", time: "Ayer · 4:12 p. m." },
    ],
  },
  {
    channel: "facebook",
    time: "Ayer",
    unread: 0,
    topic: "documentos",
    messages: [
      { from: "in", text: "Lic., ya tengo la cédula y el acta de nacimiento. ¿Se las envío por aquí?", time: "Ayer · 11:02 a. m." },
      { from: "out", text: "Sí, puede enviarlas por este medio o pasar por la oficina, lo que le quede más cómodo.", time: "Ayer · 11:15 a. m." },
      { from: "in", text: "Listo, se las mando ahora mismo. Mil gracias.", time: "Ayer · 11:16 a. m." },
    ],
  },
  {
    channel: "whatsapp",
    time: "Lun",
    unread: 0,
    topic: "honorarios",
    messages: [
      { from: "in", text: "Buenas tardes, ¿recibieron el pago de la primera cuota?", time: "Lun · 2:30 p. m." },
      { from: "out", text: "Buenas tardes. Sí, confirmado. Le envío el recibo en un momento.", time: "Lun · 2:34 p. m." },
      { from: "in", text: "Excelente, agradecido por la atención.", time: "Lun · 2:35 p. m." },
    ],
  },
  {
    channel: "instagram",
    time: "Lun",
    unread: 1,
    topic: "seguimiento",
    messages: [
      { from: "in", text: "Hola Lic., ¿hay alguna novedad con mi caso?", time: "Lun · 10:05 a. m." },
      { from: "out", text: "Hola. Estamos a la espera de que el tribunal fije la fecha de audiencia; le aviso apenas la tengamos.", time: "Lun · 10:20 a. m." },
      { from: "in", text: "Ok, quedo pendiente. Gracias.", time: "Lun · 10:21 a. m." },
    ],
  },
  {
    channel: "facebook",
    time: "Dom",
    unread: 0,
    topic: "cita",
    messages: [
      { from: "in", text: "Buenos días, quisiera agendar una cita para esta semana si es posible.", time: "Dom · 8:50 a. m." },
      { from: "out", text: "Con gusto. Tengo disponibilidad el jueves a las 3:00 p. m. ¿Le funciona?", time: "Dom · 9:05 a. m." },
      { from: "in", text: "Sí, perfecto. Nos vemos el jueves entonces.", time: "Dom · 9:06 a. m." },
    ],
  },
];

/** Nombres de respaldo si el sistema aún no tiene clientes/casos. */
const FALLBACK = [
  "María Fernández",
  "Pedro Jiménez",
  "Rosa Almonte",
  "Luis Castillo",
  "Carmen Disla",
  "José Ramírez",
];

/** Construye las conversaciones vinculando cada una a un cliente/caso real. */
export function buildConversations(links: ConvLink[]): Conversation[] {
  return TEMPLATES.map((t, i) => {
    const link = links.length > 0 ? links[i % links.length] : null;
    return {
      ...t,
      id: `conv-${i + 1}`,
      contact: link?.clienteNombre ?? FALLBACK[i % FALLBACK.length],
      clienteId: link?.clienteId ?? null,
      clienteNombre: link?.clienteNombre ?? null,
      casoId: link?.casoId ?? null,
      casoTitulo: link?.casoTitulo ?? null,
    };
  });
}

/* ── Respuestas rápidas + IA ─────────────────────────────────────────────── */

function firstName(contact: string): string {
  return contact.split(/\s+/)[0] ?? "estimado/a";
}

export type QuickReply = { label: string; build: (c: Conversation) => string };

export const QUICK_REPLIES: QuickReply[] = [
  {
    label: "Confirmar audiencia",
    build: (c) =>
      `Estimado/a ${firstName(c.contact)}, le confirmo que su audiencia está pautada. Le recomiendo llegar 30 minutos antes y traer su cédula. Quedo atento a cualquier duda. — JM & Asociados`,
  },
  {
    label: "Agendar consulta",
    build: (c) =>
      `Con gusto, ${firstName(c.contact)}. Tengo disponibilidad esta semana para su consulta. ¿Le funciona el jueves a las 3:00 p. m. o prefiere la mañana? Quedo atento.`,
  },
  {
    label: "Solicitar documentos",
    build: (c) =>
      `${firstName(c.contact)}, para avanzar necesitaría copia de su cédula y los documentos relacionados al caso. Puede enviarlos por este medio o traerlos a la oficina. Gracias.`,
  },
  {
    label: "Enviar honorarios",
    build: (c) =>
      `${firstName(c.contact)}, con gusto le detallo: la consulta inicial tiene un costo de RD$ 3,500, deducible del honorario si decide contratarnos. Le envío la propuesta formal por este medio.`,
  },
];

/** Sugerencia "redactada con IA": contextual al tema de la conversación. */
export function aiSuggestion(c: Conversation): string {
  const n = firstName(c.contact);
  switch (c.topic) {
    case "audiencia":
      return `Estimado/a ${n}, le confirmo que su audiencia se mantiene según lo previsto. Nosotros nos encargamos de presentar los escritos; usted solo debe asistir con su cédula y llegar 30 minutos antes. Le escribiré un recordatorio el día anterior. Cualquier inquietud, estoy a la orden.`;
    case "honorarios":
      return `${n}, gracias por contactarnos. La primera consulta tiene un costo de RD$ 3,500 (deducible si decide contratar nuestros servicios). En ella evaluamos su caso y le proponemos una estrategia clara. ¿Le gustaría que agendemos una cita esta semana?`;
    case "documentos":
      return `Perfecto, ${n}. Puede enviarme la cédula y el acta por este mismo medio; al recibirlas las anexo a su expediente y le confirmo. Si le resulta más cómodo, también puede traer los originales a la oficina. Muchas gracias por su diligencia.`;
    case "seguimiento":
      return `${n}, le comparto una actualización: su caso sigue su curso y estamos a la espera de que el tribunal fije la audiencia. Apenas tengamos la fecha se la comunico de inmediato. Agradezco su confianza y quedo pendiente.`;
    case "cita":
      return `Con gusto, ${n}. Le confirmo la cita para el jueves a las 3:00 p. m. en nuestra oficina. Si necesita reagendar, escríbame con tiempo y buscamos otro espacio. Nos vemos pronto.`;
    default:
      return `Estimado/a ${n}, gracias por su mensaje. Con gusto le doy seguimiento y le respondo a la brevedad con la información que necesita. Quedo a su entera disposición. — JM & Asociados`;
  }
}
