import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  Users, 
  Scale, 
  ShieldAlert, 
  Lock, 
  FileText, 
  MessageCircle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  AlertTriangle,
  User,
  CheckCircle,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../store/AuthContext';
import { supabase } from '../lib/supabaseClient';
import '../styles/community.css';
import '../styles/Dashboard.css';

export default function UserDashboard() {
  const { user, isVerified } = useContext(AuthContext);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const [latestPosts, setLatestPosts] = useState([]);
  const [topLawyers, setTopLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch 3 latest posts
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(3);
        
        // Fetch 2 top lawyers
        const { data: lawyers } = await supabase
          .from('lawyers')
          .select('*')
          .order('rating', { ascending: false })
          .limit(2);

        setLatestPosts(posts || []);
        setTopLawyers(lawyers || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.welcome-text', {
        x: -20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
      
      gsap.from('.stat-item', {
        y: 10,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3
      });

      gsap.from('.action-card', {
        scale: 0.95,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.2)',
        delay: 0.5
      });

      gsap.from('.dashboard-column > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.8
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="dashboard-container" ref={containerRef}>
      {/* Header Section */}
      <header className="dashboard-hero">
        <div className="welcome-text">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Sister'}</h1>
          <p>Your safety and advocacy command center is ready.</p>
        </div>
        
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Security Status</span>
            <span className="stat-value" style={{ color: isVerified ? '#10B981' : '#F59E0B' }}>
              {isVerified ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
              {isVerified ? 'Verified' : 'Pending'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Safety Pulse</span>
            <span className="stat-value" style={{ color: '#10B981' }}>
              <Shield size={14} /> Active
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Last Check</span>
            <span className="stat-value">
              <Clock size={14} /> 2h ago
            </span>
          </div>
        </div>
      </header>

      {/* Quick Actions Row */}
      <section className="quick-actions-section">
        <div className="actions-grid">

          <div className="action-card" onClick={() => navigate('/feed')}>
            <div className="action-icon-wrap" style={{ background: 'rgba(236, 28, 110, 0.1)', color: 'var(--hectate-pink)' }}>
              <MessageCircle size={24} />
            </div>
            <div className="action-info">
              <h4>Community</h4>
              <p>Voices & Stories</p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate('/lawyers')}>
            <div className="action-icon-wrap" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--hectate-gold)' }}>
              <Scale size={24} />
            </div>
            <div className="action-info">
              <h4>Legal Hub</h4>
              <p>Find Advocates</p>
            </div>
          </div>

          <div className="action-card" onClick={() => navigate('/profile')}>
            <div className="action-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <User size={24} />
            </div>
            <div className="action-info">
              <h4>My Profile</h4>
              <p>Vault & Settings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Nearby Alerts Mock */}
          <div className="alerts-card card">
            <div className="section-header">
              <h3><AlertTriangle size={20} color="#EF4444" /> Nearby Alerts</h3>
              <span className="badge badge-red">LIVE</span>
            </div>
            
            <div className="alerts-list">
              <div className="alert-item">
                <div className="alert-dot" />
                <div className="alert-content">
                  <div className="alert-title">Suspicious Activity reported near Connaught Place</div>
                  <div className="alert-time">Reported 15 mins ago • 1.2km away</div>
                </div>
              </div>
              <div className="alert-item safe">
                <div className="alert-dot" />
                <div className="alert-content">
                  <div className="alert-title">Area marked safe by 12 Hectate users in Janpath</div>
                  <div className="alert-time">Updated 5 mins ago • 0.8km away</div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Status */}
          <div className="safety-status-card card">
            <div className="section-header">
              <h3><Shield size={20} color="#10B981" /> Safety Overview</h3>
              <span className="badge badge-green">ALL SECURE</span>
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: 14, marginBottom: 16 }}>
              Your current location is showing no active critical threats within 5km.
            </p>
            
            <div className="safety-check-grid">
            </div>
          </div>

          {/* Activity Preview */}
          <div className="card">
            <div className="section-header">
              <h3><Users size={20} color="var(--Safher-pink)" /> Community Activity</h3>
              <button className="view-all-link" onClick={() => navigate('/feed')}>
                View Feed <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="activity-preview">
              {loading ? (
                <div className="mini-post-card">Loading latest stories...</div>
              ) : latestPosts.map(post => (
                <div key={post.id} className="mini-post-card">
                  <div className="mini-avatar">
                    {(post.author_name || post.author_handle)?.[1]?.toUpperCase() || 'A'}
                  </div>
                  <div className="mini-post-content">
                    <div className="mini-post-header">
                      <span className="mini-post-author">{post.author_handle || 'Anonymous'}</span>
                      <span className="mini-post-time">
                        {new Date(post.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="mini-post-body">
                      {post.content?.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Verification Journey */}
          <div className="verification-card card">
            <div className="section-header">
              <h3><ShieldCheck size={20} color="var(--Safher-gold)" /> Verification</h3>
              {!isVerified && <span className="badge badge-gold">REQUIRED</span>}
            </div>
            <p style={{ color: 'var(--slate-400)', fontSize: 13, marginBottom: 20 }}>
              {isVerified 
                ? "You are a verified Hectate community member. Your reports carry extra weight."
                : "Complete your verification to access full community features and legal support."}
            </p>
            
            <div className="journey-steps">
              <div className="journey-step">
                <div className="step-icon complete">
                  <CheckCircle size={16} />
                </div>
                <span className="step-label">Account Created</span>
              </div>
              <div className="journey-step">
                <div className={`step-icon ${isVerified ? 'complete' : 'incomplete'}`}>
                  {isVerified ? <CheckCircle size={16} /> : <div style={{width: 8, height: 8, background: 'currentColor', borderRadius: '50%'}} />}
                </div>
                <span className="step-label">Aadhaar Identity</span>
                <span className="step-status">
                  {!isVerified && <button className="view-all-link" onClick={() => navigate('/verify')}>Verify</button>}
                </span>
              </div>
              <div className="journey-step">
                <div className={`step-icon ${isVerified ? 'complete' : 'incomplete'}`}>
                  {isVerified ? <CheckCircle size={16} /> : <div style={{width: 8, height: 8, background: 'currentColor', borderRadius: '50%'}} />}
                </div>
                <span className="step-label">Liveness Detection</span>
              </div>
            </div>
          </div>

          {/* Legal Support */}
          <div className="card">
            <div className="section-header">
              <h3><Scale size={20} color="var(--Safher-gold)" /> Legal Support</h3>
              <button className="view-all-link" onClick={() => navigate('/lawyers')}>
                Directory <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="lawyer-mini-list">
              {loading ? (
                <div>Loading advocates...</div>
              ) : topLawyers.map(lawyer => (
                <div key={lawyer.id} className="lawyer-mini-card" onClick={() => navigate('/lawyers')}>
                  <div className="lawyer-mini-avatar">
                    {lawyer.name?.split(' ').slice(-2).map(w => w[0]).join('')}
                  </div>
                  <div className="lawyer-mini-info">
                    <h5>{lawyer.name}</h5>
                    <p><MapPin size={10} inline /> {lawyer.location}</p>
                    <div style={{ color: 'var(--Safher-gold)', fontSize: 11, fontWeight: 700 }}>
                      ★ {lawyer.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
