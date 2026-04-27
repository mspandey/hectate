import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Activity,
  ChevronRight,
  ShieldCheck,
  Flag,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get('/api/admin/alerts');
        setAlerts(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (category) => {
    switch (category) {
      case 'VERIFICATION': return <ShieldCheck className="alert-icon suspicious" />;
      case 'CONTENT': return <Flag className="alert-icon suspicious" />;
      case 'SECURITY': return <Lock className="alert-icon suspicious" />;
      default: return <AlertTriangle className="alert-icon" />;
    }
  };

  const handleAction = (alert) => {
    switch (alert.category) {
      case 'VERIFICATION': navigate('/admin/verification-queue'); break;
      case 'CONTENT': navigate('/admin/flagged-content'); break;
      case 'SECURITY': navigate(`/admin/users`); break; // Fallback to user management
      default: navigate('/admin');
    }
  };

  if (loading) return <div className="admin-loading">ANALYZING_THREAT_VECTORS...</div>;

  return (
    <div className="alert-center-container">
      <header className="cyber-title">
        <ShieldAlert size={32} color="var(--admin-accent)" />
        REAL-TIME_ALERT_CENTER
      </header>

      <div className="alert-stats-row">
        <div className="alert-stat-card">
          <span className="stat-val">{alerts.filter(a => a.type === 'URGENT').length}</span>
          <span className="stat-label">Urgent Threats</span>
        </div>
        <div className="alert-stat-card">
          <span className="stat-val">{alerts.filter(a => a.type === 'SUSPICIOUS').length}</span>
          <span className="stat-label">Suspicious Activities</span>
        </div>
      </div>

      <div className="alert-list">
        {alerts.length === 0 ? (
          <div className="empty-alerts">
            <Activity size={48} color="rgba(0, 245, 255, 0.2)" />
            <p>No active threats or suspicious activity detected.</p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div 
              key={alert.id + idx} 
              className={`alert-card ${alert.type.toLowerCase()}`}
              onClick={() => handleAction(alert)}
            >
              <div className="alert-info">
                {getIcon(alert.category)}
                <div className="alert-details">
                  <span className="alert-category">{alert.category}</span>
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-ts">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <ChevronRight className="alert-arrow" />
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .alert-center-container {
          padding: 20px;
          animation: scanIn 0.5s ease-out;
        }

        @keyframes scanIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .alert-stats-row {
          display: flex;
          gap: 20px;
          margin: 20px 0;
        }

        .alert-stat-card {
          background: var(--admin-bg-alt);
          border: 1px solid var(--admin-border);
          padding: 20px;
          border-radius: 8px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-val {
          font-size: 32px;
          font-weight: bold;
          color: var(--admin-accent);
          font-family: 'monospace';
        }

        .stat-label {
          font-size: 12px;
          color: var(--admin-text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .alert-card {
          background: rgba(10, 10, 10, 0.6);
          border: 1px solid var(--admin-border);
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .alert-card:hover {
          border-color: var(--admin-accent);
          background: rgba(0, 245, 255, 0.05);
          transform: translateX(5px);
        }

        .alert-card.urgent {
          border-left: 4px solid #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .alert-card.suspicious {
          border-left: 4px solid var(--admin-purple);
        }

        .alert-info {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .alert-icon.urgent { color: #ef4444; }
        .alert-icon.suspicious { color: var(--admin-purple); }

        .alert-details {
          display: flex;
          flex-direction: column;
        }

        .alert-category {
          font-size: 10px;
          font-weight: bold;
          color: var(--admin-text-dim);
          text-transform: uppercase;
        }

        .alert-message {
          margin: 4px 0;
          font-size: 14px;
          color: var(--admin-text);
        }

        .alert-ts {
          font-size: 11px;
          color: var(--admin-text-dim);
        }

        .alert-arrow {
          color: var(--admin-text-dim);
          opacity: 0.5;
        }

        .empty-alerts {
          text-align: center;
          padding: 60px;
          color: var(--admin-text-dim);
        }
      `}</style>
    </div>
  );
}
