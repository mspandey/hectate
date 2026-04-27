/**
 * postController.js — Hectate Community Feed
 * All actions are persisted in SQLite via the Prisma-compatible db layer.
 */

const prisma = require('../db');
const { v4: uuidv4 } = require('uuid');

// ─── helpers ────────────────────────────────────────────────────────────────

function safeParseReplies(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return ts;
  }
}

function mapPost(p, comments = [], userId = null, likedIds = new Set(), savedIds = new Set(), supportedCommentIds = new Set(), authorMap = new Map()) {
  const replies = comments.map(r => ({
    ...r,
    user_id:       r.userId,
    user_name:     r.userName,
    userSupported: supportedCommentIds.has(r.id),
    supports:      r.supports || 0,
    time:          r.time || formatTimestamp(r.createdAt)
  }));

  const author = authorMap.get(p.authorId) || {};
  const authorName = author.name || p.authorName || 'Anonymous';
  const authorHandle = author.alias ? `@${author.alias}` : (p.authorHandle || '@member');
  const authorAvatar = author.avatarUrl || null;

  return {
    id:            p.id,
    authorId:      p.authorId,
    authorName:    authorName,
    authorHandle:  authorHandle,
    authorAvatar:  authorAvatar,
    author_name:   authorName,
    author_handle: authorHandle,
    content:       p.content,
    category:      p.category     || 'Sharing',
    tags:          p.tags         || '',
    timestamp:     p.timestamp    || p.createdAt,
    likes:         p.likes        || 0,
    replyCount:    p.replyCount   || 0,
    replies,                            // parsed array — used by frontend
    userLiked:     userId ? likedIds.has(p.id)  : false,
    userSaved:     userId ? savedIds.has(p.id)  : false,
    sentimentLabel: p.sentimentLabel,
    sentimentScore: p.sentimentScore,
    isFlagged:      Boolean(p.isFlagged),
  };
}

const { containsHarmfulContent } = require('../utils/moderation');

// ─── GET /api/posts ──────────────────────────────────────────────────────────

exports.getPosts = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { sort } = req.query;

    let posts = await prisma.communityPost.findMany({
      orderBy: { timestamp: 'desc' }
    });

    const postIds = posts.map(p => p.id);
    const allComments = await prisma.comment.findMany({
      where: { postId: { in: postIds } }
    });

    let likedIds = new Set();
    let savedIds = new Set();
    let supportedCommentIds = new Set();

    if (userId) {
      const likes = await prisma.postLike.findMany({ where: { userId } });
      const saves = await prisma.savedPost.findMany({ where: { userId } });
      const commentLikes = await prisma.commentLike.findMany({ where: { userId } });
      
      likedIds = new Set(likes.map(l => l.postId));
      savedIds = new Set(saves.map(s => s.postId));
      supportedCommentIds = new Set(commentLikes.map(l => l.commentId));
    }

    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, alias: true, avatarUrl: true }
    });
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    let mapped = posts.map(p => {
      const postComments = allComments.filter(c => c.postId === p.id);
      return mapPost(p, postComments, userId, likedIds, savedIds, supportedCommentIds, userMap);
    });

    // Handle trending sort: likes desc, comments desc, created_at desc
    if (sort === 'trending') {
      mapped.sort((a, b) => {
        if ((b.likes || 0) !== (a.likes || 0)) return (b.likes || 0) - (a.likes || 0);
        if ((b.replyCount || 0) !== (a.replyCount || 0)) return (b.replyCount || 0) - (a.replyCount || 0);
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    }

    res.json({ success: true, posts: mapped });
  } catch (err) {
    console.error('[getPosts] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
};

// ─── POST /api/posts ─────────────────────────────────────────────────────────

exports.createPost = async (req, res) => {
  try {
    const { content, category, tags } = req.body;
    const user = req.user;

    console.log('[createPost] user:', user?.id, '| content:', content?.substring(0, 40));

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const displayName   = user.displayMode === 'anonymous' ? 'Anonymous' : (user.name   || 'Member');
    const displayHandle = user.displayMode === 'anonymous' ? '@anonymous' : `@${user.alias || 'member'}`;

    let sentimentLabel = null;
    let sentimentScore = 0;
    let isFlagged = 0;

    // 1. Basic Content Moderation (Auto Detection)
    if (containsHarmfulContent(content)) {
      console.log('[createPost] Harmful content detected via keyword filter');
      isFlagged = 1;
      sentimentLabel = 'Negative';
      sentimentScore = 0.99;
    }

    // 2. NLP Sentiment Analysis (if not already flagged)
    if (!isFlagged) {
      try {
        const axios = require('axios');
        const sentimentRes = await axios.post('http://localhost:5001/analyze-sentiment', { 
          text: content.trim() 
        }, { timeout: 2000 });
        
        if (sentimentRes.data && !sentimentRes.data.error) {
          sentimentLabel = sentimentRes.data.label;
          sentimentScore = sentimentRes.data.score;
          if (sentimentRes.data.toxic) isFlagged = 1;
        }
      } catch (e) {
        console.warn('[createPost] Sentiment analysis failed or timed out:', e.message);
      }
    }

    const newPost = await prisma.communityPost.create({
      data: {
        id:            `P_${Date.now()}`,
        authorId:      user.id,
        authorName:    displayName,
        authorHandle:  displayHandle,
        content:       content.trim(),
        category:      category || 'Sharing',
        tags:          Array.isArray(tags) ? tags.join(',') : (tags || ''),
        likes:         0,
        reposts:       0,
        replyCount:    0,
        repliesJson:   JSON.stringify([]),
        sentimentLabel: sentimentLabel,
        sentimentScore: sentimentScore,
        isFlagged:      isFlagged,
        timestamp:     new Date().toISOString()
      }
    });

    console.log('[createPost] Post saved:', newPost.id, '| isFlagged:', isFlagged);
    res.json({ success: true, post: mapPost(newPost, [], user.id) });
  } catch (err) {
    console.error('[createPost] Error:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message || 'Failed to create post' });
  }
};

// ─── POST /api/posts/:id/like  (toggle) ──────────────────────────────────────

exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Check if this user already liked
    const existing = await prisma.postLike.findFirst({ where: { userId: user.id, postId: id } });

    let liked;
    let updatedPost;

    if (existing) {
      // Unlike
      await prisma.postLike.delete({ where: { id: existing.id } });
      updatedPost = await prisma.communityPost.update({
        where: { id },
        data:  { likes: { increment: -1 } }
      });
      liked = false;
    } else {
      // Like
      await prisma.postLike.create({
        data: { id: uuidv4(), userId: user.id, postId: id }
      });
      updatedPost = await prisma.communityPost.update({
        where: { id },
        data:  { likes: { increment: 1 } }
      });
      liked = true;
    }

    res.json({ success: true, likes: updatedPost.likes, liked });
  } catch (err) {
    console.error('[likePost] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update like' });
  }
};

