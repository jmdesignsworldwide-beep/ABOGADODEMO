import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingHistorial() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-64" />
      <div className="flex gap-3"><Skeleton className="h-11 w-full max-w-xs rounded-xl" /><Skeleton className="h-11 w-40 rounded-xl" /></div>
      <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}</div>
    </div>
  );
}
