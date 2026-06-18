/* ─────────────────────────────────────────────────────────────────────────
   Plantillas de documentos legales (DEMO). Se autocompletan con datos reales
   del cliente/caso. Lenguaje legal dominicano de referencia — NO constituyen
   documentos legales válidos.
   ───────────────────────────────────────────────────────────────────────── */

export const BUFETE = {
  nombre: "JM & Asociados | Abogados",
  rnc: "1-30-12345-6",
  direccion: "Torre Empresarial Caribe, Av. Winston Churchill, Piantini, Santo Domingo, D.N.",
  telefono: "(809) 555-0100",
  email: "info@jmasociados.do",
  abogado: "Lic. José Martínez",
  matricula: "Matrícula CARD No. 12345-00",
};

export type PlantillaKey =
  | "poder_representacion"
  | "contrato_servicios"
  | "acuerdo_transaccional"
  | "carta_intimacion"
  | "contrato_iguala"
  | "recibo_descargo";

export type PlantillaMeta = { key: PlantillaKey; label: string; descripcion: string };

export const PLANTILLAS: PlantillaMeta[] = [
  { key: "poder_representacion", label: "Poder de representación (cuota litis)", descripcion: "Otorga poder al bufete para representar al cliente." },
  { key: "contrato_servicios", label: "Contrato de servicios profesionales", descripcion: "Honorarios por servicios legales." },
  { key: "acuerdo_transaccional", label: "Acuerdo transaccional", descripcion: "Pone fin a un diferendo entre las partes." },
  { key: "carta_intimacion", label: "Carta de intimación / notificación", descripcion: "Requiere el cumplimiento de una obligación." },
  { key: "contrato_iguala", label: "Contrato de iguala (asesoría continua)", descripcion: "Asesoría legal mensual recurrente." },
  { key: "recibo_descargo", label: "Recibo de descargo y finiquito", descripcion: "Constancia de pago y descargo total." },
];

export const PLANTILLA_LABEL: Record<PlantillaKey, string> = Object.fromEntries(
  PLANTILLAS.map((p) => [p.key, p.label]),
) as Record<PlantillaKey, string>;

export type DatosContrato = {
  cliente?: { nombre: string; tipoDoc: string; documento: string | null; direccion: string | null } | null;
  caso?: { titulo: string; tipo: string; parteContraria: string | null; tribunal: string | null; expediente: string | null } | null;
  ciudad: string;
};

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function fechaLegal(d = new Date()): string {
  return `a los ${d.getDate()} (${d.getDate()}) días del mes de ${MESES[d.getMonth()]} del año ${d.getFullYear()}`;
}

function docLabel(tipoDoc: string): string {
  if (tipoDoc === "rnc") return "Registro Nacional de Contribuyentes (RNC)";
  if (tipoDoc === "pasaporte") return "pasaporte";
  return "cédula de identidad y electoral";
}

/** Bloque de identificación del cliente. */
function ident(d: DatosContrato): string {
  const c = d.cliente;
  if (!c) return "[CLIENTE NO SELECCIONADO]";
  const doc = c.documento ? `, portador(a) del ${docLabel(c.tipoDoc)} No. ${c.documento}` : "";
  const dir = c.direccion ? `, domiciliado(a) y residente en ${c.direccion}` : "";
  return `${c.nombre.toUpperCase()}, dominicano(a), mayor de edad${doc}${dir}`;
}

const firmaBufete = `ACEPTADO Y CONFORME:

_______________________________
${BUFETE.abogado}
${BUFETE.nombre}
${BUFETE.matricula}`;

const sep = "\n\n";

