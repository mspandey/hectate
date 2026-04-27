const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/postController');
const auth    = require('../middleware/auth');

// ─── Public ───────────────────────────────────────────────────────────────────
// GET /api/posts — open, but will enrich with userLiked/userSaved if authed
router.get('/', (req, res, next) => {
  // Run auth middleware optionally (don't fail if no cookie)
  auth(req, res, (err) => {
    if (err) req.user = null; // not logged in — that's fine
    next();
  });
}, ctrl.getPosts);

// ─── Protected ───────────────────────────────────────────────────────────────
router.get('/saved',       auth, ctrl.getSavedPosts);
router.post('/',           auth, ctrl.createPost);
router.post('/:id/like',   auth, ctrl.likePost);
router.post('/:id/save',   auth, ctrl.savePost);
router.post('/:id/comment',auth, ctrl.commentPost);
router.post('/comment/:commentId/support', auth, ctrl.supportComment);
router.post('/:id/report', auth, ctrl.reportPost);

module.exports = router;
