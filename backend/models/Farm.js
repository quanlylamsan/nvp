const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  tenCoSo: String,
  tinh: String,
  huyen: String,
  xa: String,
  soDienThoai: String,
  viDo: String,
  kinhDo: String,
  mucDichNuoi: String,
  hinhThucNuoi: String,
  giayPhepKinhDoanh: String,
  Tên chủ cơ sở: String,
  daiDien: String,
  email: String,
  soCCCD: String,
  trangThai: String,
  dienTich: String,
  diaChiLienHe: String
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);
