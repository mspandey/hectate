import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get('/api/admin/audit-log')
        setLogs(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch logs:', err)
      }
    }
    fetchLogs()
  }, [])

  if (loading) return <div className="admin-loading">🛡️ Loading Audit Logs...</div>

  return (
    <div className="audit-log">
      <div className="log-header">
        <h3>ADMIN AUDIT LOG</h3>
        <button className="export-btn">Export CSV</button>
      </div>

      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.adminEmail}</td>
                <td className="action-tag">{log.action}</td>
                <td>{log.targetType ? `${log.targetType}#${log.targetId?.slice(0, 4)}` : '—'}</td>
                <td>
                  <span className={`status-pill ${log.success ? 'success' : 'failed'}`}>
                    {log.success ? 'Success' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
