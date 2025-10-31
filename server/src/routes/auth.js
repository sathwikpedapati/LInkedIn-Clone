import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/signup', upload.single('profilePic'), async (req, res) => {
  try {
    const { username, email, password, profilePic } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    let profilePicUrl = profilePic;
    if (req.file && req.file.path) {
      profilePicUrl = req.file.path;
      if (!/^https?:\/\//i.test(profilePicUrl)) {
        const base = `${req.protocol}://${req.get('host')}`;
        const normalized = profilePicUrl.replace(/\\\\/g, '/');
        profilePicUrl = `${base}/${normalized}`;
      }
    }
    const user = await User.create({ username, email, passwordHash, profilePic: profilePicUrl });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('username email profilePic createdAt updatedAt');
  if (!user) return res.status(404).json({ message: 'Not found' });
  return res.json(user);
});

router.put('/me', requireAuth, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Not found' });
    const { username, email } = req.body;
    if (username !== undefined) user.username = username;
    if (email !== undefined && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists && String(exists._id) !== String(user._id)) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    if (req.file && req.file.path) {
      let profilePicUrl = req.file.path;
      if (!/^https?:\/\//i.test(profilePicUrl)) {
        const base = `${req.protocol}://${req.get('host')}`;
        const normalized = profilePicUrl.replace(/\\\\/g, '/');
        profilePicUrl = `${base}/${normalized}`;
      }
      user.profilePic = profilePicUrl;
    }
    await user.save();
    return res.json({ id: user._id, username: user.username, email: user.email, profilePic: user.profilePic });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
