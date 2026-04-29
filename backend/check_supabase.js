require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ywfftwifgjufybhhmaqn.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3ZmZ0d2lmZ2p1ZnliaGhtYXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDgxNDAsImV4cCI6MjA5MjYyNDE0MH0.5aSRZS6PteObRaS0J7TDBBfty_-QG4ZcRAVLvIf2bzc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Select Result:', { data, error });
  
  // Try insert
  const { error: insertError } = await supabase.from('users').upsert({
    id: 'test-id-1234',
    email: 'testsup@example.com',
    mobile_number: '9999999999',
    password_hash: 'hash',
    name: 'test',
    alias: 'testalias',
    dob: new Date().toISOString(),
    display_mode: 'public',
    role: 'user',
    status: 'active'
  }, { onConflict: 'id' });
  console.log('Insert Result:', { error: insertError });
}

check();
