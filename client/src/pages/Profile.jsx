import { useContext, useState } from 'react'
import { AuthContext } from '../store/AuthContext'
import { useTheme } from '../store/ThemeContext'
import { Shield, User, Lock, Eye, Download, Trash2, LogOut, Moon } from 'lucide-react'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function Profile() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <div className="profile-page">
      <div className="profile-header" style={{ animation: 'fadeUp 0.4s ease' }}>
        <div className="profile-avatar-lg">{user?.alias?.[0]?.toUpperCase() || '?'}</div>
        <h2 className="profile-name">@{user?.alias || 'anonymous'}</h2>
        <p className="profile-alias">Display name hidden • Joined March 2026</p>
        <div className="profile-badges">
          <span className="badge badge-Hectate"><Shield size={12}/> Verified Woman</span>
          <span className="badge badge-green">Active Member</span>
        </div>
      </div>

      <div className="profile-section">
        <h3><User size={18}/> Account</h3>
        <div className="profile-row">
          <span className="profile-row-label">Alias Username</span>
          <span className="profile-row-value">@{user?.alias}</span>
        </div>
        <div className="profile-row">
          <span className="profile-row-label">Display Name</span>
          <span className="profile-row-value" style={{ color:'var(--slate-400)' }}>Hidden</span>
        </div>
        <div className="profile-row">
          <span className="profile-row-label">Verification Status</span>
          <span className="badge badge-Hectate" style={{ fontSize:11 }}><Shield size={10}/> Verified</span>
        </div>
        <div className="profile-row">
          <span className="profile-row-label">Two-Factor Auth</span>
          <span className="badge badge-green" style={{ fontSize:11 }}>Enabled</span>
        </div>
      </div>



      <div className="profile-section">
        <h3><Lock size={18}/> Privacy & Safety</h3>
        <div className="profile-row">
          <span className="profile-row-label"><Eye size={16}/> Default Post Privacy</span>
          <span className="profile-row-value">All Verified Women</span>
        </div>
        <div className="profile-row">
          <span className="profile-row-label"><Moon size={16}/> Dark Mode</span>
          <ThemeToggle />
        </div>
      </div>

      <div className="profile-section">
        <h3><Download size={18}/> Data & Account</h3>
        <button className="btn btn-secondary btn-sm" style={{ width:'100%', marginBottom:8 }}>
          <Download size={14}/> Export My Data
        </button>
        <button className="btn btn-sm" style={{ width:'100%', marginBottom:8, background:'#fee2e2', color:'var(--red-600)' }}>
          <Trash2 size={14}/> Delete Account
        </button>
        <p style={{ fontSize:11, color:'var(--slate-400)', textAlign:'center' }}>
          Account deletion wipes all personal data within 48 hours (DPDP Act compliant)
        </p>
      </div>

      <button className="btn btn-secondary" style={{ width:'100%', marginTop:8 }} onClick={logout}>
        <LogOut size={16}/> Sign Out
      </button>

      <p style={{ textAlign:'center', fontSize:11, color:'var(--slate-400)', marginTop:24 }}>
        Hectate v1.0 — Crisis helplines: iCall 9152987821 | Vandrevala Foundation 1860-2662-345
      </p>
    </div>
  )
}
