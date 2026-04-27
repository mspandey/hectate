import { useState, useEffect } from 'react'
import axios from 'axios'
import { Settings as SettingsIcon, Save, Plus } from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const loadSettings = async () => {
    try {
      const { data } = await axios.get('/api/admin/settings')
      setSettings(data)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const handleUpdate = async (key, value) => {
    try {
      await axios.post('/api/admin/settings', { key, value })
      loadSettings()
    } catch (err) {
      alert('Failed to update setting')
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newKey.trim()) return
    setSaving(true)
    try {
      await axios.post('/api/admin/settings', { key: newKey.trim(), value: newValue })
      setNewKey('')
      setNewValue('')
      loadSettings()
    } catch (err) {
      alert('Failed to add setting')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="admin-loading">⚙️ Loading Settings...</div>

  return (
    <div className="admin-settings">
      <header style={{ marginBottom: '32px' }}>
        <h2 className="cyber-title" style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SettingsIcon size={24} color="var(--admin-accent)" />
          PLATFORM_SETTINGS
        </h2>
        <p style={{ color: 'var(--admin-text-dim)', fontSize: '13px', marginTop: '8px', letterSpacing: '1px' }}>
          CONFIGURE GLOBAL PLATFORM PARAMETERS. CHANGES TAKE EFFECT IMMEDIATELY.
        </p>
      </header>

      <div style={{
        background: 'rgba(17,24,39,0.7)',
        border: '1px solid var(--admin-border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '20px', letterSpacing: '1px' }}>GLOBAL VARIABLES</h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {settings.map(s => (
            <div key={s.key} style={{
              display: 'flex', gap: '16px', alignItems: 'center',
              padding: '12px', background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ width: '200px', fontSize: '13px', fontWeight: 600, color: '#fff', fontFamily: 'monospace' }}>
                {s.key}
              </div>
              <input 
                id={`input-${s.key}`}
                type="text" 
                defaultValue={s.value}
                onBlur={(e) => {
                  if (e.target.value !== s.value) handleUpdate(s.key, e.target.value)
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById(`input-${s.key}`)
                  if (input && input.value !== s.value) handleUpdate(s.key, input.value)
                }}
                style={{
                  background: 'rgba(0,245,255,0.1)', border: '1px solid var(--admin-accent)',
                  color: 'var(--admin-accent)', padding: '8px', borderRadius: '6px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Save changes"
              >
                <Save size={16} />
              </button>
            </div>
          ))}

          {settings.length === 0 && (
            <div style={{ color: 'var(--admin-text-dim)', fontSize: '13px', fontStyle: 'italic' }}>
              No custom settings defined yet.
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: 'rgba(17,24,39,0.7)',
        border: '1px solid var(--admin-border)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '20px', letterSpacing: '1px' }}>ADD NEW VARIABLE</h3>
        
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input 
              type="text" 
              placeholder="VARIABLE_KEY" 
              value={newKey}
              onChange={e => setNewKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 14px',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <input 
              type="text" 
              placeholder="Value" 
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 14px',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'monospace'
              }}
            />
          </div>
          <button 
            type="submit"
            disabled={saving || !newKey.trim()}
            style={{
              background: 'var(--admin-accent)',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: (saving || !newKey.trim()) ? 0.7 : 1
            }}
          >
            <Plus size={16} /> ADD
          </button>
        </form>
      </div>
    </div>
  )
}