export function generarContenido(key: PlantillaKey, d: DatosContrato): string {
  const fecha = fechaLegal();
  const c = d.cliente;
  const nombre = c ? c.nombre.toUpperCase() : "[CLIENTE]";
  const docNo = c?.documento ?? "____________";
  const tipoDocTxt = c ? docLabel(c.tipoDoc) : "cédula";
  const caso = d.caso;
  const asunto = caso ? `el caso "${caso.titulo}"` : "el asunto encomendado";
  const contraria = caso?.parteContraria ? `, en el proceso seguido contra ${caso.parteContraria}` : "";
  const tribunal = caso?.tribunal ?? "los tribunales competentes de la República Dominicana";
  const exp = caso?.expediente ? ` (Expediente ${caso.expediente})` : "";

  const encabezado = (titulo: string) =>
    `${titulo}\n\nEn la ciudad de ${d.ciudad}, República Dominicana, ${fecha}.`;

  switch (key) {
    case "poder_representacion":
      return [
        encabezado("PODER DE REPRESENTACIÓN — CUOTA LITIS"),
        `YO, ${ident(d)}, por medio del presente acto OTORGO PODER ESPECIAL, amplio y suficiente, al ${BUFETE.abogado}, ${BUFETE.matricula}, con estudio profesional abierto en ${BUFETE.direccion}, para que en mi nombre y representación intervenga en ${asunto}${contraria}, por ante ${tribunal}${exp}.`,
        "El apoderado queda facultado para incoar demandas, interponer toda clase de recursos, presentar y producir documentos, formular conclusiones, transigir, desistir, cobrar y otorgar recibos de descargo, y realizar cuantas diligencias sean necesarias para la mejor defensa de mis intereses.",
        "Los honorarios profesionales se pactan bajo la modalidad de CUOTA LITIS, equivalente a un ___ por ciento (%) del beneficio económico que se obtenga, de conformidad con la Ley No. 302 sobre Honorarios de Abogados.",
        "Hecho y firmado en dos (2) originales de un mismo tenor y efecto, uno para cada parte.",
        `_______________________________\n${nombre}\n${tipoDocTxt}: ${docNo}`,
        firmaBufete,
      ].join(sep);

    case "contrato_servicios":
      return [
        encabezado("CONTRATO DE SERVICIOS PROFESIONALES"),
        `ENTRE: ${BUFETE.nombre}, RNC ${BUFETE.rnc}, con domicilio en ${BUFETE.direccion}, debidamente representado por el ${BUFETE.abogado} (en lo adelante, "EL ABOGADO"); y de la otra parte, ${ident(d)} (en lo adelante, "EL CLIENTE").`,
        `PRIMERO (OBJETO): EL ABOGADO se obliga a prestar a EL CLIENTE sus servicios profesionales en relación con ${asunto}${contraria}.`,
        "SEGUNDO (HONORARIOS): EL CLIENTE pagará a EL ABOGADO la suma de RD$ __________ por concepto de honorarios profesionales, pagaderos en la forma convenida entre las partes. El ITBIS aplicable será facturado conforme a la normativa vigente.",
        "TERCERO (OBLIGACIONES): EL ABOGADO actuará con diligencia y conforme a la ética profesional; EL CLIENTE suministrará la documentación e información necesarias para la gestión encomendada.",
        "CUARTO (VIGENCIA): El presente contrato tendrá vigencia hasta la conclusión del asunto, salvo terminación anticipada por acuerdo de las partes.",
        "Hecho y firmado en dos (2) originales de un mismo tenor y efecto.",
        `_______________________________\nEL CLIENTE\n${nombre}\n${tipoDocTxt}: ${docNo}`,
        firmaBufete,
      ].join(sep);

    case "acuerdo_transaccional":
      return [
        encabezado("ACUERDO TRANSACCIONAL"),
        `ENTRE las partes: de una parte ${ident(d)} ("LA PRIMERA PARTE"); y de la otra parte ${caso?.parteContraria ?? "[PARTE CONTRARIA]"} ("LA SEGUNDA PARTE").`,
        `PRIMERO: Las partes declaran su voluntad de poner fin, de manera amigable y definitiva, a las diferencias surgidas con motivo de ${asunto}.`,
        "SEGUNDO: En virtud de las concesiones recíprocas que se hacen las partes, éstas convienen los términos que constan en el presente acuerdo, otorgándose el más amplio y formal descargo y finiquito.",
        "TERCERO: El presente acuerdo tiene entre las partes la autoridad de la cosa irrevocablemente juzgada, conforme a los artículos 2044 y siguientes del Código Civil dominicano, y pone término a toda acción o reclamación presente o futura sobre el mismo objeto.",
        "Hecho y firmado en dos (2) originales de un mismo tenor y efecto.",
        `_______________________________\nLA PRIMERA PARTE\n${nombre}`,
        "_______________________________\nLA SEGUNDA PARTE",
      ].join(sep);

    case "carta_intimacion":
      return [
        `${d.ciudad}, República Dominicana, ${fecha}.`,
        `Señores:\n${caso?.parteContraria ?? "[DESTINATARIO]"}\nSus manos.-`,
        `Vía: ${BUFETE.nombre}`,
        `Distinguidos señores:`,
        `En nombre y representación de nuestro(a) cliente ${ident(d)}, y por medio de la presente, les INTIMAMOS Y REQUERIMOS formalmente al cumplimiento de la obligación pendiente en relación con ${asunto}, en un plazo no mayor de quince (15) días francos a partir de la recepción de la presente.`,
        "En caso de no obtemperar al presente requerimiento dentro del plazo indicado, nos veremos en la obligación de iniciar, sin más aviso, las acciones legales que correspondan en defensa de los derechos e intereses de nuestro representado, con las consecuencias legales que de ello se deriven.",
        "Sin otro particular por el momento, les saludamos.",
        `Atentamente,\n\n_______________________________\n${BUFETE.abogado}\n${BUFETE.nombre}\n${BUFETE.matricula}`,
      ].join(sep);

    case "contrato_iguala":
      return [
        encabezado("CONTRATO DE IGUALA (ASESORÍA LEGAL CONTINUA)"),
        `ENTRE ${BUFETE.nombre}, RNC ${BUFETE.rnc} ("EL ABOGADO"), y ${ident(d)} ("EL CLIENTE"), se conviene lo siguiente:`,
        "PRIMERO: EL ABOGADO prestará a EL CLIENTE servicios de asesoría legal continua, incluyendo consultas, revisión de documentos y acompañamiento en sus asuntos ordinarios.",
        "SEGUNDO: EL CLIENTE pagará una iguala mensual de RD$ __________, más el ITBIS correspondiente, pagadera dentro de los primeros cinco (5) días de cada mes.",
        "TERCERO: La presente iguala no incluye la representación en litigios, los cuales serán objeto de acuerdos de honorarios independientes.",
        "CUARTO: El contrato tendrá una vigencia de un (1) año, renovable automáticamente salvo notificación en contrario con treinta (30) días de antelación.",
        "Hecho y firmado en dos (2) originales de un mismo tenor y efecto.",
        `_______________________________\nEL CLIENTE\n${nombre}\n${tipoDocTxt}: ${docNo}`,
        firmaBufete,
      ].join(sep);

    case "recibo_descargo":
      return [
        encabezado("RECIBO DE DESCARGO Y FINIQUITO"),
        `YO, ${ident(d)}, DECLARO haber recibido de manos de ${caso?.parteContraria ?? "[PAGADOR]"} la suma acordada por concepto de ${asunto}, a mi entera y cabal satisfacción.`,
        "En consecuencia, otorgo el más amplio y formal RECIBO DE DESCARGO Y FINIQUITO, renunciando a toda acción, reclamación o derecho que pudiera corresponderme con motivo de lo anteriormente expresado, no teniendo nada más que reclamar por ningún concepto.",
        "El presente recibo surte todos sus efectos legales a partir de la fecha de su firma.",
        `_______________________________\n${nombre}\n${tipoDocTxt}: ${docNo}`,
      ].join(sep);

    default:
      return "";
  }
}
