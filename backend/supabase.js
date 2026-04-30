/**
 * supabase.js — Hectate Supabase Backend Client
 *
 * Uses the SERVICE ROLE key so all DB operations bypass RLS.
 * NEVER expose this key to the frontend.
 *
 * Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL        = process.env.SUPABASE_URL        || 'https://ywfftwifgjufybhhmaqn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.warn('[Supabase] ⚠️  SUPABASE_SERVICE_KEY is not set in backend/.env — Supabase sync is DISABLED.');
}

const supabase = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

/**
 * Save a newly registered user to Supabase profiles table.
 */
async function syncUserToSupabase(user) {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('profiles').upsert({
      id:              user.id,
      name:            user.name,
      handle:          user.alias,
      city:            user.cityState ? user.cityState.split(',')[0] : null,
      state:           user.cityState && user.cityState.includes(',') ? user.cityState.split(',')[1] : null,
      dob:             user.dob || null,
      aadhaar_ref:     user.aadhaarHash || null,
      avatar_initials: user.name ? user.name.substring(0, 2).toUpperCase() : 'UU',
      bio:             user.bio || null,
      verified:        user.verified || false,
      joined:          user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] syncUser error:', error.message, error.details);
    } else {
      console.log('[Supabase] ✅ User synced to profiles:', user.alias);
    }
  } catch (err) {
    console.error('[Supabase] syncUser exception:', err.message);
  }
}

/**
 * Mark user as verified in Supabase.
 */
async function markVerifiedInSupabase(userId) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ verified: true })
      .eq('id', userId);
    if (error) console.error('[Supabase] markVerified error:', error.message);
    else console.log('[Supabase] ✅ User verified:', userId);
  } catch (err) {
    console.error('[Supabase] markVerified exception:', err.message);
  }
}

module.exports = { supabase, syncUserToSupabase, markVerifiedInSupabase };
