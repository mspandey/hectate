import { useState, useMemo } from 'react'
import { 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Download, 
  Info,
  Scale,
  Gavel,
  BookOpen,
  Eye,
  X,
  ExternalLink
} from 'lucide-react'
import lawsData from '../data/lawsData.json'

const DISCLAIMER = "Disclaimer: This information is provided for general awareness and educational purposes only. It does not constitute legal advice. For specific legal concerns, please consult a qualified legal professional."

// Helper to format act titles
const formatTitle = (title) => {
  return title
    .replace(/([A-Z])/g, ' $1')
    .replace(/Act(\d+)/, ' Act, $1')
    .replace(/_/g, ' ')
    .trim()
}

export default function KnowYourRights() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedAct, setExpandedAct] = useState(null)
  const [viewingPdf, setViewingPdf] = useState(null)

  const filteredLaws = useMemo(() => {
    return lawsData.filter(law => 
      law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.raw_preview.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const toggleExpand = (id) => {
    setExpandedAct(expandedAct === id ? null : id)
  }

  const handleDownload = (fileName) => {
    const link = document.createElement('a')
    link.href = `/law/${fileName}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="know-your-rights-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header Section */}
      <header className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="hectate-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Scale size={32} className="hectate-pink-text" />
          Know Your Rights
        </h1>
        <p className="hectate-subtitle" style={{ color: 'var(--slate-400)', fontSize: '1.1rem' }}>
          Empowering you with knowledge of Indian laws protecting women's safety and dignity.
        </p>
      </header>

      {/* Disclaimer */}
      <div className="legal-disclaimer-card glass-card" style={{ 
        padding: '1.5rem', 
        marginBottom: '2.5rem', 
        borderLeft: '4px solid var(--hectate-pink)',
        background: 'rgba(236, 28, 110, 0.05)',
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start'
      }}>
        <ShieldAlert size={24} className="hectate-pink-text" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--slate-300)' }}>
          {DISCLAIMER}
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-wrapper" style={{ marginBottom: '2.5rem', position: 'relative' }}>
        <Search className="search-icon" size={20} style={{ 
          position: 'absolute', 
          left: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'var(--slate-500)'
        }} />
        <input
          type="text"
          placeholder="Search by act name or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="hectate-input"
          style={{ 
            width: '100%', 
            padding: '16px 16px 16px 52px',
            fontSize: '1rem',
            borderRadius: '12px',
            background: 'var(--slate-900)',
            border: '1px solid var(--slate-800)'
          }}
        />
      </div>

      {/* Laws List */}
      <div className="laws-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredLaws.length > 0 ? (
          filteredLaws.map((law) => (
            <div 
              key={law.id} 
              className={`law-card glass-card ${expandedAct === law.id ? 'expanded' : ''}`}
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                border: expandedAct === law.id ? '1px solid var(--hectate-pink)' : '1px solid var(--slate-800)'
              }}
            >
              <div 
                className="law-header" 
                onClick={() => toggleExpand(law.id)}
                style={{ 
                  padding: '1.5rem', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: expandedAct === law.id ? 'rgba(236, 28, 110, 0.05)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="icon-badge" style={{ 
                    padding: '10px', 
                    borderRadius: '10px', 
                    background: 'var(--slate-800)',
                    color: 'var(--hectate-pink)'
                  }}>
                    <Gavel size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                      {formatTitle(law.title)}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      Legal Document • PDF
                    </span>
                  </div>
                </div>
                {expandedAct === law.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedAct === law.id && (
                <div className="law-body" style={{ padding: '1.5rem', borderTop: '1px solid var(--slate-800)', background: 'rgba(0,0,0,0.2)' }}>
                  <p style={{ color: 'var(--slate-400)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    Access the complete official document for <strong>{formatTitle(law.title)}</strong>. 
                    You can view it directly in your browser or download it for offline reading.
                  </p>
                  
                  <div className="law-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setViewingPdf(law)}
                      className="hectate-button" 
                      style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Eye size={18} />
                      View Full Document
                    </button>
                    <button 
                      onClick={() => handleDownload(law.fileName)}
                      className="hectate-button secondary" 
                      style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Download size={18} />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-results glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Search size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p style={{ color: 'var(--slate-400)' }}>No laws found matching "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="hectate-link" style={{ color: 'var(--hectate-pink)' }}>
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="pdf-viewer-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.95)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem'
        }}>
          <div className="viewer-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            background: 'var(--slate-900)',
            borderRadius: '12px 12px 0 0',
            borderBottom: '1px solid var(--slate-800)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Gavel size={20} className="hectate-pink-text" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                {formatTitle(viewingPdf.title)}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a 
                href={`/law/${viewingPdf.fileName}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hectate-button secondary"
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <ExternalLink size={16} />
              </a>
              <button 
                onClick={() => setViewingPdf(null)}
                className="hectate-button secondary"
                style={{ padding: '8px', background: 'var(--slate-800)' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="viewer-content" style={{ flex: 1, background: '#fff', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
            <iframe 
              src={`/law/${viewingPdf.fileName}#toolbar=0`} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
              title={viewingPdf.title}
            />
          </div>
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
            Tip: Use the button in the top right to open in a new tab if the viewer is not loading.
          </div>
        </div>
      )}
      
      {/* Footer Info */}
      <footer style={{ marginTop: '4rem', textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--slate-800)' }}>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>
          Data sourced from official Government of India legislative repositories.
        </p>
      </footer>
    </div>
  )
}

