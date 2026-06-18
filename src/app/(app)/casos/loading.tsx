import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function LoadingCasos() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 w-full max-w-xs rounded-xl" />
        <Skeleton className="h-11 w-40 rounded-xl" />
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
