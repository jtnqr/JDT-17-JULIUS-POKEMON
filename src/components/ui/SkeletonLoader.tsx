export function SkeletonLoader({ className = 'h-24 w-full' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface/30 border border-accent/20 rounded-xl scanlines relative ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  )
}
