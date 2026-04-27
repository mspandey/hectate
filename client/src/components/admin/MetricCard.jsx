import { TrendingUp, TrendingDown } from 'lucide-react'

export default function MetricCard({ label, value, trend, icon: Icon, color = 'var(--admin-accent)' }) {
  const isPositive = trend > 0
  
  return (
    <div className="glass-metric-card" style={{
      background: 'rgba(3, 7, 18, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--admin-border)',
      padding: '24px 32px',
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '60px',
        height: '60px',
        background: `radial-gradient(circle at top right, ${color}33, transparent 70%)`
      }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '10px', 
          background: `${color}1A`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: color,
          border: `1px solid ${color}33`
        }}>
          <Icon size={20} />
        </div>
        
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '12px',
            color: isPositive ? '#10b981' : '#ef4444',
            background: isPositive ? '#10b9811A' : '#ef44441A',
            padding: '4px 8px',
            borderRadius: '20px',
            border: `1px solid ${isPositive ? '#10b98133' : '#ef444433'}`
          }}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="metric-value" style={{ 
        fontSize: '32px', 
        fontWeight: '800', 
        color: '#fff', 
        marginBottom: '4px',
        letterSpacing: '-1px'
      }}>
        {value}
      </div>
      
      <div className="metric-label" style={{ 
        fontSize: '12px', 
        color: 'var(--admin-text-dim)', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        fontWeight: '500'
      }}>
        {label}
      </div>
    </div>
  )
}
