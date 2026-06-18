import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function LoadingExpedientes() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-44 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
