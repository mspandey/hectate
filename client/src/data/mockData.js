// ─── Re-export the three databases ───────────────────────────
export { LAWYERS_DATABASE }  from './lawyers_database';
export { COMMUNITY_FEED }    from './community_feed';
export { WOMEN_DATABASE }    from './women_database';

// ─── Adapters: shape the rich data into the format components expect ──────────
import { LAWYERS_DATABASE } from './lawyers_database';
import { COMMUNITY_FEED }   from './community_feed';
import { WOMEN_DATABASE }   from './women_database';

/**
 * mockLawyers — maps LAWYERS_DATABASE → shape expected by Lawyers.jsx
 * The new database has richer fields; we surface them all, keeping the old
 * keys so existing code continues to work without changes.
 */
export const mockLawyers = LAWYERS_DATABASE.map(l => ({
  // Legacy keys (Lawyers.jsx uses these)
  id:             l.id,
  name:           l.name,
  initials:       l.name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase(),
  city:           l.location.split(',')[0].trim(),
  state:          l.location.split(',').slice(1).join(',').trim(),
  languages:      ['English', 'Hindi'],           // not in source data; sensible default
  rating:         l.rating,
  reviews:        l.total_reviews,
  specialisations: l.specs,
  consultation:   'Consultation available',
  availability:   l.rating >= 4 ? 'available' : 'soon',
  about:          `${l.title}. ${l.experience_years} years of experience. ` +
                  `Specialises in ${l.specs.join(', ')}.`,
  education:      [l.college, ...l.quals].join(' | '),
  topReview:      l.reviews[0]
    ? { author: l.reviews[0].reviewer, rating: l.reviews[0].stars, text: l.reviews[0].text, date: l.reviews[0].date }
    : null,
  allReviews:     l.reviews.map(r => ({ author: r.reviewer, rating: r.stars, text: r.text, date: r.date })),
  // Extra fields from the rich database (available to new components)
  title:          l.title,
  college:        l.college,
  quals:          l.quals,
  specs:          l.specs,
  experience_years: l.experience_years,
  location:       l.location,
  total_reviews:  l.total_reviews,
}));

/**
 * mockPosts — maps COMMUNITY_FEED → shape expected by Feed.jsx
 * Feed.jsx uses: id, username, anonymous, time, body, cw, tags,
 *               reactions{hear,alone}, comments, revealed
 */
export const mockPosts = COMMUNITY_FEED.map(p => ({
  // Legacy keys
  id:        p.id,
  username:  p.author_handle.replace('@', ''),
  anonymous: false,
  time:      new Date(p.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
  body:      p.content,
  cw:        null,
  tags:      p.tags.map(t => `#${t}`),
  reactions: { hear: p.likes, alone: p.reposts },
  comments:  p.reply_count,
  revealed:  true,
  // Extra fields
  author_id:    p.author_id,
  author_name:  p.author_name,
  author_handle: p.author_handle,
  likes:        p.likes,
  reposts:      p.reposts,
  replies:      p.replies,
  timestamp:    p.timestamp,
}));


/**
 * contentWarnings — unchanged
 */
export const contentWarnings = [
  { value: 'harassment',    label: 'Harassment',         color: 'var(--pink-100)',    textColor: 'var(--pink-500)' },
  { value: 'assault',       label: 'Assault',            color: '#fee2e2',            textColor: 'var(--red-600)' },
  { value: 'workplace',     label: 'Workplace',          color: 'var(--purple-100)',  textColor: 'var(--purple-700)' },
  { value: 'domestic',      label: 'Domestic',           color: '#fef3c7',            textColor: '#b45309' },
  { value: 'stalking',      label: 'Stalking',           color: '#e0e7ff',            textColor: '#4338ca' },
  { value: 'mental health', label: 'Mental Health',      color: '#d1fae5',            textColor: '#059669' },
  { value: 'legal victory', label: 'Legal Victory ✨',   color: '#dcfce7',            textColor: '#16a34a' },
];

/**
 * mockWomen — convenience re-export for any component that needs the women list
 */
export const mockWomen = WOMEN_DATABASE;
