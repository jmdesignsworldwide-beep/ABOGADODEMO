import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function LoadingClientes() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
