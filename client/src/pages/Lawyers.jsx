import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Mail, X, Shield, Clock, Award, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import TiltCard from '../components/ui/TiltCard'
import SwimText from '../components/ui/SwimText'
import { supabase } from '../lib/supabaseClient'

// Helper for Specs (will be computed inside component or from data)
const getSpecs = (lawyers) => ['All', ...new Set(lawyers.flatMap(l => l.specs || []))].sort((a, b) =>
  a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
)

// Generate email from lawyer name: "Adv. Nirmala Bansal" → "nirmalabansal@gmail.com"
const getLawyerEmail = (name = '') => {
  const cleaned = name
    .replace(/^adv\.?\s*/i, '')   // remove "Adv." prefix
    .replace(/\s+/g, '')           // remove all spaces
    .toLowerCase();
  return `${cleaned}@gmail.com`;
}

function StarRating({ rating, size = 14 }) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  )
}

function LawyerModal({ lawyer, onClose }) {
  const [expandedReview, setExpandedReview] = useState(null)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="lawyer-avatar-lg">
              {lawyer.initials}
            </div>
            <div>
              <h2 className="modal-name">{lawyer.name}</h2>
              <p className="modal-title">{lawyer.title}</p>
              <div className="modal-badges">
                <span className="badge badge-gold"><Shield size={11} /> Verified</span>
                <span className="modal-meta-item"><MapPin size={12} /> {lawyer.location}</span>
                <span className="modal-meta-item"><Clock size={12} /> {lawyer.experience_years} yrs</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="modal-section">
            <h3 className="modal-section-title"><BookOpen size={14} /> Education</h3>
            <p className="modal-section-text">{lawyer.college}</p>
            <div className="badge-row">
              {lawyer.quals.map(q => <span key={q} className="badge" style={{ background: 'var(--slate-100)', color: 'var(--slate-700)', fontSize: 11 }}>{q}</span>)}
            </div>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title"><Award size={14} /> Specialisations</h3>
            <div className="badge-row">
              {lawyer.specs.map(s => <span key={s} className="badge badge-hectate">{s}</span>)}
            </div>
          </div>

          <div className="modal-cta">
            <a
              className="lawyer-email-link lawyer-email-link--modal"
              href={`mailto:${getLawyerEmail(lawyer.name)}`}
              onClick={e => e.stopPropagation()}
            >
              <Mail size={15} />
              {getLawyerEmail(lawyer.name)}
            </a>
          </div>

          <div className="modal-section">
            <h3 className="modal-section-title">
              Reviews ({lawyer.total_reviews})
              <StarRating rating={lawyer.rating} />
              <span style={{ fontSize: 13, color: 'var(--slate-400)', fontWeight: 400 }}>{lawyer.rating}/5</span>
            </h3>
            {lawyer.allReviews.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-card-header">
                  <div>
                    <span className="review-author-name">{r.author}</span>
                    <StarRating rating={r.rating} size={12} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="review-date">{r.date}</span>
                    <button
                      className="review-expand-btn"
                      onClick={() => setExpandedReview(expandedReview === i ? null : i)}
                    >
                      {expandedReview === i ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>
                {expandedReview === i && (
                  <SwimText as="p" className="review-text-expanded">{r.text}</SwimText>
                )}
                {expandedReview !== i && (
                  <p className="review-text-preview">{r.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}



export default function Lawyers() {
  const [lawyers, setLawyers]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [selectedSpecs, setSelectedSpecs] = useState(['All'])
  const [ratingFilter, setRatingFilter] = useState(0)
  const [sortBy, setSortBy]             = useState('Top Rated')
  const [selectedLawyer, setSelectedLawyer] = useState(null)
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false)

  const toggleSpec = (spec) => {
    if (spec === 'All') {
      setSelectedSpecs(['All'])
      return
    }

    let newSpecs = [...selectedSpecs].filter(s => s !== 'All')
    if (newSpecs.includes(spec)) {
      newSpecs = newSpecs.filter(s => s !== spec)
      if (newSpecs.length === 0) newSpecs = ['All']
    } else {
      newSpecs.push(spec)
    }
    setSelectedSpecs(newSpecs)
  }

  const fetchLawyers = async () => {
    try {
      const { data, error } = await supabase
        .from('lawyers')
        .select(`
          *,
          lawyer_reviews (*)
        `);

      if (error) throw error;

      const formattedLawyers = data.map(l => ({
        ...l,
        initials: l.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
        allReviews: (l.lawyer_reviews || []).map(r => ({
          author: r.reviewer,
          rating: r.stars,
          text: r.text,
          date: r.date
        }))
      }));

      setLawyers(formattedLawyers);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, []);

  const allSpecs = getSpecs(lawyers)

  const filtered = lawyers.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                        l.location.toLowerCase().includes(search.toLowerCase())
    const matchSpec   = selectedSpecs.includes('All') || 
                        (l.specs && l.specs.some(s => selectedSpecs.includes(s)))
    const matchRating = l.rating >= ratingFilter
    return matchSearch && matchSpec && matchRating
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Top Rated') return b.rating - a.rating
    if (sortBy === 'Most Experienced') return (b.experience_years || 0) - (a.experience_years || 0)
    if (sortBy === 'Reviews') return (b.total_reviews || 0) - (a.total_reviews || 0)
    return 0
  })

  const selectedCount = selectedSpecs.filter(s => s !== 'All').length

  return (
    <div className="lawyers-page" id="lawyers-panel">
      {/* Header */}
      <div className="lawyers-hero" style={{ marginBottom: '2.5rem' }}>
        <h1 className="lawyers-hero-title">Find an Advocate</h1>
        <p className="lawyers-hero-sub">
          Verified women lawyers who understand your fight — {lawyers.length} advocates nationwide
        </p>
      </div>

      <div className="premium-filter-section">
        {/* Row 1: Search & Rating */}
        <div className="filter-row">
          <div className="premium-search-wrapper">
            <Search size={18} className="search-icon-premium" />
            <input
              className="premium-search-input"
              placeholder="Search by name, city, specialisation..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div>
            <span className="filter-group-label">Minimum Rating</span>
            <div className="rating-pill-group">
              {[0, 3, 4].map(n => (
                <button
                  key={n}
                  className={`rating-pill ${ratingFilter === n ? 'active' : ''}`}
                  onClick={() => setRatingFilter(n)}
                >
                  {n === 0 ? 'All' : `${n}★ & up`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="filter-group-label">Sort By</span>
            <div className="rating-pill-group">
              {['Top Rated', 'Most Experienced', 'Reviews'].map(s => (
                <button
                  key={s}
                  className={`rating-pill ${sortBy === s ? 'active' : ''}`}
                  onClick={() => setSortBy(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Categories (Collapsible) */}
        <div className="filter-group-collapsible">
          <div 
            className="filter-group-header" 
            onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
          >
            <span className="filter-group-label">
              Practice Areas {selectedCount > 0 && `(${selectedCount})`}
            </span>
            <ChevronDown 
              size={16} 
              className={`dropdown-arrow ${isSpecsExpanded ? 'expanded' : ''}`} 
            />
          </div>
          
          <div className={`collapsible-filters ${isSpecsExpanded ? 'expanded' : ''}`}>
            <div className="filter-pill-group">
              {allSpecs.map(s => (
                <button
                  key={s}
                  className={`filter-pill ${selectedSpecs.includes(s) ? 'active' : ''}`}
                  onClick={() => toggleSpec(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="lawyers-count">Showing {sorted.length} of {lawyers.length} advocates</p>

      {/* 3D Tilt Grid */}
      <div className="lawyers-grid" id="lawyers-grid">
        {sorted.map(l => (
          <TiltCard
            key={l.id}
            className="lawyer-card glass-card"
            onClick={() => setSelectedLawyer(l)}
          >
            {/* Verified badge glow */}
            <div className="lawyer-verified-badge">
              <span>⭐</span>
              <span className="verified-text">Verified</span>
            </div>

            {/* Avatar centered */}
            <div className="lawyer-avatar-center">
              {l.initials}
            </div>

            <div className="lawyer-card-body">
              <h3 className="lawyer-card-name">
                {l.name}
                <Shield size={13} color="var(--yellow-500)" style={{ marginLeft: 4 }} />
              </h3>
              <p className="lawyer-card-title">{l.title}</p>
              <div className="lawyer-card-location">
                <MapPin size={12} /> {l.location}
              </div>
              <div className="lawyer-card-rating">
                <StarRating rating={l.rating} />
                <span>{l.rating} ({l.total_reviews})</span>
              </div>
              <div className="lawyer-card-exp">
                <Clock size={11} /> {l.experience_years} yrs experience
              </div>
            </div>

            <div className="lawyer-card-specs">
              {l.specs.slice(0, 2).map(s => <span key={s} className="badge badge-hectate" style={{ fontSize: 10 }}>{s}</span>)}
              {l.specs.length > 2 && <span className="badge" style={{ fontSize: 10, background: 'var(--slate-100)', color: 'var(--slate-500)' }}>+{l.specs.length - 2}</span>}
            </div>

            <div className="lawyer-card-email">
              <a
                className="lawyer-email-link"
                href={`mailto:${getLawyerEmail(l.name)}`}
                onClick={e => e.stopPropagation()}
              >
                <Mail size={12} />
                {getLawyerEmail(l.name)}
              </a>
            </div>
          </TiltCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Shield size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
          <p>No lawyers match your search. Try different filters.</p>
        </div>
      )}

      {selectedLawyer && <LawyerModal lawyer={selectedLawyer} onClose={() => setSelectedLawyer(null)} />}
    </div>
  )
}
