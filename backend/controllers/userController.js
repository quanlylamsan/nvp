const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed, role });
  await user.save();
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const { name, email, role } = req.body;
  await User.findByIdAndUpdate(req.params.id, { name, email, role });
  res.json({ message: 'Cập nhật thành công' });
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xóa' });
};
