"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FileIcon } from "./file-icon";
import { formatBytes } from "@/lib/documentos";
import { TIPO_DOCUMENTO_LEGAL_LABEL, type DocumentoConVinculos } from "@/lib/db/types";

function fechaCorta(iso: string): string {
  return new Date(iso).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" });
}

export function DocumentoCard({
  documento,
  onClick,
  mostrarVinculo = true,
}: {
  documento: DocumentoConVinculos;
  onClick: () => void;
  mostrarVinculo?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="group flex h-full w-full items-start gap-3 rounded-2xl glass p-4 text-left shadow-layered transition-shadow duration-300 hover:glow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <FileIcon mime={documento.mime_type} />
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-foreground">{documento.nombre}</h4>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">
            {TIPO_DOCUMENTO_LEGAL_LABEL[documento.tipo_documento]}
          </span>
          <span className="tabular">{formatBytes(documento.tamano)}</span>
          <span className="tabular">{fechaCorta(documento.created_at)}</span>
        </div>
        {mostrarVinculo && (documento.caso || documento.cliente) && (
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {documento.caso?.titulo ?? documento.cliente?.nombre}
          </p>
        )}
      </div>
    </motion.button>
  );
}
