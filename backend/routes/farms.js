const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm'); // Import Farm Model
const authMiddleware = require('../middleware/authMiddleware'); // Middleware xác thực

// ➕ Tạo cơ sở gây nuôi mới (chỉ admin có thể tạo)
router.post('/', authMiddleware, async (req, res) => {
  // Kiểm tra vai trò của người dùng nếu cần (chỉ admin mới được tạo)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
  }

  try {
    const newFarm = new Farm(req.body);
    await newFarm.save();
    res.status(201).json(newFarm);
  } catch (err) {
    console.error('POST /api/farms error:', err);
    res.status(500).json({ message: 'Lỗi server khi tạo cơ sở gây nuôi', error: err.message });
  }
});

// 🔎 Lấy toàn bộ danh sách cơ sở gây nuôi (có thể cho staff và admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const farms = await Farm.find();
    res.json(farms);
  } catch (err) {
    console.error('GET /api/farms error:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách cơ sở gây nuôi', error: err.message });
  }
});

// 🔎 Lấy thông tin một cơ sở nuôi theo ID (ĐÂY LÀ ROUTE BỊ THIẾU!)
router.get('/:id', authMiddleware, async (req, res) => {
  console.log('Backend: Đã nhận yêu cầu GET farm theo ID.'); // Dòng log bạn đã thêm
  console.log('Backend: ID được nhận từ request:', req.params.id); // Dòng log bạn đã thêm
  try {
    const farm = await Farm.findById(req.params.id); // Tìm bằng _id
    console.log('Backend: Kết quả Farm.findById():', farm); // Dòng log bạn đã thêm
    if (!farm) {
      console.log('Backend: Không tìm thấy farm với ID này. Trả về 404.'); // Dòng log bạn đã thêm
      return res.status(404).json({ message: 'Farm not found' });
    }
    res.json(farm);
  } catch (err) {
    console.error('Backend: Lỗi trong route GET /api/farms/:id:', err);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'ID cơ sở nuôi không hợp lệ.' });
    }
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin cơ sở nuôi.' });
  }
});

// ✏️ Cập nhật thông tin cơ sở gây nuôi theo ID (chỉ admin)
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
  }
  try {
    const updatedFarm = await Farm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // `new: true` trả về bản ghi đã cập nhật, `runValidators: true` chạy lại các validator trong schema
    );
    if (!updatedFarm) {
      return res.status(404).json({ message: 'Không tìm thấy cơ sở gây nuôi để cập nhật' });
    }
    res.json(updatedFarm);
  } catch (err) {
    console.error('PUT /api/farms/:id error:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật cơ sở gây nuôi', error: err.message });
  }
});

// ❌ Xóa cơ sở gây nuôi (chỉ admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
  }
  try {
    const deletedFarm = await Farm.findByIdAndDelete(req.params.id);
    if (!deletedFarm) {
      return res.status(404).json({ message: 'Không tìm thấy cơ sở gây nuôi để xóa' });
    }
    res.json({ message: 'Xóa cơ sở gây nuôi thành công' });
  } catch (err) {
    console.error('DELETE /api/farms/:id error:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa cơ sở gây nuôi', error: err.message });
  }
});

module.exports = router;