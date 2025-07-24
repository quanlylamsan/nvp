const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Sai mật khẩu' });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    'secret',
    { expiresIn: '1d' }
  );
  res.json({ token });
};
