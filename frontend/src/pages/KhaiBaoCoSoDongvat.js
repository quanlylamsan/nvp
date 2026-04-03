// src/pages/KhaiBaoCoSoDongvat.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css';
import './KhaiBaoCoSo.css';
import speciesOptions from '../data/speciesData';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// --- Helper components (kept inline) ---
const ThongTinGayNuoi = ({ formData, handleChange }) => {
  const tongDan =
    Number(formData.danBoMeDuc || 0) +
    Number(formData.danBoMeCai || 0) +
    Number(formData.danHauBiDuc || 0) +
    Number(formData.danHauBiCai || 0) +
    Number(formData.duoiMotTuoi || 0) +
    Number(formData.trenMotTuoi || 0);

  return (
    <div className="grid-form-fields-DVat">
      <div className="form-group">
        <label htmlFor="mucDichNuoi">Mục đích nuôi:</label>
        <select id="mucDichNuoi" name="mucDichNuoi" value={formData.mucDichNuoi} onChange={handleChange}>
          <option value="" disabled>=> Chọn mục đích nuôi</option>
          <option value="Sinh trưởng">Sinh trưởng</option>
          <option value="Sinh sản">Sinh sản</option>
          <option value="Sinh trưởng và sinh sản">Sinh trưởng và sinh sản</option>
        </select>
      </div>

      <div className="form-group">
        <label>Hình thức nuôi:</label>
        <select name="hinhThucNuoi" value={formData.hinhThucNuoi} onChange={handleChange}>
          <option value="" disabled>=> Chọn Hình thức nuôi</option>
          <option value="Nuôi thương mại">Nuôi thương mại</option>
          <option value="Nuôi phi thương mại">Nuôi phi thương mại</option>
        </select>
      </div>

      <div className="form-group">
        <label>Mã số cơ sở gây nuôi:</label>
        <input type="text" name="maSoCoSoGayNuoi" value={formData.maSoCoSoGayNuoi} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Ngày được cấp mã số:</label>
        <input type="date" name="ngayThanhLap" value={formData.ngayThanhLap} onChange={handleChange} />
      </div>

     <div className="form-group">
  <label htmlFor="tenLamSan">Tên lâm sản (Vật nuôi):</label>
  <select
    id="tenLamSan"
    name="tenLamSan"
    value={formData.tenLamSan}
    onChange={handleChange}
  >
    <option value="" disabled>⇒ Chọn loài gây nuôi</option>
    {speciesOptions.map((s, i) => (
      <option key={i} value={s.name}>
        {s.name}
      </option>
    ))}
  </select>
</div>

<div className="form-group">
  <label htmlFor="tenKhoaHoc">Tên khoa học:</label>
  <input
    type="text"
    name="tenKhoaHoc"
    value={formData.tenKhoaHoc || ""}
    onChange={handleChange}
    readOnly={formData.tenLamSan !== "Nhập thủ công"}
  />
</div>

      <div className="form-group"><label>Đàn bố mẹ (Đực):</label><input type="number" name="danBoMeDuc" value={formData.danBoMeDuc} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label>Đàn bố mẹ (Cái):</label><input type="number" name="danBoMeCai" value={formData.danBoMeCai} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label>Đàn hậu bị (Đực):</label><input type="number" name="danHauBiDuc" value={formData.danHauBiDuc} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label>Đàn hậu bị (Cái):</label><input type="number" name="danHauBiCai" value={formData.danHauBiCai} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label>Đàn con (dưới 1 tuổi):</label><input type="number" name="duoiMotTuoi" value={formData.duoiMotTuoi} onChange={handleChange} min="0" /></div>
      <div className="form-group"><label>Đàn thương phẩm (trên 1 tuổi):</label><input type="number" name="trenMotTuoi" value={formData.trenMotTuoi} onChange={handleChange} min="0" /></div>

      <div className="form-group"><label>Tổng đàn</label><input type="number" value={tongDan} readOnly className="readonly-field" /></div>
      <div className="form-group"><label>Trạng thái:</label><select name="trangThai" value={formData.trangThai} onChange={handleChange}><option value="Đang hoạt động">Đang hoạt động</option></select></div>
    </div>
  );
};

