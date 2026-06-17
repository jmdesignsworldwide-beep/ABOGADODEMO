import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingAgenda() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-44 rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
