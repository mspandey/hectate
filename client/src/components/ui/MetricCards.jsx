import { useState, useEffect } from 'react'
import { Users, MessageCircle, Scale, ShieldCheck } from 'lucide-react'

const metrics = [
  {
    title: 'Community Members',
    value: '2,847',
    change: '+12%',
    positive: true,
    icon: Users,
    color: '#EC4899',
    sparkline: [30, 45, 35, 60, 55, 70, 65, 80, 75, 90],
  },
  {
    title: 'Active Stories',
    value: '1,264',
    change: '+8%',
    positive: true,
    icon: MessageCircle,
    color: '#A855F7',
    sparkline: [20, 35, 40, 30, 50, 45, 60, 55, 70, 65],
  },
  {
    title: 'Verified Lawyers',
    value: '156',
    change: '+3',
    positive: true,
    icon: Scale,
    color: '#EC4899',
    sparkline: [10, 12, 15, 14, 18, 20, 22, 25, 28, 30],
  },
]

function MiniSparkline({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 80
  const h = 28
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 1px 2px ${color}40)` }}
      />
    </svg>
  )
}

export default function MetricCards() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="metrics-grid">
      {metrics.map((m, i) => {
        const Icon = m.icon
        return (
          <div
            key={m.title}
            className={`metric-card glass-card ${loaded ? 'metric-loaded' : ''}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="metric-top">
              <span className="metric-title">{m.title}</span>
              <div className="metric-icon-wrap" style={{ background: `${m.color}15` }}>
                <Icon size={16} color={m.color} />
              </div>
            </div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-bottom">
              <span className={`metric-change ${m.positive ? 'positive' : 'negative'}`}>
                {m.change}
              </span>
              <MiniSparkline data={m.sparkline} color={m.color} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
