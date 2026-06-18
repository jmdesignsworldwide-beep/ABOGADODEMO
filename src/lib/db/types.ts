/* ─────────────────────────────────────────────────────────────────────────
   Tipos del dominio legal (espejo del esquema de Supabase).
   ───────────────────────────────────────────────────────────────────────── */

export type ClienteTipo = "persona" | "empresa";
export type TipoDocumento = "cedula" | "rnc" | "pasaporte";

export type CasoTipo =
  | "civil"
  | "penal"
  | "laboral"
  | "comercial"
  | "divorcio"
  | "sucesiones"
  | "inmobiliario";

export type CasoEstado =
  | "abierto"
  | "en_proceso"
  | "suspendido"
  | "cerrado"
  | "archivado";

export interface Cliente {
  id: string;
  nombre: string;
  tipo: ClienteTipo;
  tipo_documento: TipoDocumento;
  documento: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Caso {
  id: string;
  cliente_id: string;
  titulo: string;
  tipo: CasoTipo;
  estado: CasoEstado;
  abogado: string | null;
  parte_contraria: string | null;
  avance: number;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expediente {
  id: string;
  caso_id: string;
  numero: string;
  tribunal: string | null;
  juez: string | null;
  estado_procesal: string | null;
  created_at: string;
  updated_at: string;
}

export type AudienciaTipo = "audiencia" | "cita";
export type AudienciaEstado =
  | "programada"
  | "confirmada"
  | "realizada"
  | "cancelada"
  | "aplazada";

export interface Audiencia {
  id: string;
  caso_id: string;
  tipo: AudienciaTipo;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  hora: string | null; // HH:MM:SS
  lugar: string | null;
  estado: AudienciaEstado;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type AudienciaConCaso = Audiencia & {
  caso: (Pick<Caso, "id" | "titulo" | "tipo" | "estado"> & {
    cliente: Pick<Cliente, "id" | "nombre"> | null;
  }) | null;
};

export type TipoDocumentoLegal =
  | "contrato"
  | "sentencia"
  | "poder"
  | "prueba"
  | "escrito"
  | "factura"
  | "identificacion"
  | "otro";

export interface Documento {
  id: string;
  nombre: string;
  tipo_documento: TipoDocumentoLegal;
  storage_path: string;
  mime_type: string | null;
  tamano: number | null;
  caso_id: string | null;
  cliente_id: string | null;
  subido_por: string | null;
  created_at: string;
}

export type DocumentoConVinculos = Documento & {
  caso: Pick<Caso, "id" | "titulo"> | null;
  cliente: Pick<Cliente, "id" | "nombre"> | null;
};

export type TipoNCF = "B01" | "B02";
export type FacturaEstado = "pendiente" | "pagada" | "anulada";

export interface ConceptoLinea {
  descripcion: string;
  cantidad: number;
  precio: number;
}

export interface Factura {
  id: string;
  numero: string;
  tipo_ncf: TipoNCF;
  cliente_id: string;
  caso_id: string | null;
  conceptos: ConceptoLinea[];
  subtotal: number;
  itbis: number;
  total: number;
  estado: FacturaEstado;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export type FacturaConVinculos = Factura & {
  cliente: Pick<Cliente, "id" | "nombre" | "tipo" | "tipo_documento" | "documento"> | null;
  caso: Pick<Caso, "id" | "titulo"> | null;
};

export type FacturaInput = {
  cliente_id: string;
  caso_id: string | null;
  tipo_ncf: TipoNCF;
  conceptos: ConceptoLinea[];
  estado: FacturaEstado;
  fecha: string;
};

export type CategoriaEgreso =
  | "alquiler"
  | "salarios"
  | "servicios"
  | "suministros"
  | "impuestos"
  | "honorarios_terceros"
  | "marketing"
  | "mantenimiento"
  | "otros";

export interface Egreso {
  id: string;
  concepto: string;
  categoria: CategoriaEgreso;
  monto: number;
  fecha: string;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
}

export type EgresoInput = {
  concepto: string;
  categoria: CategoriaEgreso;
  monto: number;
  fecha: string;
  descripcion: string | null;
};

/* Entradas para crear/editar (sin campos gestionados por la BD) */
export type ClienteInput = Omit<Cliente, "id" | "created_at" | "updated_at">;
export type CasoInput = Omit<Caso, "id" | "created_at" | "updated_at">;
export type ExpedienteInput = Omit<Expediente, "id" | "created_at" | "updated_at">;
export type AudienciaInput = Omit<Audiencia, "id" | "created_at" | "updated_at">;

/* Tipos enriquecidos para vistas */
export type ClienteConConteo = Cliente & { casosCount: number };
export type CasoConRelaciones = Caso & {
  cliente: Pick<Cliente, "id" | "nombre" | "tipo"> | null;
  expediente: Expediente | null;
};
export type ExpedienteConCaso = Expediente & {
  caso: (Pick<Caso, "id" | "titulo" | "tipo" | "estado"> & {
    cliente: Pick<Cliente, "id" | "nombre"> | null;
  }) | null;
};

/* ── Etiquetas legibles + estilos ──────────────────────────────────────────── */

export const CLIENTE_TIPO_LABEL: Record<ClienteTipo, string> = {
  persona: "Persona física",
  empresa: "Empresa",
};

export const TIPO_DOCUMENTO_LABEL: Record<TipoDocumento, string> = {
  cedula: "Cédula",
  rnc: "RNC",
  pasaporte: "Pasaporte",
};

export const CASO_TIPO_LABEL: Record<CasoTipo, string> = {
  civil: "Civil",
  penal: "Penal",
  laboral: "Laboral",
  comercial: "Comercial",
  divorcio: "Divorcio",
  sucesiones: "Sucesiones",
  inmobiliario: "Inmobiliario",
};

export const CASO_ESTADO_LABEL: Record<CasoEstado, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  suspendido: "Suspendido",
  cerrado: "Cerrado",
  archivado: "Archivado",
};

/** Color semántico por estado de caso (clases utilitarias). */
export const CASO_ESTADO_STYLE: Record<CasoEstado, string> = {
  abierto: "bg-[color-mix(in_srgb,var(--navy)_18%,transparent)] text-foreground",
  en_proceso: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-gold",
  suspendido: "bg-[var(--critical-soft)] text-critical",
  cerrado: "bg-emerald-500/15 text-emerald-500",
  archivado: "bg-muted text-muted-foreground",
};

export const AUDIENCIA_TIPO_LABEL: Record<AudienciaTipo, string> = {
  audiencia: "Audiencia",
  cita: "Cita",
};

export const AUDIENCIA_ESTADO_LABEL: Record<AudienciaEstado, string> = {
  programada: "Programada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  aplazada: "Aplazada",
};

export const AUDIENCIA_ESTADO_STYLE: Record<AudienciaEstado, string> = {
  programada: "bg-[color-mix(in_srgb,var(--navy)_18%,transparent)] text-foreground",
  confirmada: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-gold",
  realizada: "bg-emerald-500/15 text-emerald-500",
  cancelada: "bg-[var(--critical-soft)] text-critical",
  aplazada: "bg-muted text-muted-foreground",
};

export const TIPO_DOCUMENTO_LEGAL_LABEL: Record<TipoDocumentoLegal, string> = {
  contrato: "Contrato",
  sentencia: "Sentencia",
  poder: "Poder",
  prueba: "Prueba",
  escrito: "Escrito",
  factura: "Factura",
  identificacion: "Identificación",
  otro: "Otro",
};

export const TIPO_NCF_LABEL: Record<TipoNCF, string> = {
  B01: "Crédito Fiscal (B01)",
  B02: "Consumidor Final (B02)",
};

export const FACTURA_ESTADO_LABEL: Record<FacturaEstado, string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  anulada: "Anulada",
};

export const FACTURA_ESTADO_STYLE: Record<FacturaEstado, string> = {
  pendiente: "bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-gold",
  pagada: "bg-emerald-500/15 text-emerald-500",
  anulada: "bg-[var(--critical-soft)] text-critical",
};

export const CATEGORIA_EGRESO_LABEL: Record<CategoriaEgreso, string> = {
  alquiler: "Alquiler",
  salarios: "Salarios",
  servicios: "Servicios",
  suministros: "Suministros",
  impuestos: "Impuestos",
  honorarios_terceros: "Honorarios de terceros",
  marketing: "Marketing",
  mantenimiento: "Mantenimiento",
  otros: "Otros",
};

export interface DocumentoGenerado {
  id: string;
  plantilla: string;
  titulo: string;
  contenido: string;
  cliente_id: string | null;
  caso_id: string | null;
  created_at: string;
}

export type ContratoConVinculos = DocumentoGenerado & {
  cliente: Pick<Cliente, "id" | "nombre"> | null;
  caso: Pick<Caso, "id" | "titulo"> | null;
};
