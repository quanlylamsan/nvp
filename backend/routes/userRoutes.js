const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users – lấy toàn bộ danh sách người dùng
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

// POST /api/users – tạo người dùng mới
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo người dùng' });
  }
});

// PUT /api/users/:id – cập nhật thông tin người dùng
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật người dùng' });
  }
});

// DELETE /api/users/:id – xóa người dùng
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
});

module.exports = router;
