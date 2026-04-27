import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronDown, ChevronUp, Search, Shield, 
  UserCheck, AlertTriangle, ShieldAlert, Lock,
  ArrowLeft, MessageSquare, Mail, Phone
} from 'lucide-react'
import '../../styles/community.css'

const FAQ_DATA = [
  {
    category: "Account & Verification",
    icon: <UserCheck className="text-pink-500" />,
    questions: [
      {
        q: "How does the verification process work?",
        a: "Our verification process uses AI-powered identity checks. You provide a valid ID and a live selfie, which are then compared to ensure authenticity. This ensures our community remains a safe space exclusively for women."
      },
      {
        q: "Is my personal identity shared with other members?",
        a: "No. Your legal identity is only used for verification and is never shared with the community. You can choose a pseudonym (alias) for all public interactions."
      },
      {
        q: "Why was my verification rejected?",
        a: "Verification can be rejected if the ID photo is blurry, expired, or doesn't match the live selfie. Ensure you are in a well-lit area and follow the on-screen instructions closely."
      }
    ]
  },
  {
    category: "Community Guidelines",
    icon: <MessageSquare className="text-pink-500" />,
    questions: [
      {
        q: "What kind of content can I share?",
        a: "You can share personal stories, seek legal advice, request support, or report safety concerns. We encourage a culture of mutual support and empowerment."
      },
      {
        q: "What is strictly prohibited?",
        a: "Hate speech, harassment, impersonation, and any form of male presence are strictly prohibited. Violating these rules will result in an immediate and permanent ban."
      },
      {
        q: "Can I post anonymously?",
        a: "Yes, all posts are associated with your alias, not your real name. This allows you to share sensitive stories without compromising your privacy."
      }
    ]
  },
  {
    category: "Reporting Abuse",
    icon: <AlertTriangle className="text-pink-500" />,
    questions: [
      {
        q: "How do I report a suspicious post or comment?",
        a: "Every post and comment has a report icon (flag). Clicking this alerts our 24/7 moderation team, who will review the content against our guidelines."
      },
      {
        q: "What happens after I report someone?",
        a: "The content is hidden for you immediately. Our moderators review the report within hours. If a violation is found, the user may be warned, suspended, or banned depending on the severity."
      }
    ]
  },

  {
    category: "Privacy & Safety",
    icon: <Lock className="text-pink-500" />,
    questions: [
      {
        q: "Is my location always being tracked?",
        a: "No. Your location is never tracked in the background. We only access device sensors when you are actively using the application for verification or community interaction."
      },
      {
        q: "How is my data stored?",
        a: "All sensitive data is encrypted at rest and in transit. We use industry-standard security protocols to ensure your information remains private and secure."
      }
    ]
  }
]

export default function FAQ() {
  const [search, setSearch] = useState('')
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredData = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(search.toLowerCase()) || 
      q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0)

  return (
    <div className="community-container">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Link to="/feed" className="side-nav-item" style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px' }}>
              <ArrowLeft size={20} />
            </Link>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--hectate-dark)', margin: 0 }}>
              Support & Safety <span style={{ color: 'var(--hectate-pink)' }}>FAQ</span>
            </h1>
          </div>
          <p style={{ color: 'var(--slate-500)', fontSize: '18px' }}>
            Find answers to common questions about your safety and the HECTATE community.
          </p>
        </header>

        {/* Search Bar */}
        <div className="glass-card" style={{ marginBottom: '40px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} color="var(--slate-400)" />
          <input 
            type="text" 
            placeholder="Search help topics..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              fontSize: '16px', 
              outline: 'none',
              color: 'var(--text-main)'
            }}
          />
        </div>

        {/* FAQ List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredData.length > 0 ? (
            filteredData.map((cat) => (
              <section key={cat.category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingLeft: '8px' }}>
                  <div style={{ color: 'var(--hectate-pink)' }}>{cat.icon}</div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--hectate-burgundy)', margin: 0 }}>
                    {cat.category}
                  </h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cat.questions.map((item, idx) => {
                    const isOpen = openItems[`${cat.category}-${idx}`]
                    return (
                      <div 
                        key={idx} 
                        className="glass-card" 
                        style={{ 
                          padding: '0', 
                          overflow: 'hidden',
                          borderColor: isOpen ? 'var(--hectate-pink)' : 'var(--card-border)'
                        }}
                      >
                        <button 
                          onClick={() => toggleItem(cat.category, idx)}
                          style={{ 
                            width: '100%', 
                            padding: '20px 24px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--hectate-dark)' }}>
                            {item.q}
                          </span>
                          {isOpen ? <ChevronUp size={20} color="var(--hectate-pink)" /> : <ChevronDown size={20} color="var(--slate-400)" />}
                        </button>
                        
                        {isOpen && (
                          <div style={{ 
                            padding: '0 24px 20px', 
                            fontSize: '15px', 
                            lineHeight: '1.6', 
                            color: 'var(--slate-600)',
                            animation: 'slideDown 0.2s ease-out'
                          }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="empty-state glass-card">
              <p>No results found for "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer Help */}
        <footer className="glass-card" style={{ marginTop: '60px', textAlign: 'center', background: 'var(--hectate-burgundy)', color: 'white' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Still need help?</h3>
          <p style={{ opacity: 0.8, marginBottom: '24px' }}>Our support team is available 24/7 to assist you with any concerns.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <a href="mailto:support@HECTATE.com" className="btn-post" style={{ background: 'white', color: 'var(--hectate-burgundy)', boxShadow: 'none' }}>
              <Mail size={18} /> Email Support
            </a>
            <button className="btn-post" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none' }}>
              <Phone size={18} /> Emergency Hotline
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
