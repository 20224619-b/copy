interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/[0.03] ${className}`}
      style={{ animation: 'skelpulse 1.6s ease-in-out infinite' }}
    >
      <style>{`@keyframes skelpulse { 0%,100% { opacity:.6 } 50% { opacity:1 } }`}</style>
    </div>
  );
}

export function MissionRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-white/5 bg-black/20 px-3 py-2.5">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-2.5 w-2/5" />
      </div>
      <Skeleton className="h-7 w-7 rounded-lg" />
    </div>
  );
}
