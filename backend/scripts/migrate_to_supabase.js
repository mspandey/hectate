import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { WOMEN_DATABASE } from '../src/data/women_database.js';
import { COMMUNITY_FEED } from '../src/data/community_feed.js';
import { LAWYERS_DATABASE } from '../src/data/lawyers_database.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are set.');
  process.exit(1);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('🔑 Using Service Role Key for migration (RLS bypass enabled)');
} else {
    console.log('⚠️ Using Anon Key. Ensure RLS policies allow inserts.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function migrate() {
    console.log('🚀 Starting migration to Supabase...');

    // 1. Migrate Profiles
    console.log('👤 Migrating profiles...');
    const { error: profileError } = await supabase.from('profiles').upsert(WOMEN_DATABASE);
    if (profileError) {
        console.error('❌ Profile Migration Error:', profileError.message);
    } else {
        console.log('✅ Profiles migrated successfully.');
    }

    // 2. Migrate Posts and Replies
    console.log('📝 Migrating posts and replies...');
    let postCount = 0;
    let replyCount = 0;
    
    for (const post of COMMUNITY_FEED) {
        const { replies, ...postData } = post;
        const { error: postError } = await supabase.from('posts').upsert(postData);
        if (postError) {
            console.error(`❌ Post Error (ID: ${post.id}):`, postError.message);
            continue;
        }
        postCount++;

        if (replies && replies.length > 0) {
            const repliesWithPostId = replies.map(r => ({ 
                id: r.id,
                post_id: post.id,
                author_id: r.author_id,
                author_handle: r.author_handle,
                content: r.content,
                timestamp: r.timestamp,
                likes: r.likes || 0
            }));
            const { error: replyError } = await supabase.from('replies').upsert(repliesWithPostId);
            if (replyError) {
                console.error(`❌ Reply Error for Post ${post.id}:`, replyError.message);
            } else {
                replyCount += replies.length;
            }
        }
    }
    console.log(`✅ Migrated ${postCount} posts and ${replyCount} replies.`);

    // 3. Migrate Lawyers and Lawyer Reviews
    console.log('⚖️ Migrating lawyers and reviews...');
    let lawyerCount = 0;
    let reviewCount = 0;

    for (const lawyer of LAWYERS_DATABASE) {
        const { reviews, ...lawyerData } = lawyer;
        const { error: lawyerError } = await supabase.from('lawyers').upsert(lawyerData);
        if (lawyerError) {
            console.error(`❌ Lawyer Error (ID: ${lawyer.id}):`, lawyerError.message);
            continue;
        }
        lawyerCount++;

        if (reviews && reviews.length > 0) {
            const reviewsWithLawyerId = reviews.map(r => ({ 
                lawyer_id: lawyer.id,
                reviewer: r.reviewer,
                stars: r.stars,
                date: r.date,
                text: r.text
            }));
            const { error: reviewError } = await supabase.from('lawyer_reviews').insert(reviewsWithLawyerId);
            if (reviewError) {
                console.error(`❌ Review Error for Lawyer ${lawyer.id}:`, reviewError.message);
            } else {
                reviewCount += reviews.length;
            }
        }
    }
    console.log(`✅ Migrated ${lawyerCount} lawyers and ${reviewCount} reviews.`);

    console.log('🎉 Migration completed!');
}

migrate().catch(err => {
    console.error('💥 Fatal Migration Error:', err);
});
