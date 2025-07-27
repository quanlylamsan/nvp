// src/pages/KhaiBaoCoSo.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './KhaiBaoCoSo.css'; // Giữ import này nếu bạn có các style riêng cho component này
import speciesOptions from '../data/speciesData';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'; 

function KhaiBaoCoSoPage() { // Đã sửa tên function
  const navigate = useNavigate();

  const initialFormState = {
    // ... (giữ nguyên initialFormState)
    tenCoSo: '', tinhThanhPho: '', xaPhuong: '', diaChiCoSo: '', vido: '', kinhdo: '',
    ngayThanhLap: '', giayPhepKinhDoanh: '',
    tenNguoiDaiDien: '', namSinh: '', soCCCD: '', ngayCapCCCD: '', noiCapCCCD: '',
    soDienThoaiNguoiDaiDien: '', diaChiNguoiDaiDien: '', emailNguoiDaiDien: '',
    mucDichNuoi: '', hinhThucNuoi: '', maSoCoSoGayNuoi: '', tongDan: '',
    loaiHinhKinhDoanhGo: '', nganhNgheKinhDoanhGo: '', khoiLuong: '',
    loaiHinhCheBienGo: '', nguonGocGo: '',
    loaiCoSoDangKy: '',
    tenLamSan: '', tenKhoaHoc: '',
    issueDate: '', expiryDate: '',
    trangThai: 'Đang hoạt động',
    ghiChu: '', // Thêm ghiChu vào initialFormState nếu nó không có
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [csvFile, setCsvFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [openSections, setOpenSections] = useState({
    thongTinCoSo: true,
    nguoiDaiDien: true,
    loaiCoSo: true,
    thongTinLoaiHinh: true, // Sửa thành true để hiển thị mặc định
    giayPhep: true,
    upload: true,
  });

  const toggleSection = (sectionName) => {
    setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role === 'admin') setIsAdmin(true);
      } catch (err) {
        console.error("Lỗi giải mã token:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setMessage({ type: '', text: '' });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    if (!token) { 
        navigate('/login');
        return; 
    }

    try {
        const submissionData = { ...formData };
        submissionData.products = [];
        
        if (submissionData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi' && submissionData.tenLamSan) {
            const selectedSpecies = speciesOptions.find(s => s.name === submissionData.tenLamSan); // Đã sửa s.name thay vì s.tenLamSan
            submissionData.products.push({
                tenLamSan: submissionData.tenLamSan,
                tenKhoaHoc: selectedSpecies ? selectedSpecies.scientificName : '', // scientificName
                khoiLuong: submissionData.tongDan,
                donViTinh: 'cá thể',
                mucDichNuoi: submissionData.mucDichNuoi,
                hinhThucNuoi: submissionData.hinhThucNuoi,
                maSoCoSoGayNuoi: submissionData.maSoCoSoGayNuoi
            });
        } else if (submissionData.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ' && submissionData.tenLamSan) {
            submissionData.products.push({
                tenLamSan: submissionData.tenLamSan,
                tenKhoaHoc: submissionData.tenKhoaHoc,
                khoiLuong: submissionData.khoiLuong,
                donViTinh: 'm³',
                loaiHinhCheBienGo: submissionData.loaiHinhCheBienGo,
                nguonGocGo: submissionData.nguonGocGo
            });
        }
        
        const fieldsToDelete = ['tenLamSan', 'tenKhoaHoc', 'khoiLuong', 'tongDan', 'loaiHinhCheBienGo', 'nguonGocGo', 'mucDichNuoi', 'hinhThucNuoi', 'maSoCoSoGayNuoi'];
        fieldsToDelete.forEach(field => delete submissionData[field]);

        await axios.post(`${API_BASE_URL}/api/farms`, submissionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMessage({ type: 'success', text: 'Đăng ký cơ sở thành công!' });
        resetForm();
    } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Đăng ký thất bại.' });
    } finally {
        setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      try {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (error) => reject(error);
          reader.readAsText(file);
        });

        const workbook = XLSX.read(data, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        const mappedData = jsonData.map(row => {
          const mappedRow = {};
          mappedRow.tenCoSo = row['Tên cơ sở'];
          mappedRow.tinhThanhPho = row['Tỉnh (TP)'];
          mappedRow.xaPhuong = row['Xã (Phường)'];
          mappedRow.diaChiCoSo = row['Địa chỉ'];
          mappedRow.vido = row['Vĩ độ'] || '';
          mappedRow.kinhdo = row['Kinh độ'] || '';
          mappedRow.ngayThanhLap = row['Ngày thành lập'] ? new Date(row['Ngày thành lập']).toISOString() : '';
          mappedRow.giayPhepKinhDoanh = row['Số GPKD'] || '';

          mappedRow.tenNguoiDaiDien = row['Tên người đại diện'];
          mappedRow.namSinh = row['Năm sinh'] || '';
          mappedRow.soCCCD = row['Số CCCD'];
          mappedRow.ngayCapCCCD = row['Ngày cấp CCCD'] ? new Date(row['Ngày cấp CCCD']).toISOString() : '';
          mappedRow.noiCapCCCD = row['Nơi cấp CCCD'] || '';
          mappedRow.soDienThoaiNguoiDaiDien = row['SĐT người đại diện'] || '';
          mappedRow.diaChiNguoiDaiDien = row['Địa chỉ người đại diện'] || '';
          mappedRow.emailNguoiDaiDien = row['Email người đại diện'] || '';

          mappedRow.loaiCoSoDangKy = row['Loại cơ sở đăng ký'];
          mappedRow.trangThai = row['Trạng thái'] || 'Đang hoạt động';
          mappedRow.ghiChu = row['Ghi chú'] || '';

          const product = {};
          if (mappedRow.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi') {
            mappedRow.mucDichNuoi = row['Mục đích nuôi'] || '';
            mappedRow.hinhThucNuoi = row['Hình thức nuôi'] || '';
            mappedRow.maSoCoSoGayNuoi = row['Mã số CS gây nuôi'] || '';
            mappedRow.tongDan = row['Tổng đàn'] || 0;
            product.tenLamSan = row['Loài nuôi'];
            product.tenKhoaHoc = speciesOptions.find(s => s.name === product.tenLamSan)?.scientificName || '';
            product.khoiLuong = mappedRow.tongDan;
            product.donViTinh = 'cá thể';
            mappedRow.products = [product];
          } else if (mappedRow.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ') {
            mappedRow.loaiHinhKinhDoanhGo = row['Loai hinh KD gỗ'] || '';
            mappedRow.nganhNgheKinhDoanhGo = row['Ngành nghề KD gỗ'] || '';
            mappedRow.khoiLuong = row['Khối lượng'] || 0;
            mappedRow.loaiHinhCheBienGo = row['Loại hình chế biến gỗ'] || '';
            mappedRow.nguonGocGo = row['Nguồn gốc gỗ'] || '';
            product.tenLamSan = row['Tên lâm sản gỗ'];
            product.tenKhoaHoc = row['Tên khoa học gỗ'] || '';
            product.khoiLuong = mappedRow.khoiLuong;
            product.donViTinh = 'm³';
            mappedRow.products = [product];
          }

          return mappedRow;
        });
        setExcelData(jsonData); // Sử dụng jsonData trực tiếp nếu mapping xảy ra sau đó
        setMessage({ type: 'success', text: `Đã đọc thành công ${jsonData.length} dòng dữ liệu từ file CSV.` });
      } catch (err) {
        console.error("Lỗi khi đọc file CSV:", err);
        setMessage({ type: 'error', text: 'Lỗi khi đọc file CSV. Vui lòng kiểm tra định dạng.' });
        setExcelData([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkSubmit = async () => {
    if (excelData.length === 0) {
      alert("Không có dữ liệu để tải lên.");
      return;
    }
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        setIsLoading(false);
        return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/farms/bulk`, excelData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: `Tải lên thành công ${response.data.successCount} cơ sở, ${response.data.failCount} thất bại.` });
      setExcelData([]);
      setCsvFile(null);
    } catch (err) {
      console.error("Lỗi khi tải lên hàng loạt:", err.response?.data || err.message);
      setMessage({ type: 'error', text: `Tải lên hàng loạt thất bại: ${err.response?.data?.message || err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const resetCsvUpload = () => {
    setCsvFile(null);
    setExcelData([]);
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="form-page-container">
      <h2>📄 Khai báo cơ sở nuôi</h2>
      <form onSubmit={handleSubmit} className="form-layout"> {/* Đã thêm className */}
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('thongTinCoSo')} className="section-title-clickable">Thông tin chính của cơ sở nuôi {openSections.thongTinCoSo ? '▲' : '▼'}</h3>
          {openSections.thongTinCoSo && (
            <div className="grid-form-fields"> {/* Đổi tên class */}
                <div className="form-group"><label>Tên cơ sở:</label><input type="text" name="tenCoSo" value={formData.tenCoSo} onChange={handleChange} required /></div>
                <div className="form-group"><label>Tỉnh (Thành phố):</label><input type="text" name="tinhThanhPho" value={formData.tinhThanhPho} onChange={handleChange} required /></div>
                <div className="form-group"><label>Xã (Phường):</label><input type="text" name="xaPhuong" value={formData.xaPhuong} onChange={handleChange} required /></div>
                <div className="form-group"><label>Địa chỉ cơ sở:</label><input type="text" name="diaChiCoSo" value={formData.diaChiCoSo} onChange={handleChange} required /></div>
                <div className="form-group"><label>Vĩ độ:</label><input type="number" name="vido" value={formData.vido} onChange={handleChange} step="any" /></div>
                <div className="form-group"><label>Kinh độ:</label><input type="number" name="kinhdo" value={formData.kinhdo} onChange={handleChange} step="any" /></div>
                <div className="form-group"><label>Ngày thành lập:</label><input type="date" name="ngayThanhLap" value={formData.ngayThanhLap} onChange={handleChange} /></div>
                <div className="form-group"><label>Số giấy phép kinh doanh:</label><input type="text" name="giayPhepKinhDoanh" value={formData.giayPhepKinhDoanh} onChange={handleChange} /></div>
            </div>
          )}
        </section>

        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('nguoiDaiDien')} className="section-title-clickable">Thông tin người đại diện {openSections.nguoiDaiDien ? '▲' : '▼'}</h3>
          {openSections.nguoiDaiDien && (
             <div className="grid-form-fields"> {/* Đổi tên class */}
                <div className="form-group"><label>Tên người đại diện:</label><input type="text" name="tenNguoiDaiDien" value={formData.tenNguoiDaiDien} onChange={handleChange} required /></div>
                <div className="form-group"><label>Năm sinh:</label><input type="number" name="namSinh" value={formData.namSinh} onChange={handleChange} /></div>
                <div className="form-group"><label>Số CCCD/Hộ chiếu:</label><input type="text" name="soCCCD" value={formData.soCCCD} onChange={handleChange} required /></div>
                <div className="form-group"><label>Ngày cấp CCCD:</label><input type="date" name="ngayCapCCCD" value={formData.ngayCapCCCD} onChange={handleChange} /></div>
                <div className="form-group"><label>Nơi cấp CCCD:</label><input type="text" name="noiCapCCCD" value={formData.noiCapCCCD} onChange={handleChange} /></div>
                <div className="form-group"><label>Số điện thoại người đại diện:</label><input type="tel" name="soDienThoaiNguoiDaiDien" value={formData.soDienThoaiNguoiDaiDien} onChange={handleChange} /></div>
                <div className="form-group"><label>Địa chỉ người đại diện:</label><input type="text" name="diaChiNguoiDaiDien" value={formData.diaChiNguoiDaiDien} onChange={handleChange} /></div>
                <div className="form-group"><label>Email người đại diện:</label><input type="email" name="emailNguoiDaiDien" value={formData.emailNguoiDaiDien} onChange={handleChange} /></div>
            </div>
          )}
        </section>
        
        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('loaiCoSo')} className="section-title-clickable">Loại cơ sở đăng ký {openSections.loaiCoSo ? '▲' : '▼'}</h3>
          {openSections.loaiCoSo && (
            <div className="form-group">
              <label htmlFor="loaiCoSoDangKy">Chọn loại cơ sở đăng ký:</label>
              <select id="loaiCoSoDangKy" name="loaiCoSoDangKy" value={formData.loaiCoSoDangKy} onChange={handleChange} required>
                <option value="">-- Chọn loại --</option>
                <option value="Đăng ký cơ sở gây nuôi">Cơ sở gây nuôi (Động vật/Thực vật)</option>
                <option value="Đăng ký cơ sở kinh doanh, chế biến gỗ">Cơ sở kinh doanh, chế biến gỗ</option>
              </select>
            </div>
          )}
        </section>

        {formData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi' && (
          <section className="khai-bao-section">
            <h3 onClick={() => toggleSection('thongTinGayNuoi')} className="section-title-clickable">Thông tin cơ sở gây nuôi {openSections.thongTinGayNuoi ? '▲' : '▼'}</h3>
            {openSections.thongTinGayNuoi && (
              <div className="grid-form-fields"> {/* Đổi tên class */}
                <div className="form-group"><label>Mục đích nuôi:</label><input type="text" name="mucDichNuoi" value={formData.mucDichNuoi} onChange={handleChange} /></div>
                <div className="form-group"><label>Hình thức nuôi:</label><input type="text" name="hinhThucNuoi" value={formData.hinhThucNuoi} onChange={handleChange} /></div>
                <div className="form-group"><label>Mã số cơ sở gây nuôi:</label><input type="text" name="maSoCoSoGayNuoi" value={formData.maSoCoSoGayNuoi} onChange={handleChange} /></div>
                <div className="form-group"><label>Tổng đàn (con):</label><input type="number" name="tongDan" value={formData.tongDan} onChange={handleChange} /></div>
                <div className="form-group">
                  <label htmlFor="tenLamSan">Loài nuôi:</label>
                  <select id="tenLamSan" name="tenLamSan" value={formData.tenLamSan} onChange={handleChange}>
                    <option value="">-- Chọn loài --</option>
                    {Array.isArray(speciesOptions) && speciesOptions.map((species, index) => (<option key={index} value={species.name}>{species.name}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="tenKhoaHoc">Tên khoa học (tự động điền):</label>
                  <input type="text" value={Array.isArray(speciesOptions) ? (speciesOptions.find(s => s.name === formData.tenLamSan)?.scientificName || '') : ''} readOnly disabled />
                </div>
              </div>
            )}
          </section>
        )}

        {formData.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ' && (
          <section className="khai-bao-section">
             <h3 onClick={() => toggleSection('thongTinKinhDoanhGo')} className="section-title-clickable">Thông tin cơ sở kinh doanh, chế biến gỗ {openSections.thongTinKinhDoanhGo ? '▲' : '▼'}</h3>
             {openSections.thongTinKinhDoanhGo && (
                <div className="grid-form-fields"> {/* Đổi tên class */}
                    <div className="form-group"><label>Loại hình kinh doanh gỗ:</label><input type="text" name="loaiHinhKinhDoanhGo" value={formData.loaiHinhKinhDoanhGo} onChange={handleChange} /></div>
                    <div className="form-group"><label>Ngành nghề kinh doanh gỗ:</label><input type="text" name="nganhNgheKinhDoanhGo" value={formData.nganhNgheKinhDoanhGo} onChange={handleChange} /></div>
                    <div className="form-group"><label>Khối lượng (m³):</label><input type="number" name="khoiLuong" value={formData.khoiLuong} onChange={handleChange} step="any" /></div>
                    <div className="form-group"><label>Loại hình chế biến gỗ:</label><select name="loaiHinhCheBienGo" value={formData.loaiHinhCheBienGo} onChange={handleChange}><option value="">-- Chọn loại hình --</option><option value="Tròn">Tròn</option><option value="Xẻ">Xẻ</option><option value="Thành phẩm">Thành phẩm</option></select></div>
                    <div className="form-group"><label>Nguồn gốc gỗ:</label><select name="nguonGocGo" value={formData.nguonGocGo} onChange={handleChange}><option value="">-- Chọn nguồn gốc --</option><option value="Nhập khẩu">Nhập khẩu</option><option value="Vườn">Vườn</option><option value="Khác">Khác</option></select></div>
                    <div className="form-group"><label>Tên lâm sản:</label><input type="text" name="tenLamSan" value={formData.tenLamSan} onChange={handleChange} /></div>
                    <div className="form-group"><label>Tên khoa học:</label><input type="text" name="tenKhoaHoc" value={formData.tenKhoaHoc} onChange={handleChange} /></div>
                </div>
             )}
          </section>
        )}

        <section className="khai-bao-section">
          <h3 onClick={() => toggleSection('giayPhep')} className="section-title-clickable">Thông tin giấy phép và trạng thái {openSections.giayPhep ? '▲' : '▼'}</h3>
          {openSections.giayPhep && (
            <div className="grid-form-fields"> {/* Đổi tên class */}
                <div className="form-group"><label>Ngày cấp phép:</label><input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} /></div>
                <div className="form-group"><label>Ngày hết hạn:</label><input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} /></div>
                <div className="form-group"><label>Trạng thái:</label><select name="trangThai" value={formData.trangThai} onChange={handleChange}><option value="Đang hoạt động">Đang hoạt động</option><option value="Đã đóng cửa">Đã đóng cửa</option><option value="Tạm dừng">Tạm ngưng</option></select></div>
                <div className="form-group"><label>Ghi chú:</label><textarea name="ghiChu" value={formData.ghiChu} onChange={handleChange} rows="3"></textarea></div>
            </div>
          )}
        </section>
        
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Đang gửi...' : 'Đăng ký cơ sở'}</button>
          <button type="button" onClick={resetForm} className="reset-button" disabled={loading}>Đặt lại biểu mẫu</button>
        </div>
      </form>
    </div>
  );
}

export default KhaiBaoCoSoPage;