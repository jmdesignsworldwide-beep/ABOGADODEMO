import { FileText, FileType, Image as ImageIcon, File } from "lucide-react";
import { categoryFromMime, type FileCategory } from "@/lib/documentos";
import { cn } from "@/lib/utils";

const ICON = {
  pdf: FileText,
  image: ImageIcon,
  word: FileType,
  otro: File,
} as const;

const TONE: Record<FileCategory, string> = {
  pdf: "bg-[color-mix(in_srgb,var(--critical)_16%,transparent)] text-critical",
  image: "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-gold",
  word: "bg-[color-mix(in_srgb,var(--navy)_18%,transparent)] text-foreground",
  otro: "bg-muted text-muted-foreground",
};

export function FileIcon({
  mime,
  className,
  size = "md",
}: {
  mime: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const cat = categoryFromMime(mime);
  const Icon = ICON[cat];
  const box = { sm: "h-9 w-9 rounded-lg", md: "h-11 w-11 rounded-xl", lg: "h-14 w-14 rounded-2xl" }[size];
  const ic = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-7 w-7" }[size];
  return (
    <span className={cn("grid shrink-0 place-items-center", box, TONE[cat], className)}>
      <Icon className={ic} strokeWidth={1.75} />
    </span>
  );
}
