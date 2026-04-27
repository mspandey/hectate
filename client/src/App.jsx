import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useContext, useState } from 'react'

// Layout & UI
import Sidebar from './components/layout/Sidebar'
import StickyHeader from './components/layout/StickyHeader'
import TypeAnimation from './components/ui/TypeAnimation'
import ParticleField from './components/ui/ParticleField'
import CursorRipple from './components/ui/CursorRipple'
import MetricCards from './components/ui/MetricCards'
import useCursorTracker from './hooks/useCursorTracker'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import AuthSelection from './pages/AuthSelection'
import Verification from './pages/Verification'
import CommunityDashboard from './pages/CommunityDashboard'
import Feed from './pages/Feed'
import UserDashboard from './pages/UserDashboard'
import Lawyers from './pages/Lawyers'
import Profile from './pages/Profile'
import KnowYourRights from './pages/KnowYourRights'

// Info Pages
import FeedInfo from './pages/info/FeedInfo'
import LawyerInfo from './pages/info/LawyerInfo'
import VerificationInfo from './pages/info/VerificationInfo'
import PrivacyPolicy from './pages/info/PrivacyPolicy'
import TermsOfService from './pages/info/TermsOfService'
import FAQ from './pages/info/FAQ'

// CSS Imports
import './styles/community.css'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import UserDetail from './pages/admin/UserDetail'
import AuditLog from './pages/admin/AuditLog'
import VerificationQueue from './pages/admin/VerificationQueue'
import FlaggedContent from './pages/admin/FlaggedContent'
import { LawyerManagement } from './pages/admin/StubPages'
import Settings from './pages/admin/Settings'
import AlertCenter from './pages/admin/AlertCenter'

// Store
import { AuthProvider, AuthContext } from './store/AuthContext'

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <main className="shell-main">
        <StickyHeader />

        <div className="shell-content">

          {children}
        </div>
      </main>
    </div>
  )
}

const AppRoutes = () => {
  const { isVerified, user } = useContext(AuthContext)
  const [showSplash, setShowSplash] = useState(true)

  useCursorTracker()

  if (showSplash && !user) {
    return <TypeAnimation text="Hectate — Where your safety isn't optional" onComplete={() => setShowSplash(false)} />
  }

  return (
    <>
      <ParticleField count={12} />
      <CursorRipple />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isVerified ? <Navigate to="/dashboard" /> : <Navigate to="/welcome" />} />
        <Route path="/welcome" element={<Landing />} />
        <Route path="/join" element={<AuthSelection />} />
        <Route path="/auth" element={isVerified ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/login" element={<Navigate to="/auth" />} />
        <Route path="/verify" element={isVerified ? <Navigate to="/dashboard" /> : <Verification />} />
        
        {/* Informational Pages */}
        <Route path="/about/feed" element={<FeedInfo />} />
        <Route path="/about/lawyers" element={<LawyerInfo />} />
        <Route path="/about/verification" element={<VerificationInfo />} />
        <Route path="/about/privacy" element={<PrivacyPolicy />} />
        <Route path="/about/terms" element={<TermsOfService />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/community" element={<Navigate to="/about/feed" />} />
        <Route path="/verification-guide" element={<Navigate to="/about/verification" />} />

        {/* Protected routes — inside AppShell */}
        <Route path="/dashboard" element={
          isVerified 
            ? <AppShell><UserDashboard /></AppShell> 
            : <Navigate to={user ? "/verify" : "/login"} />
        } />
        <Route path="/feed" element={
          isVerified 
            ? <AppShell><Feed /></AppShell> 
            : <Navigate to={user ? "/verify" : "/login"} />
        } />
        <Route path="/lawyers" element={
          isVerified
            ? <AppShell><Lawyers /></AppShell>
            : <Navigate to={user ? "/verify" : "/login"} />
        } />
        <Route path="/profile" element={
          isVerified
            ? <AppShell><Profile /></AppShell>
            : <Navigate to={user ? "/verify" : "/login"} />
        } />
        <Route path="/know-your-rights" element={
          isVerified
            ? <AppShell><KnowYourRights /></AppShell>
            : <Navigate to={user ? "/verify" : "/login"} />
        } />

        {/* Admin routes */}
        <Route path="/register" element={<Navigate to="/join" />} />
        <Route path="/Register" element={<Navigate to="/join" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="verification-queue" element={<VerificationQueue />} />
          <Route path="flagged-content" element={<FlaggedContent />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="lawyers" element={<LawyerManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

import { ThemeProvider } from './store/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
