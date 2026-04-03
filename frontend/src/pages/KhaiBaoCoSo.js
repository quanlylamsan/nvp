// src/pages/KhaiBaoCoSo.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';
import './KhaiBaoCoSo.css';
import woodSpeciesOptions from '../data/woodSpeciesData';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// --- Helper components (kept inline) ---
const ThongTinKinhDoanhGo = ({ formData, handleChange }) => (
  <div className="grid-form-fields-Go">
    <div className="form-group">
      <label>Ngành nghề:</label>
      <select name="nganhNgheKinhDoanhGo" value={formData.nganhNgheKinhDoanhGo} onChange={handleChange}>
        <option value="" disabled>=> Chọn ngành nghề</option>
        <option value="Thương mại">Thương mại</option>
        <option value="Cưa gia công và mộc">Cưa gia công và mộc</option>
        <option value="Chế biến mộc và thương mại">Chế biến mộc và thương mại</option>
      </select>
    </div>

    <div className="form-group">
      <label>Kinh doanh:</label>
      <select name="loaiHinhKinhDoanhGo" value={formData.loaiHinhKinhDoanhGo} onChange={handleChange}>
        <option value="" disabled>=> Chọn loại hình kinh doanh</option>
        <option value="Trại cưa">Trại cưa</option>
        <option value="Trại mộc">Trại mộc</option>
        <option value="Trang trí nội thất">Trang trí nội thất</option>
      </select>
    </div>

    <div className="form-group">
      <label>Chế biến:</label>
      <select name="loaiHinhCheBienGo" value={formData.loaiHinhCheBienGo} onChange={handleChange}>
        <option value="" disabled>=> Chọn loại hình chế biến</option>
        <option value="Tròn">Tròn</option>
        <option value="Xẻ">Xẻ</option>
        <option value="Thành phẩm">Thành phẩm</option>
      </select>
    </div>

    <div className="form-group">
      <label>Nguồn gốc gỗ:</label>
      <select name="nguonGocGo" value={formData.nguonGocGo} onChange={handleChange}>
        <option value="" disabled>=> Chọn nguồn gốc</option>
        <option value="Nhập khẩu">Nhập khẩu</option>
        <option value="Vườn">Vườn</option>
        <option value="Khác">Khác</option>
      </select>
    </div>

    <div className="form-group">
  <label>Tên lâm sản:</label>
  <select
    name="tenLamSan"
    value={formData.tenLamSan}
    onChange={handleChange}
  >
    <option value="">=> Chọn loài gỗ</option>
    {woodSpeciesOptions.map((item, index) => (
      <option key={index} value={item.name}>
        {item.name}
      </option>
    ))}
  </select>
</div>

<div className="form-group">
  <label>Tên khoa học:</label>
  <input
    type="text"
    name="tenKhoaHoc"
    value={formData.tenKhoaHoc}
    readOnly
  />
</div>
    <div className="form-group"><label>Khối lượng (m³):</label><input type="number" name="khoiLuong" value={formData.khoiLuong} onChange={handleChange} step="any" /></div>
    <div className="form-group">
      <label>Trạng thái:</label>
      <select name="trangThai" value={formData.trangThai} onChange={handleChange}>
        <option value="Đang hoạt động">Đang hoạt động</option>
        <option value="Tạm ngưng">Tạm ngưng</option>
      </select>
    </div>
  </div>
);

// --- Main component ---
const initialFormData = {
  tenCoSo: '', province: '', commune: '', diaChiCoSo: '', vido: '', kinhdo: '',
  ngayThanhLap: '', giayPhepKinhDoanh: '',
  tenNguoiDaiDien: '', namSinh: '', soCCCD: '', ngayCapCCCD: '', noiCapCCCD: '',
  soDienThoaiNguoiDaiDien: '', diaChiNguoiDaiDien: '', emailNguoiDaiDien: '',
  loaiHinhKinhDoanhGo: '', nganhNgheKinhDoanhGo: '', khoiLuong: '',
  loaiHinhCheBienGo: '', nguonGocGo: '',
  loaiCoSoDangKy: 'Đăng ký cơ sở kinh doanh, chế biến gỗ',
  tenLamSan: '', tenKhoaHoc: '',
  issueDate: '', expiryDate: '',
  trangThai: 'Đang hoạt động'
};

function KhaiBaoCoSoPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [provinces, setProvinces] = useState([]);
  const [communesList, setCommunesList] = useState([]);
  const [user, setUser] = useState(null);
  const [isDiaChiKhac, setIsDiaChiKhac] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [loadingState, setLoadingState] = useState({ submit: false, location: false, upload: false });
  const [activeSection, setActiveSection] = useState('thongTinCoSo');

  const toggleSection = (sectionName) => {
    setActiveSection(prev => prev === sectionName ? null : sectionName);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken.role === 'admin');
        const fetchUser = async () => {
          try {
            const res = await axios.get(`${API_BASE_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            setUser(res.data);
          } catch (err) {
            toast.error('Không thể tải thông tin người dùng.');
            localStorage.clear();
            navigate('/login');
          }
        };
        fetchUser();
      } catch (err) {
        localStorage.clear();
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/master-product-list/provinces`, { headers: { Authorization: `Bearer ${token}` } });
        setProvinces(res.data);
      } catch (err) {
        toast.error("Không thể tải danh sách Tỉnh/Thành phố.");
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (!formData.province || !user) {
      setCommunesList([]);
      return;
    }
    const fetchCommunes = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/master-product-list/communes?provinceCode=${formData.province}`, { headers: { Authorization: `Bearer ${token}` } });
        const filtered = user.role === 'admin' ? res.data : res.data.filter(c => user.communes?.includes(c.name));
        setCommunesList(filtered);
      } catch (err) {
        setCommunesList([]);
      }
    };
    fetchCommunes();
  }, [formData.province, user]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "tenLamSan") {
    const selected = woodSpeciesOptions.find(s => s.name === value);

    setFormData(prev => ({
      ...prev,
      tenLamSan: value,
      tenKhoaHoc: selected?.scientificName || ""
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

  const handleDiaChiKhacChange = (e) => {
    setIsDiaChiKhac(e.target.checked);
    if (!e.target.checked) {
      setFormData(prev => ({ ...prev, diaChiNguoiDaiDien: '' }));
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ lấy vị trí');
      return;
    }
    setLoadingState(prev => ({ ...prev, location: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, vido: latitude.toFixed(6), kinhdo: longitude.toFixed(6) }));
        setLoadingState(prev => ({ ...prev, location: false }));
        toast.success('Đã lấy vị trí thành công!');
      },
      () => {
        setLoadingState(prev => ({ ...prev, location: false }));
        toast.error('Lỗi lấy vị trí.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckOnGoogleMaps = () => {
    if (!formData.vido || !formData.kinhdo) {
      toast.error('Vui lòng nhập tọa độ');
      return;
    }
    const url = `https://www.google.com/maps?q=${formData.vido},${formData.kinhdo}`;
    window.open(url, '_blank')?.focus();
  };

  const resetForm = useCallback(() => {
    confirmAlert({
      title: '↩️ Xác nhận đặt lại',
      message: 'Bạn có chắc muốn xóa hết thông tin đã nhập?',
      buttons: [
        {
          label: '✅ Đồng ý',
          onClick: () => {
            setFormData(initialFormData);
            setIsDiaChiKhac(false);
            setActiveSection('thongTinCoSo');
            toast.info('Biểu mẫu đã được đặt lại.');
          }
        },
        { label: '❌ Hủy bỏ' }
      ]
    });
  }, []);

  const validateForm = () => {
    const requiredFields = {
      tenCoSo: 'Tên cơ sở', 
      province: 'Tỉnh/Thành phố',
      commune: 'Xã/Phường',
      diaChiCoSo: 'Địa chỉ cơ sở', 
      vido: "Vĩ độ", 
      kinhdo: "Kinh độ",
      tenNguoiDaiDien: 'Họ và Tên người đại diện', 
      namSinh: "Năm sinh", 
      soCCCD: 'Số CCCD/Hộ chiếu', 
      ngayCapCCCD: "Ngày cấp CCCD", 
      noiCapCCCD: "Nơi cấp CCCD", 
      soDienThoaiNguoiDaiDien: "Số điện thoại",
      nganhNgheKinhDoanhGo: 'Ngành nghề',
      loaiHinhKinhDoanhGo: 'Loại hình kinh doanh',
      tenLamSan: 'Tên lâm sản'
    };

    for (const field in requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        toast.error(`Vui lòng nhập/chọn ${requiredFields[field]}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoadingState(prev => ({ ...prev, submit: true }));
    const token = localStorage.getItem('token');

    try {
      const submissionData = { ...formData };
      const selectedProvince = provinces.find(p => p.code === formData.province);
      const selectedCommune = communesList.find(c => c.code === formData.commune);

      submissionData.provinceName = selectedProvince?.name || '';
      submissionData.communeName = selectedCommune?.name || '';

      submissionData.woodProducts = [{
        tenLamSan: formData.tenLamSan?.trim(),
        tenKhoaHoc: formData.tenKhoaHoc?.trim(),
        khoiLuong: Number(formData.khoiLuong || 0),
        loaiHinhCheBienGo: formData.loaiHinhCheBienGo,
        nguonGocGo: formData.nguonGocGo,
      }];
      
      submissionData.animalProducts = [];

      await axios.post(`${API_BASE_URL}/api/farms`, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Đăng ký cơ sở thành công!');
      setFormData(initialFormData);
      setIsDiaChiKhac(false);
      setActiveSection('thongTinCoSo');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại.');
    } finally {
      setLoadingState(prev => ({ ...prev, submit: false }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const mappedData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(mappedData);
      toast.success(`Đã đọc ${mappedData.length} dòng.`);
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
    if (excelData.length === 0) return;
    setLoadingState(prev => ({ ...prev, upload: true }));
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_BASE_URL}/api/farms/bulk`, excelData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tải lên hàng loạt thành công!');
      setExcelData([]);
      setCsvFile(null);
    } catch (err) {
      toast.error('Tải lên thất bại.');
    } finally {
      setLoadingState(prev => ({ ...prev, upload: false }));
    }
  };

  const resetCsvUpload = () => {
    setCsvFile(null);
    setExcelData([]);
  };

  return (
    <div className="form-page-container">
      <h1>Khai báo thông tin cơ sở: Thực vật rừng🌿</h1>

      <form onSubmit={handleSubmit} className="khai-bao-form" noValidate>
        
        {/* 1. THÔNG TIN CƠ SỞ */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('thongTinCoSo')} className="section-title-clickable">1. 🏡 Thông tin cơ sở: {activeSection === 'thongTinCoSo' ? '▲' : '▼'}</h3>
          {activeSection === 'thongTinCoSo' && (
            <div className="grid-form-fields-CSo">
              <div className="form-group"><label>Tên cơ sở:</label><input type="text" name="tenCoSo" value={formData.tenCoSo} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Tỉnh (Thành phố):</label>
                <select name="province" value={formData.province} onChange={handleChange}>
                  <option value="">=> Chọn Tỉnh/Thành phố</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Xã (Phường):</label>
                <select name="commune" value={formData.commune} onChange={handleChange} disabled={!formData.province}>
                  <option value="">=> Chọn Xã/Phường</option>
                  {communesList.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Địa chỉ cơ sở:</label><input type="text" name="diaChiCoSo" value={formData.diaChiCoSo} onChange={handleChange} /></div>
              <div className="form-group"><label>Vĩ độ:</label><input type="text" name="vido" value={formData.vido} onChange={handleChange} /></div>
              <div className="form-group"><label>Kinh độ:</label><input type="text" name="kinhdo" value={formData.kinhdo} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Lấy vị trí / Bản đồ:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <button type="button" onClick={handleGetCurrentLocation} className="button-location">📍 {loadingState.location ? 'Đang lấy...' : 'Lấy tọa độ'}</button>
                   <button type="button" onClick={handleCheckOnGoogleMaps} className="button-check-map">🌍 Xem Maps</button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. NGƯỜI ĐẠI DIỆN */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('nguoiDaiDien')} className="section-title-clickable">2. 🧑‍🌾 Thông tin người đại diện: {activeSection === 'nguoiDaiDien' ? '▲' : '▼'}</h3>
          {activeSection === 'nguoiDaiDien' && (
            <div className="grid-form-fields-Chu">
              <div className="form-group"><label>Họ và Tên:</label><input type="text" name="tenNguoiDaiDien" value={formData.tenNguoiDaiDien} onChange={handleChange} /></div>
              <div className="form-group"><label>Năm sinh:</label><input type="date" name="namSinh" value={formData.namSinh} onChange={handleChange} /></div>
              <div className="form-group"><label>Số CCCD/Hộ chiếu:</label><input type="text" name="soCCCD" value={formData.soCCCD} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày cấp CCCD:</label><input type="date" name="ngayCapCCCD" value={formData.ngayCapCCCD} onChange={handleChange} /></div>
              <div className="form-group"><label>Nơi cấp CCCD:</label><input type="text" name="noiCapCCCD" value={formData.noiCapCCCD} onChange={handleChange} /></div>
              <div className="form-group"><label>Số điện thoại:</label><input type="text" name="soDienThoaiNguoiDaiDien" value={formData.soDienThoaiNguoiDaiDien} onChange={handleChange} /></div>
              <div className="form-group full-width"><label className="checkbox-label"><input type="checkbox" checked={isDiaChiKhac} onChange={handleDiaChiKhacChange} /> Click nhập địa chỉ người đại diện (nếu khác với cơ sở)</label></div>
              {isDiaChiKhac && (<div className="form-group full-width"><label>Địa chỉ người đại diện:</label><input type="text" name="diaChiNguoiDaiDien" value={formData.diaChiNguoiDaiDien} onChange={handleChange} /></div>)}
            </div>
          )}
        </section>

        {/* 3. THÔNG TIN KINH DOANH GỖ */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('chiTietGo')} className="section-title-clickable">3. 🪵 Chi tiết về sản xuất, kinh doanh: {activeSection === 'chiTietGo' ? '▲' : '▼'}</h3>
          {activeSection === 'chiTietGo' && <ThongTinKinhDoanhGo formData={formData} handleChange={handleChange} />}
        </section>

        {/* 4. GIẤY PHÉP */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('giayPhep')} className="section-title-clickable">4. 📜 Thông tin giấy phép và các loại khác: {activeSection === 'giayPhep' ? '▲' : '▼'}</h3>
          {activeSection === 'giayPhep' && (
            <div className="grid-form-fields-GPhep">
              <div className="form-group"><label>Số GPKD:</label><input type="text" name="giayPhepKinhDoanh" value={formData.giayPhepKinhDoanh} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày cấp:</label><input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày hết hạn:</label><input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} /></div>
            </div>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="option-button action-primary" disabled={loadingState.submit}>
            {loadingState.submit ? 'Đang gửi...' : '💾 Đăng ký cơ sở ✔️'}
          </button>
          <button type="button" onClick={resetForm} className="option-button action-secondary">🔄 Đặt lại thông tin 🧹</button>
        </div>
      </form>

      {isAdmin && (
        <section className="khai-bao-section excel-upload-section">
          <h3 onClick={() => toggleSection('upload')} className="section-title-clickable">📤 Tải lên hàng loạt {activeSection === 'upload' ? '▲' : '▼'}</h3>
          {activeSection === 'upload' && (
            <div className="file-upload-group">
              <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} id="csvUpload" />
              {excelData.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <button onClick={handleBulkSubmit} className="action-primary">Bắt đầu tải lên {excelData.length} dòng</button>
                  <button onClick={resetCsvUpload} className="action-secondary">Hủy</button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default KhaiBaoCoSoPage;