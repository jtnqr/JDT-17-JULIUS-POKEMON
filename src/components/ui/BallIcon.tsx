type BallType = 'poke-ball' | 'great-ball' | 'ultra-ball' | 'master-ball'

const BALL_COLORS: Record<BallType, string> = {
  'poke-ball': '#ef4444',
  'great-ball': '#3b82f6',
  'ultra-ball': '#eab308',
  'master-ball': '#a855f7',
}

const secondaryColor = '#f5f5f4'

export function BallIcon({ type, className = 'w-5 h-5' }: { type: BallType; className?: string }) {
  const primaryColor = BALL_COLORS[type]

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>{type}</title>
      <circle cx="12" cy="12" r="10" fill={secondaryColor} stroke="#2c1d0e" strokeWidth="2" />
      <path
        d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12H2Z"
        fill={primaryColor}
        stroke="#2c1d0e"
        strokeWidth="2"
      />
      {type === 'great-ball' && (
        <path d="M5 6L8 9M19 6L16 9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      )}
      {type === 'ultra-ball' && <path d="M9 3V9M15 3V9" stroke="#1c1917" strokeWidth="2" />}
      {type === 'master-ball' && (
        <text
          x="12"
          y="9"
          fill="white"
          fontSize="6"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          M
        </text>
      )}
      <circle cx="12" cy="12" r="3" fill="white" stroke="#2c1d0e" strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill="#2c1d0e" />
      <line x1="2" y1="12" x2="9" y2="12" stroke="#2c1d0e" strokeWidth="2" />
      <line x1="15" y1="12" x2="22" y2="12" stroke="#2c1d0e" strokeWidth="2" />
    </svg>
  )
}