// ─── POST /api/posts/:id/comment ─────────────────────────────────────────────

exports.commentPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const displayName = user.displayMode === 'anonymous' ? 'Anonymous' : (user.name || 'Member');
    const now = new Date().toISOString();

    const newReply = await prisma.comment.create({
      data: {
        id:         uuidv4(),
        postId:     id,
        userId:     user.id,
        userName:   displayName,
        content:    content.trim(),
        supports:   0,
        createdAt:  now
      }
    });

    const updatedPost = await prisma.communityPost.update({
      where: { id },
      data:  {
        replyCount:  { increment: 1 }
      }
    });

    console.log('[commentPost] Comment added to post:', id, '| total:', updatedPost.replyCount);
    res.json({ success: true, reply: { ...newReply, user_id: newReply.userId, user_name: newReply.userName, time: formatTimestamp(newReply.createdAt) }, replyCount: updatedPost.replyCount });
  } catch (err) {
    console.error('[commentPost] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
};

// ─── POST /api/posts/:id/save  (toggle) ──────────────────────────────────────

exports.savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existing = await prisma.savedPost.findFirst({ where: { userId: user.id, postId: id } });

    let saved;
    if (existing) {
      await prisma.savedPost.delete({ where: { id: existing.id } });
      saved = false;
    } else {
      await prisma.savedPost.create({
        data: { id: uuidv4(), userId: user.id, postId: id }
      });
      saved = true;
    }

    res.json({ success: true, saved });
  } catch (err) {
    console.error('[savePost] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save post' });
  }
};

// ─── GET /api/posts/saved ─────────────────────────────────────────────────────

exports.getSavedPosts = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const saves = await prisma.savedPost.findMany({ where: { userId: user.id } });
    const savedPostIds = saves.map(s => s.postId);

    // Fetch each saved post
    const posts = [];
    for (const pid of savedPostIds) {
      const p = await prisma.communityPost.findUnique({ where: { id: pid } });
      if (p) posts.push(p);
    }

    // Sort newest save first (saves are returned in insertion order)
    posts.reverse();

    const likedSet = new Set(
      (await prisma.postLike.findMany({ where: { userId: user.id } })).map(l => l.postId)
    );
    const savedSet = new Set(savedPostIds);
    const supportedCommentIds = new Set(
      (await prisma.commentLike.findMany({ where: { userId: user.id } })).map(l => l.commentId)
    );

    const allComments = await prisma.comment.findMany({
      where: { postId: { in: savedPostIds } }
    });

    res.json({ success: true, posts: posts.map(p => {
      const postComments = allComments.filter(c => c.postId === p.id);
      return mapPost(p, postComments, user.id, likedSet, savedSet, supportedCommentIds);
    }) });
  } catch (err) {
    console.error('[getSavedPosts] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch saved posts' });
  }
};
// ─── POST /api/posts/comment/:commentId/support (toggle) ───────────────────

exports.supportComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    // Check if this user already supported
    const existing = await prisma.commentLike.findFirst({
      where: { userId: user.id, commentId }
    });

    let supported;
    let updatedComment;

    if (existing) {
      // Un-support
      await prisma.commentLike.delete({ where: { id: existing.id } });
      updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { supports: { increment: -1 } }
      });
      supported = false;
    } else {
      // Support
      await prisma.commentLike.create({
        data: { id: uuidv4(), userId: user.id, commentId }
      });
      updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { supports: { increment: 1 } }
      });
      supported = true;
    }

    res.json({
      success: true,
      supports: updatedComment.supports,
      supported
    });
  } catch (err) {
    console.error('[supportComment] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update support' });
  }
};

// ─── POST /api/posts/:id/report ──────────────────────────────────────────────

exports.reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Check for duplicate report
    const existing = await prisma.report.findFirst({
      where: { postId: id, reportedBy: user.id }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reported this post' });
    }

    // Save report
    await prisma.report.create({
      data: {
        id:         uuidv4(),
        postId:     id,
        reportedBy: user.id,
        reason:     reason || 'Other',
        createdAt:  new Date().toISOString()
      }
    });

    // Auto-flag post if reported (optional but requested to show warning)
    await prisma.communityPost.update({
      where: { id },
      data: { isFlagged: 1 }
    });

    res.json({ success: true, message: 'Post reported successfully' });
  } catch (err) {
    console.error('[reportPost] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to report post' });
  }
};
