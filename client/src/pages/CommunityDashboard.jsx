import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldAlert, MessageSquare, Users, Phone, MapPin, ChevronRight, Search, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import TiltCard from '../components/ui/TiltCard';
import SwimText from '../components/ui/SwimText';

export default function CommunityDashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockedStates, setLockedStates] = useState({
    community: true,
    directory: true
  });

  const fetchData = async () => {
    try {
      const [postsRes, lawyersRes] = await Promise.all([
        supabase.from('posts').select('*').order('timestamp', { ascending: false }).limit(5),
        supabase.from('lawyers').select('*').order('rating', { ascending: false }).limit(3)
      ]);
      if (postsRes.data) setPosts(postsRes.data);
      if (lawyersRes.data) setLawyers(lawyersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unlock = (key) => {
    setLockedStates(prev => ({ ...prev, [key]: false }));
  };

  return (
    <div className="hectate-dashboard">
      {/* Hero Section */}
      <div className="hectate-hero">
        <h1>HECTATE Protocol 2.1 — Welcome Back</h1>
        <h2>System Status: <span style={{ color: 'var(--hectate-pink)' }}>Active & Encrypted</span></h2>
      </div>

      {/* 3-Column Grid */}
      <div className="hectate-grid">
        
        {/* Column 1: Community Stories */}
        <TiltCard className="hectate-card">
          {lockedStates.community && (
            <div className="locked-overlay" onClick={() => unlock('community')}>
              <Lock className="locked-icon" size={32} />
              <span className="locked-text">Authenticate to View Stories</span>
            </div>
          )}
          <div className="card-header-status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={16} color="var(--hectate-pink)" />
              <span className="status-label">Community Pulse</span>
            </div>
            <span className={`status-label ${lockedStates.community ? '' : 'status-unlocked'}`}>
              {lockedStates.community ? 'LOCKED' : 'SECURE'}
            </span>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px' }}>Recent Disclosures</h3>
              <PlusCircle size={20} color="var(--hectate-pink)" style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {posts.map((post) => (
                <div key={post.id} style={{ borderLeft: '2px solid var(--hectate-border)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {post.author_handle || 'Anonymous'} • {new Date(post.timestamp).toLocaleDateString()}
                  </div>
                  <SwimText style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    {post.content}
                  </SwimText>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>

        {/* Column 2: Expert Directory */}
        <TiltCard className="hectate-card">
          {lockedStates.directory && (
            <div className="locked-overlay" onClick={() => unlock('directory')}>
              <Users className="locked-icon" size={32} />
              <span className="locked-text">Verify Identity for Directory</span>
            </div>
          )}
          <div className="card-header-status">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} color="var(--hectate-pink)" />
              <span className="status-label">Expert Network</span>
            </div>
            <span className={`status-label ${lockedStates.directory ? '' : 'status-unlocked'}`}>
              {lockedStates.directory ? 'LOCKED' : 'VERIFIED'}
            </span>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Search Legal Experts..." 
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'white', fontSize: '14px' }}
              />
              <Search size={16} style={{ position: 'absolute', right: '16px', top: '14px', color: 'var(--slate-500)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {lawyers.map((lawyer) => (
                <div key={lawyer.id} style={{ padding: '16px', background: 'var(--hectate-soft-pink)', borderRadius: '16px', border: '1px solid var(--hectate-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--hectate-gradient)', borderRadius: '10px', display: 'flex', alignItems: 'center', justify: 'center', color: 'white', fontWeight: 'bold' }}>
                    {lawyer.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{lawyer.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{lawyer.title}</div>
                  </div>
                  <ChevronRight size={16} color="var(--hectate-pink)" />
                </div>
              ))}
            </div>
            
            <button className="btn" style={{ width: '100%', marginTop: '24px', background: 'transparent', border: '1px solid var(--hectate-pink)', color: 'var(--hectate-pink)' }}>
              Enter Full Directory
            </button>
          </div>
        </TiltCard>



      </div>
    </div>
  );
}
