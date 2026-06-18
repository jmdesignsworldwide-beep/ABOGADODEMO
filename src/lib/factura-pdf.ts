import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRD, fechaLargaRD } from "@/lib/facturas";
import {
  FACTURA_ESTADO_LABEL,
  TIPO_NCF_LABEL,
  type FacturaConVinculos,
} from "@/lib/db/types";

const NAVY: [number, number, number] = [27, 58, 91];
const GOLD: [number, number, number] = [149, 117, 43];
const GRAY: [number, number, number] = [110, 110, 110];

/** Genera y descarga el PDF de una factura con la marca del bufete. */
export function descargarFacturaPDF(f: FacturaConVinculos) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;

  // ── Encabezado: bufete ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text("JM & Asociados | Abogados", M, 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.text("Gestión Legal", M, 80);
  doc.setTextColor(...GRAY);
  doc.text("RNC 1-30-12345-6 (demo)  ·  Santo Domingo, R.D.", M, 94);

  // ── Bloque factura (derecha) ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text("FACTURA", W - M, 64, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`NCF: ${f.numero}`, W - M, 82, { align: "right" });
  doc.text(TIPO_NCF_LABEL[f.tipo_ncf], W - M, 96, { align: "right" });
  doc.text(`Fecha: ${fechaLargaRD(f.fecha)}`, W - M, 110, { align: "right" });
  doc.text(`Estado: ${FACTURA_ESTADO_LABEL[f.estado]}`, W - M, 124, { align: "right" });

  // Línea dorada separadora
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(M, 138, W - M, 138);

  // ── Cliente ──
  let y = 164;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("FACTURAR A", M, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  y += 18;
  doc.text(f.cliente?.nombre ?? "—", M, y);
  if (f.cliente?.documento) {
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text(`${(f.cliente.tipo_documento ?? "doc").toUpperCase()}: ${f.cliente.documento}`, M, y);
  }
  if (f.caso) {
    y += 15;
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text(`Caso: ${f.caso.titulo}`, M, y);
  }

  // ── Tabla de conceptos ──
  autoTable(doc, {
    startY: y + 22,
    margin: { left: M, right: M },
    head: [["Descripción", "Cant.", "Precio", "Importe"]],
    body: f.conceptos.map((c) => [
      c.descripcion,
      String(c.cantidad),
      formatRD(c.precio),
      formatRD(c.cantidad * c.precio),
    ]),
    headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { textColor: [30, 30, 30] },
    columnStyles: {
      1: { halign: "center", cellWidth: 50 },
      2: { halign: "right", cellWidth: 90 },
      3: { halign: "right", cellWidth: 90 },
    },
    styles: { fontSize: 10, cellPadding: 8 },
    alternateRowStyles: { fillColor: [248, 245, 238] },
  });

  // ── Totales ──
  const afterTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  let ty = afterTable + 20;
  const labelX = W - M - 200;
  const valX = W - M;
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("Subtotal", labelX, ty, { align: "left" });
  doc.setTextColor(20, 20, 20);
  doc.text(formatRD(f.subtotal), valX, ty, { align: "right" });
  ty += 16;
  doc.setTextColor(...GRAY);
  doc.text("ITBIS (18%)", labelX, ty, { align: "left" });
  doc.setTextColor(20, 20, 20);
  doc.text(formatRD(f.itbis), valX, ty, { align: "right" });
  ty += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(labelX, ty, valX, ty);
  ty += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text("TOTAL", labelX, ty, { align: "left" });
  doc.text(formatRD(f.total), valX, ty, { align: "right" });

  // ── Footer: disclaimer (discreto) ──
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(
    "Documento de demostración — NCF no certificado ante DGII.",
    W / 2,
    H - 40,
    { align: "center" },
  );

  doc.save(`Factura-${f.numero}.pdf`);
}
