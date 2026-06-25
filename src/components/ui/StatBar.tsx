export function StatBar({
  label,
  value,
  max = 255,
}: {
  label: string
  value: number
  max?: number
}) {
  const percentage = Math.min(100, Math.max(3, (value / max) * 100))

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold text-muted uppercase tracking-wider text-xs">{label}</span>
        <span className="font-bold text-foreground font-mono">{value}</span>
      </div>
      <div className="h-3 w-full bg-background/80 rounded-full overflow-hidden border border-accent/20">
        <div
          className="h-full bg-gradient-to-r from-accent to-highlight transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