// --- Main component ---
const initialFormData = {
  tenCoSo: '', province: '', commune: '', diaChiCoSo: '', vido: '', kinhdo: '',
  ngayThanhLap: '', giayPhepKinhDoanh: '',
  tenNguoiDaiDien: '', namSinh: '', soCCCD: '', ngayCapCCCD: '', noiCapCCCD: '',
  soDienThoaiNguoiDaiDien: '', diaChiNguoiDaiDien: '', emailNguoiDaiDien: '',
  mucDichNuoi: '', hinhThucNuoi: '', maSoCoSoGayNuoi: '',
  danBoMeDuc: '', danBoMeCai: '', danHauBiDuc: '', danHauBiCai: '',
  duoiMotTuoi: '', trenMotTuoi: '',
  loaiHinhKinhDoanhGo: '', nganhNgheKinhDoanhGo: '', khoiLuong: '',
  loaiHinhCheBienGo: '', nguonGocGo: '',
  loaiCoSoDangKy: 'Đăng ký cơ sở gây nuôi', tenLamSan: '', tenKhoaHoc: '',
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
  const [activeSection, setActiveSection] = useState('loaiCoSo');

  const tongDan =
    Number(formData.danBoMeDuc || 0) +
    Number(formData.danBoMeCai || 0) +
    Number(formData.danHauBiDuc || 0) +
    Number(formData.danHauBiCai || 0) +
    Number(formData.duoiMotTuoi || 0) +
    Number(formData.trenMotTuoi || 0);

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
        console.error("Lỗi giải mã token:", err);
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
        const filtered = user.role === 'admin' ? res.data : res.data.filter(c => user.communes.includes(c.name));
        setCommunesList(filtered);
      } catch (err) {
        setCommunesList([]);
        toast.error("Không thể tải danh sách Xã/Phường.");
      }
    };
    fetchCommunes();
  }, [formData.province, user]);

  

 const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'province') {
    setFormData(prev => ({ ...prev, province: value, commune: '' }));
  }

  else if (name === 'tenLamSan') {
    const selected = speciesOptions.find(s => s.name === value);

    setFormData(prev => ({
      ...prev,
      tenLamSan: value,
      tenKhoaHoc: selected?.scientificName || ''
    }));
  }

  else {
    setFormData(prev => ({ ...prev, [name]: value }));
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
      toast.error('Trình duyệt của bạn không hỗ trợ lấy vị trí');
      return;
    }

    setLoadingState(prev => ({ ...prev, location: true }));
    toast.info('Đang lấy vị trí của bạn...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, vido: latitude.toFixed(6), kinhdo: longitude.toFixed(6) }));
        setLoadingState(prev => ({ ...prev, location: false }));
        toast.success('Đã lấy vị trí hiện tại thành công!');
      },
      (error) => {
        setLoadingState(prev => ({ ...prev, location: false }));
        let errorText = 'Không thể lấy được vị trí. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorText += 'Bạn đã từ chối quyền truy cập vị trí.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorText += 'Thông tin vị trí không có sẵn.';
            break;
          case error.TIMEOUT:
            errorText += 'Yêu cầu lấy vị trí đã hết hạn.';
            break;
          default:
            errorText += 'Đã xảy ra lỗi không xác định.';
            break;
        }
        toast.error(errorText);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckOnGoogleMaps = () => {
    const lat = formData.vido;
    const lng = formData.kinhdo;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      toast.error('Vui lòng nhập kinh độ và vĩ độ hợp lệ trước khi kiểm tra');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
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
        {
          label: '❌ Hủy bỏ',
          onClick: () => {}
        }
      ]
    });
  }, []);

  const validateForm = () => {
    const requiredFields = {
      tenCoSo: 'Tên cơ sở', diaChiCoSo: 'Địa chỉ cơ sở', vido: "Vĩ độ", kinhdo: "Kinh độ",
      tenNguoiDaiDien: 'Họ và Tên người đại diện', namSinh: "Năm sinh", soCCCD: 'Số CCCD/Hộ chiếu', ngayCapCCCD: "Ngày cấp CCCD", noiCapCCCD: "Nơi cấp CCCD", soDienThoaiNguoiDaiDien: "Số điện thoại", 
     
    };

    if ((!formData.province || formData.province === '') && (!formData.provinceName || formData.provinceName === '')) {
      toast.error('Vui lòng chọn/chỉ định Tỉnh (Thành phố).');
      return false;
    }
    if ((!formData.commune || formData.commune === '') && (!formData.communeName || formData.communeName === '')) {
      toast.error('Vui lòng chọn/chỉ định Xã (Phường).');
      return false;
    }

    for (const field in requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === '') {
        toast.error(`Vui lòng nhập/chọn ${requiredFields[field]}.`);
        return false;
      }
    }

    if (formData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi') {
      const requiredGayNuoiFields = {
        mucDichNuoi: 'Mục đích nuôi',
        hinhThucNuoi: 'Hình thức nuôi',
        tenLamSan: 'Tên lâm sản (Vật nuôi)',
      };
      for (const field in requiredGayNuoiFields) {
        if (!formData[field] || String(formData[field]).trim() === '') {
          toast.error(`Vui lòng nhập/chọn ${requiredGayNuoiFields[field]}.`);
          return false;
        }
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
      const submissionData = { ...formData, 
	loaiCoSoDangKy: formData.loaiCoSoDangKy || 'Đăng ký cơ sở gây nuôi'};
      // Lấy tên tỉnh/xã tương ứng nếu có
      const selectedProvince = provinces.find(p => p.code === formData.province);
      const selectedCommune = communesList.find(c => c.code === formData.commune);

      // Gửi cả code & name (frontend)
      submissionData.province = formData.province || '';
      submissionData.provinceName = selectedProvince?.name || formData.provinceName || '';
      submissionData.commune = formData.commune || '';
      submissionData.communeName = selectedCommune?.name || formData.communeName || '';

      // Chuẩn bị mảng sản phẩm
      submissionData.woodProducts = [];
      submissionData.animalProducts = [];

      if (submissionData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi' && formData.tenLamSan) {
        submissionData.animalProducts.push({
          tenLamSan: formData.tenLamSan?.trim(),
          tenKhoaHoc: formData.tenKhoaHoc?.trim(),
          mucDichNuoi: formData.mucDichNuoi,
          hinhThucNuoi: formData.hinhThucNuoi,
          danBoMe: { duc: Number(formData.danBoMeDuc || 0), cai: Number(formData.danBoMeCai || 0) },
          danHauBi: { duc: Number(formData.danHauBiDuc || 0), cai: Number(formData.danHauBiCai || 0) },
          duoiMotTuoi: Number(formData.duoiMotTuoi || 0),
          trenMotTuoi: Number(formData.trenMotTuoi || 0)
        });
      }
     // Xóa các field UI-only (không cần lưu trực tiếp)
      const fieldsToDelete = [
        'danBoMeDuc', 'danBoMeCai', 'danHauBiDuc', 'danHauBiCai',
        'duoiMotTuoi', 'trenMotTuoi', 'khoiLuong', 'tenLamSan', 'tenKhoaHoc',
        'mucDichNuoi', 'hinhThucNuoi', 'loaiHinhCheBienGo', 'nguonGocGo'
      ];
      fieldsToDelete.forEach(f => delete submissionData[f]);

      console.log("Payload gửi lên backend:", submissionData);

      const res = await axios.post(`${API_BASE_URL}/api/farms`, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Đăng ký cơ sở thành công!');
      setFormData(initialFormData);
      setIsDiaChiKhac(false);
      setActiveSection('thongTinCoSo');

    } catch (err) {
      console.error("Lỗi khi đăng ký:", err.response?.data || err.message);
      const backendMsg = err.response?.data?.message;
      toast.error(backendMsg || 'Đăng ký thất bại.');
    } finally {
      setLoadingState(prev => ({ ...prev, submit: false }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    setLoadingState(prev => ({ ...prev, upload: true }));

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (jsonData.length < 2) throw new Error("File không có dữ liệu hoặc chỉ có dòng tiêu đề.");

        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        const mappedData = rows.map(row => {
          const rowData = {};
          headers.forEach((header, index) => rowData[header] = row[index]);
          return {
            tenCoSo: rowData['Tên cơ sở'] || '',
            provinceName: rowData['Tỉnh (TP)'] || '',
            communeName: rowData['Xã (Phường)'] || '',
            diaChiCoSo: rowData['Địa chỉ'] || '',
            vido: rowData['Vĩ độ'] || '',
            kinhdo: rowData['Kinh độ'] || '',
            tenNguoiDaiDien: rowData['Tên người đại diện'] || '',
            soCCCD: rowData['Số CCCD'] || '',
            
          };
        });

        setExcelData(mappedData);
        toast.success(`Đã đọc thành công ${mappedData.length} dòng dữ liệu.`);
      } catch (err) {
        console.error("Lỗi khi đọc file:", err);
        toast.error(`Lỗi khi đọc dữ liệu: ${err.message}`);
        setExcelData([]);
      } finally {
        setLoadingState(prev => ({ ...prev, upload: false }));
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
  if (excelData.length === 0) {
    toast.warn("Không có dữ liệu để tải lên.");
    return;
  }

  setLoadingState(prev => ({ ...prev, upload: true }));
  const token = localStorage.getItem('token');

  if (!token) {
    navigate('/login');
    setLoadingState(prev => ({ ...prev, upload: false }));
    return;
  }

  try {
    // ✅ ÉP bổ sung loaiCoSoDangKy cho từng dòng
    const payload = excelData.map(item => ({
      ...item,
      loaiCoSoDangKy: 'Đăng ký cơ sở gây nuôi'
    }));

    const response = await axios.post(
      `${API_BASE_URL}/api/farms/bulk`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(`Tải lên thành công ${response.data.length || payload.length} cơ sở.`);
    resetCsvUpload();

  } catch (err) {
    console.error('LỖI KHI TẢI LÊN HÀNG LOẠT:', err.response?.data || err);
    const errorMessage = err.response?.data?.message || err.message;
    toast.error(`Tải lên hàng loạt thất bại: ${errorMessage}`);
  } finally {
    setLoadingState(prev => ({ ...prev, upload: false }));
  }
};

  const resetCsvUpload = () => {
    setCsvFile(null);
    setExcelData([]);
    const fileInput = document.getElementById('csvUpload');
    if (fileInput) fileInput.value = '';
  };
  return (
    <div className="form-page-container">
      <h1>Khai báo thông tin cơ sở: Động vật rừng🐾</h1>

      <form onSubmit={handleSubmit} className="khai-bao-form" noValidate>
       {/* THÔNG TIN CƠ SỞ */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('thongTinCoSo')} className="section-title-clickable">1. 🏡 Thông tin cơ sở: {activeSection === 'thongTinCoSo' ? '▲' : '▼'}</h3>
          {activeSection === 'thongTinCoSo' && (
            <div className="grid-form-fields-CSo">
              <div className="form-group"><label>Tên cơ sở:</label><input type="text" name="tenCoSo" value={formData.tenCoSo} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Tỉnh (Thành phố):</label>
                <select name="province" className="custom-select" value={formData.province} onChange={handleChange}>
                  <option value="">=>Chọn Tỉnh/Thành phố</option>
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
              <div className="form-group"><label>Vĩ độ:</label><input type="text" name="vido" value={formData.vido} onChange={handleChange} placeholder="Ví dụ: 10.467678" /></div>
              <div className="form-group"><label>Kinh độ:</label><input type="text" name="kinhdo" value={formData.kinhdo} onChange={handleChange} placeholder="Ví dụ: 105.625345" /></div>
              <div className="form-group"><label>Lấy vị trí hiện tại:</label><button type="button" onClick={handleGetCurrentLocation} className="button-location" disabled={loadingState.location}>📍 {loadingState.location ? 'Đang lấy...' : ''}</button></div>
              <div className="form-group"><label>Kiểm tra trên Maps:</label><button type="button" onClick={handleCheckOnGoogleMaps} className="button-check-map" disabled={!formData.vido || !formData.kinhdo}>🌍</button></div>
            </div>
          )}
        </section>

        {/* NGƯỜI ĐẠI DIỆN */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('nguoiDaiDien')} className="section-title-clickable">2. 🧑‍🌾 Thông tin người đại diện: {activeSection === 'nguoiDaiDien' ? '▲' : '▼'}</h3>
          {activeSection === 'nguoiDaiDien' && (
            <div className="grid-form-fields-Chu">
              <div className="form-group"><label>Họ và Tên:</label><input type="text" name="tenNguoiDaiDien" value={formData.tenNguoiDaiDien} onChange={handleChange} /></div>
              <div className="form-group"><label>Năm sinh:</label><input type="number" name="namSinh" value={formData.namSinh} onChange={handleChange} /></div>
              <div className="form-group"><label>Số CCCD/Hộ chiếu:</label><input type="text" name="soCCCD" value={formData.soCCCD} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày cấp CCCD:</label><input type="date" name="ngayCapCCCD" value={formData.ngayCapCCCD} onChange={handleChange} /></div>
              <div className="form-group"><label>Nơi cấp CCCD:</label><input type="text" name="noiCapCCCD" value={formData.noiCapCCCD} onChange={handleChange} /></div>
              <div className="form-group"><label>Số điện thoại:</label><input type="text" name="soDienThoaiNguoiDaiDien" value={formData.soDienThoaiNguoiDaiDien} onChange={handleChange} /></div>
              <div className="form-group full-width"><label className="checkbox-label"><input type="checkbox" checked={isDiaChiKhac} onChange={handleDiaChiKhacChange} /> Click nhập địa chỉ người đại diện (nếu khác với cơ sở)</label></div>
              {isDiaChiKhac && (<div className="form-group"><label>Địa chỉ người đại diện:</label><input type="text" name="diaChiNguoiDaiDien" value={formData.diaChiNguoiDaiDien} onChange={handleChange} placeholder="Nhập địa chỉ của người đại diện..." /></div>)}
            </div>
          )}
        </section>
		   {/* 3. THÔNG TIN CƠ SỞ NUÔI */} 
		<section className="khai-bao-section">
        <h3 onClick={() => toggleSection('chiTietDVat')} className="section-title-clickable">3. 🐾 Chi tiết về gây nuôi động vật:{activeSection === 'chiTietDVat' ? '▲' : '▼'}</h3>
          {activeSection === 'chiTietDVat' && <ThongTinGayNuoi formData={formData} handleChange={handleChange} />}
        </section>

        {/* GIẤY PHÉP */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('giayPhep')} className="section-title-clickable">4. 📜 Thông tin giấy phép và các loại khác: {activeSection === 'giayPhep' ? '▲' : '▼'}</h3>
          {activeSection === 'giayPhep' && (
            <div className="grid-form-fields-GPhep">
              <div className="form-group"><label>Số giấy phép kinh doanh:</label><input type="text" name="giayPhepKinhDoanh" value={formData.giayPhepKinhDoanh} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày cấp phép:</label><input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} /></div>
              <div className="form-group"><label>Ngày hết hạn:</label><input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} /></div>
            </div>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="option-button action-primary" disabled={loadingState.submit}>{loadingState.submit ? 'Đang gửi...' : '💾 Đăng ký cơ sở ✔️'}</button>
          <button type="button" onClick={resetForm} className="option-button action-secondary" disabled={loadingState.submit}>🔄 Đặt lại thông tin 🧹</button>
        </div>
      </form>

      {isAdmin && (
        <section className="khai-bao-section excel-upload-section">
          <h3 onClick={() => toggleSection('upload')} className="section-title-clickable">Tải lên hàng loạt từ file CSV/Excel {activeSection === 'upload' ? '▲' : '▼'}</h3>
          {activeSection === 'upload' && (
            <>
              <div className="file-upload-group">
                <label htmlFor="csvUpload" className="file-upload-label">Chọn file (.csv, .xlsx):</label>
                <input type="file" id="csvUpload" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="file-input" />
                {csvFile && <span className="file-name">{csvFile.name}</span>}
              </div>
              {excelData.length > 0 && (
                <div className="excel-preview-info">
                  <button onClick={handleBulkSubmit} className="submit-button bulk-upload-button" disabled={loadingState.upload}>{loadingState.upload ? 'Đang tải...' : `Tải lên hàng loạt (${excelData.length} cơ sở)`}</button>
                  <button onClick={resetCsvUpload} className="clear-excel-button" disabled={loadingState.upload}>Hủy bỏ</button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default KhaiBaoCoSoPage;
