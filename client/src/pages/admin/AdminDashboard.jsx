import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  UserPlus,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    flaggedContent: 0,
    growthRate: '+0%',
    systemHealth: '100%',
    newSignups7d: [],
    verificationBreakdown: {}
  });

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('/api/admin/metrics').catch(() => ({ data: null }));
        if (res.data) {
          setMetrics({
            ...res.data,
            growthRate: '+12%', // Mock trend
            systemHealth: '99.9%'
          });
        }

        const logRes = await axios.get('/api/admin/audit-log').catch(() => ({ data: [] }));
        setLogs(logRes.data.slice(0, 10).map(log => ({
          ts: new Date(log.timestamp).toLocaleTimeString(),
          msg: `${log.action} on ${log.targetType} ${log.targetId}`
        })));
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="admin-loading" style={{ color: 'var(--admin-accent)', padding: '40px' }}>
      INITIALIZING_DASHBOARD_DATA...
    </div>
  );

  const chartData = metrics.newSignups7d?.map((val, i) => ({
    day: `Day ${i + 1}`,
    signups: val
  })) || [];

  return (
    <div className="dashboard-container">
      <header className="cyber-title">
        <Activity size={32} color="var(--admin-accent)" />
        REAL-TIME_OPERATIONS_CENTER
      </header>

      <div className="grid-metrics">
        <div className="glass-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(0, 245, 255, 0.1)', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '15px' }}>
            <Users size={24} color="var(--admin-accent)" />
          </div>
          <div className="metric-value">{metrics.totalUsers}</div>
          <div className="metric-label">Total Verified Sisters</div>
          <div className="metric-trend" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', marginTop: '8px' }}>
            <TrendingUp size={14} /> {metrics.growthRate}
          </div>
        </div>

        <div className="glass-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(188, 19, 254, 0.1)', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '15px' }}>
            <ShieldCheck size={24} color="var(--admin-purple)" />
          </div>
          <div className="metric-value">{metrics.pendingVerification || metrics.pendingVerifications}</div>
          <div className="metric-label">In Verification Queue</div>
          <div className="metric-action-link" style={{ fontSize: '12px', color: 'var(--admin-accent)', textDecoration: 'underline', marginTop: '8px', cursor: 'pointer' }}>Review Queue</div>
        </div>

        <div className="glass-metric-card">
          <div className="metric-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '15px' }}>
            <UserPlus size={24} color="#f59e0b" />
          </div>
          <div className="metric-value">{metrics.flaggedContent}</div>
          <div className="metric-label">Flagged Reports</div>
          <div className="metric-action-link" style={{ fontSize: '12px', color: 'var(--admin-accent)', textDecoration: 'underline', marginTop: '8px', cursor: 'pointer' }}>View Reports</div>
        </div>
      </div>

      <div className="dashboard-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="glass-metric-card">
          <div className="metric-label" style={{ marginBottom: '20px' }}>Signups (Last 7 Days)</div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--admin-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--admin-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--admin-text-dim)" fontSize={12} />
                <YAxis stroke="var(--admin-text-dim)" fontSize={12} />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--admin-bg-alt)', borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
                  itemStyle={{ color: 'var(--admin-accent)' }}
                />
                <Area type="monotone" dataKey="signups" stroke="var(--admin-accent)" fillOpacity={1} fill="url(#colorSignups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="activity-terminal" style={{ height: '100%', marginTop: 0 }}>
          <div className="terminal-header">
            <div className="terminal-dots">
              <div className="dot-red"></div>
              <div className="dot-yellow"></div>
              <div className="dot-green"></div>
            </div>
            <div className="terminal-title">AUDIT_LOGS.EXE</div>
            <Clock size={16} color="var(--admin-text-dim)" />
          </div>
          <div className="terminal-body" style={{ overflowY: 'auto', maxHeight: '280px' }}>
            {logs.length === 0 ? (
              <div className="log-entry">
                <span className="log-ts">[{new Date().toLocaleTimeString()}]</span>
                <span className="log-msg">No audit logs found.</span>
              </div>
            ) : logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-ts">[{log.ts}]</span>
                <span className="log-msg">{log.msg}</span>
              </div>
            ))}
            <div className="log-entry">
              <span className="log-ts">[{new Date().toLocaleTimeString()}]</span>
              <span className="log-msg">_</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
