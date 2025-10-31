import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();


router.get('/', async (_req, res) => {
  const posts = await Post.find().populate('createdBy', 'username profilePic').sort({ createdAt: -1 });
  return res.json(posts);
});

router.post('/', requireAuth, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;
    let imageUrl = coverImage;
    if (req.file && req.file.path) {
      imageUrl = req.file.path;
      if (!/^https?:\/\//i.test(imageUrl)) {
        const base = `${req.protocol}://${req.get('host')}`;
        const normalized = imageUrl.replace(/\\\\/g, '/');
        imageUrl = `${base}/${normalized}`;
      }
    }

    const post = await Post.create({
      title,
      description,
      coverImage: imageUrl,
      createdBy: req.userId,
    });
    const populated = await post.populate('createdBy', 'username profilePic');
    return res.status(201).json(populated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to create post' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (String(post.createdBy) !== req.userId) return res.status(403).json({ message: 'Forbidden' });

    const { title, description, coverImage } = req.body;
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (coverImage !== undefined) post.coverImage = coverImage;
    await post.save();
    const populated = await post.populate('createdBy', 'username profilePic');
    return res.json(populated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to update post' });
  }
});


router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (String(post.createdBy) !== req.userId) return res.status(403).json({ message: 'Forbidden' });
    await post.deleteOne();
    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to delete post' });
  }
});


router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    const idx = post.likes.findIndex((u) => String(u) === req.userId);
    if (idx >= 0) post.likes.splice(idx, 1); else post.likes.push(req.userId);
    await post.save();
    const populated = await post.populate('createdBy', 'username profilePic');
    return res.json(populated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to toggle like' });
  }
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    const comment = await Comment.create({ post: post._id, user: req.userId, text });
    const populated = await comment.populate('user', 'username profilePic');
    return res.status(201).json(populated);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to add comment' });
  }
});


router.get('/:id/comments', async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .populate('user', 'username profilePic')
    .sort({ createdAt: -1 });
  return res.json(comments);
});

export default router;
