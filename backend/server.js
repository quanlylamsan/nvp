const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const farmRoutes = require('./routes/farms');
const authRoutes = require('./routes/auth');


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/farms', farmRoutes);
app.use('/api/auth', authRoutes);


mongoose.connect('mongodb://localhost:27017/wildlife')
  .then(() => {
    console.log('✅ Kết nối MongoDB thành công');
    app.listen(5000, () => console.log('🚀 Server chạy tại http://localhost:5000'));
  })
  .catch((err) => console.error('❌ Lỗi MongoDB:', err));
