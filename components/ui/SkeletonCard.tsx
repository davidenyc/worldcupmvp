import { cn } from "@/lib/utils";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-gray-200 dark:bg-white/10", className)} />;
}

export function SkeletonCard({
  className = "",
  lines = 3
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={cn("animate-pulse rounded-2xl bg-gray-200/80 p-5 dark:bg-white/5", className)}>
      <div className="space-y-3">
        <SkeletonLine className="h-5 w-2/3" />
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLine key={index} className={`h-4 ${index === lines - 1 ? "w-1/2" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
