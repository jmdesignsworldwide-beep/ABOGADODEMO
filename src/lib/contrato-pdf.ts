import { jsPDF } from "jspdf";
import { BUFETE } from "@/lib/contratos/templates";

const NAVY: [number, number, number] = [27, 58, 91];
const GOLD: [number, number, number] = [149, 117, 43];
const GRAY: [number, number, number] = [110, 110, 110];
const INK: [number, number, number] = [25, 28, 38];

/** Genera y descarga un documento legal (DEMO) con membrete del bufete. */
export function descargarContratoPDF(titulo: string, contenido: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 56;
  const bottom = H - 56;

  function membrete() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...NAVY);
    doc.text(BUFETE.nombre, M, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...GOLD);
    doc.text("Gestión Legal", M, 75);
    doc.setTextColor(...GRAY);
    doc.setFontSize(8.5);
    doc.text(`${BUFETE.direccion}`, M, 88);
    doc.text(`RNC ${BUFETE.rnc}  ·  ${BUFETE.telefono}  ·  ${BUFETE.email}`, M, 99);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(1);
    doc.line(M, 108, W - M, 108);
  }

  function pie() {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("Documento de ejemplo — no es un documento legal válido.", W / 2, H - 34, { align: "center" });
  }

  membrete();
  pie();

  let y = 134;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);

  const paragraphs = contenido.split("\n");
  for (const para of paragraphs) {
    if (para.trim() === "") { y += 7; continue; }
    // Resaltar líneas que parecen títulos (mayúsculas).
    const isTitle = para === para.toUpperCase() && para.trim().length > 0 && /[A-ZÁÉÍÓÚÑ]/.test(para) && para.length < 70;
    doc.setFont("helvetica", isTitle ? "bold" : "normal");
    doc.setTextColor(...(isTitle ? NAVY : INK));
    doc.setFontSize(isTitle ? 12 : 11);
    const lines = doc.splitTextToSize(para, W - M * 2) as string[];
    for (const line of lines) {
      if (y > bottom) { doc.addPage(); pie(); y = 64; }
      doc.text(line, M, y);
      y += isTitle ? 18 : 16;
    }
    y += isTitle ? 4 : 6;
  }

  doc.save(`${titulo.replace(/[^\w\s-]/g, "").slice(0, 60) || "documento"}.pdf`);
}
