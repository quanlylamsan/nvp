import React, { useState } from 'react';
import axios from 'axios';

function KhaiBaoCoSoPage() {
  const [form, setForm] = useState({
    tenCoSo: '',
    tinh: '',
    huyen: '',
    xa: '',
    soNha: '',
    soDienThoai: '',
    viDo: '',
    kinhDo: '',
    mucDichNuoi: '',
    hinhThucNuoi: '',
    giayPhepKinhDoanh: '',
    trangThai: '',
    dienTich: '',
    chuTrai: '',
    ngayBatDau: '',
    daiDien: '',
    email: '',
    soCCCD: '',
    ngayCapCCCD: '',
    noiCapCCCD: '',
    diaChiLienHe: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:10000/api/farms', form);
      alert('✅ Khai báo thành công');
    } catch (err) {
      alert('❌ Lỗi khi gửi dữ liệu');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>📄 Khai báo cơ sở nuôi</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <fieldset style={{ border: '1px solid #ccc', padding: 16 }}>
          <legend><b>1. Thông tin chính của cơ sở nuôi</b></legend>
          <div className="grid-2">
            <input name="tenCoSo" placeholder="Tên cơ sở nuôi *" onChange={handleChange} required />
            <input name="tinh" placeholder="Tỉnh/Thành phố *" onChange={handleChange} required />
            <input name="huyen" placeholder="Quận/Huyện *" onChange={handleChange} required />
            <input name="xa" placeholder="Phường/Xã *" onChange={handleChange} required />
            <input name="soNha" placeholder="Số nhà" onChange={handleChange} />
            <input name="soDienThoai" placeholder="Số điện thoại cơ sở" onChange={handleChange} />
            <input name="viDo" placeholder="Vĩ độ (hệ thập phân)" onChange={handleChange} />
            <input name="kinhDo" placeholder="Kinh độ (hệ thập phân)" onChange={handleChange} />
            <input name="mucDichNuoi" placeholder="Mục đích nuôi" onChange={handleChange} />
            <input name="hinhThucNuoi" placeholder="Hình thức nuôi" onChange={handleChange} />
            <input name="giayPhepKinhDoanh" placeholder="Giấy phép kinh doanh (nếu có)" onChange={handleChange} />
            <input name="trangThai" placeholder="Trạng thái hoạt động" onChange={handleChange} />
            <input name="dienTich" placeholder="Diện tích chuồng trại (m²)" onChange={handleChange} />
            <input name="chuTrai" placeholder="Chủ trại (nếu khác người đại diện)" onChange={handleChange} />
            <input name="ngayBatDau" placeholder="Ngày bắt đầu nuôi" type="date" onChange={handleChange} />
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #ccc', padding: 16 }}>
          <legend><b>2. Người đại diện</b></legend>
          <div className="grid-2">
            <input name="daiDien" placeholder="Họ và tên người đại diện *" onChange={handleChange} required />
            <input name="email" placeholder="Email" type="email" onChange={handleChange} />
            <input name="soCCCD" placeholder="Số CCCD/CMND" onChange={handleChange} />
            <input name="ngayCapCCCD" placeholder="Ngày cấp CCCD" type="date" onChange={handleChange} />
            <input name="noiCapCCCD" placeholder="Nơi cấp CCCD" onChange={handleChange} />
            <input name="diaChiLienHe" placeholder="Địa chỉ liên hệ (nếu khác cơ sở)" onChange={handleChange} />
          </div>
        </fieldset>

        <button type="submit" style={{ padding: '10px 20px' }}>💾 Lưu thông tin</button>
      </form>

      <style>{`
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }

        input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        button {
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        button:hover {
          background-color: #1b5e20;
        }
      `}</style>
    </div>
  );
}

export default KhaiBaoCoSoPage;
