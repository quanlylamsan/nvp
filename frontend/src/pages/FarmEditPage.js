// src/pages/FarmEditPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Dashboard.css'; // Sử dụng CSS chung hoặc CSS của form
import './FormPage.css'; // Đảm bảo bạn có CSS này nếu dùng các class form-group, form-container
import speciesOptions from '../data/speciesData'; // Import danh sách loài từ file mới

function FarmEditPage() {
  const { farmId } = useParams(); // Lấy farmId từ URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Khởi tạo farmData với tất cả các trường từ schema Farm.js, bao gồm trường mới
  const [farmData, setFarmData] = useState({
    // Thông tin cơ sở
    tenCoSo: '',
    tinhThanhPho: '',
    xaPhuong: '',
    diaChiCoSo: '',
    vido: '',
    kinhdo: '',
    // loaiHinhCoSo: '', // Đã bỏ trường này
    ngayThanhLap: '', // Sẽ được định dạng lại cho input type="date"
    giayPhepKinhDoanh: '', // Đã di chuyển xuống nhóm Giấy phép

    // Người đại diện
    tenNguoiDaiDien: '',
    namSinh: '',
    soCCCD: '',
    ngayCapCCCD: '', // Sẽ được định dạng lại cho input type="date"
    noiCapCCCD: '',
    soDienThoaiNguoiDaiDien: '',
    diaChiNguoiDaiDien: '',
    // emailNguoiDaiDien: '', // Đã bỏ trường này

    // Cơ sở gây nuôi
    mucDichNuoi: '',
    hinhThucNuoi: '',
    maSoCoSoGayNuoi: '',
    tongDan: '',

    // Cơ sở kinh doanh, chế biến gỗ
    loaiHinhKinhDoanhGo: '',
    nganhNgheKinhDoanhGo: '',
    khoiLuong: '',

    // Loại cơ sở đăng ký (Quan trọng cho việc phân loại)
    loaiCoSoDangKy: '',

    // Các trường thông tin loài (áp dụng chung cho cả hai loại hình)
    tenLamSan: '',
    tenKhoaHoc: '',

    // Các trường giấy phép
    // licenseNumber: '', // Đã bỏ trường này
    issueDate: '',
    expiryDate: '',

    // Các trường chung khác
    trangThai: '',
    ghiChu: '',
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showManualSpeciesInput, setShowManualSpeciesInput] = useState(false);

  useEffect(() => {
    const fetchFarmData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`http://localhost:10000/api/farms/${farmId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data;

        // Định dạng lại ngày tháng cho input type="date"
        if (data.ngayThanhLap) data.ngayThanhLap = new Date(data.ngayThanhLap).toISOString().split('T')[0];
        if (data.ngayCapCCCD) data.ngayCapCCCD = new Date(data.ngayCapCCCD).toISOString().split('T')[0];
        if (data.issueDate) data.issueDate = new Date(data.issueDate).toISOString().split('T')[0];
        if (data.expiryDate) data.expiryDate = new Date(data.expiryDate).toISOString().split('T')[0];

        // Cập nhật state farmData, bỏ qua các trường không còn tồn tại trong schema
        setFarmData({
          tenCoSo: data.tenCoSo || '',
          tinhThanhPho: data.tinhThanhPho || '',
          xaPhuong: data.xaPhuong || '',
          diaChiCoSo: data.diaChiCoSo || '',
          vido: data.vido || '',
          kinhdo: data.kinhdo || '',
          // loaiHinhCoSo: data.loaiHinhCoSo || '', // Bỏ trường này
          ngayThanhLap: data.ngayThanhLap || '',
          giayPhepKinhDoanh: data.giayPhepKinhDoanh || '',

          tenNguoiDaiDien: data.tenNguoiDaiDien || '',
          namSinh: data.namSinh || '',
          soCCCD: data.soCCCD || '',
          ngayCapCCCD: data.ngayCapCCCD || '',
          noiCapCCCD: data.noiCapCCCD || '',
          soDienThoaiNguoiDaiDien: data.soDienThoaiNguoiDaiDien || '',
          diaChiNguoiDaiDien: data.diaChiNguoiDaiDien || '',
          // emailNguoiDaiDien: data.emailNguoiDaiDien || '', // Bỏ trường này

          mucDichNuoi: data.mucDichNuoi || '',
          hinhThucNuoi: data.hinhThucNuoi || '',
          maSoCoSoGayNuoi: data.maSoCoSoGayNuoi || '',
          tongDan: data.tongDan || '',

          loaiHinhKinhDoanhGo: data.loaiHinhKinhDoanhGo || '',
          nganhNgheKinhDoanhGo: data.nganhNgheKinhDoanhGo || '',
          khoiLuong: data.khoiLuong || '',

          loaiCoSoDangKy: data.loaiCoSoDangKy || '',

          tenLamSan: data.tenLamSan || '',
          tenKhoaHoc: data.tenKhoaHoc || '',

          // licenseNumber: data.licenseNumber || '', // Bỏ trường này
          issueDate: data.issueDate || '',
          expiryDate: data.expiryDate || '',

          trangThai: data.trangThai || '',
          ghiChu: data.ghiChu || '',
        });
        
        // Kiểm tra nếu tên lâm sản không có trong speciesOptions thì hiển thị input thủ công
        if (data.tenLamSan && !speciesOptions.some(s => s.tenLamSan === data.tenLamSan)) {
          setShowManualSpeciesInput(true);
        }
      } catch (error) {
        console.error('Error fetching farm data:', error);
        setErrorMessage('Không thể tải dữ liệu cơ sở. Vui lòng thử lại.');
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (farmId) {
      fetchFarmData();
    }
  }, [farmId, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;

    if (name === 'tenLamSan') {
      if (newValue === 'Nhập thủ công') {
        setShowManualSpeciesInput(true);
        setFarmData(prevData => ({
          ...prevData,
          [name]: '',
          tenKhoaHoc: ''
        }));
      } else {
        setShowManualSpeciesInput(false);
        const selectedSpecies = speciesOptions.find(s => s.tenLamSan === newValue);
        setFarmData(prevData => ({
          ...prevData,
          [name]: newValue,
          tenKhoaHoc: selectedSpecies ? selectedSpecies.tenKhoaHoc : ''
        }));
      }
    } else {
      setFarmData({ ...farmData, [name]: newValue });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const dataToSend = { ...farmData };
      // Xóa các trường không còn tồn tại trong schema hoặc đã bỏ khỏi form
      // delete dataToSend.emailNguoiDaiDien; // Đã bỏ khỏi initial state
      // delete dataToSend.licenseNumber; // Đã bỏ khỏi initial state
      // delete dataToSend.loaiHinhCoSo; // Đã bỏ khỏi initial state

      // Chuyển đổi ngày tháng về định dạng ISO string nếu có giá trị
      if (dataToSend.ngayThanhLap) dataToSend.ngayThanhLap = new Date(dataToSend.ngayThanhLap).toISOString();
      if (dataToSend.ngayCapCCCD) dataToSend.ngayCapCCCD = new Date(dataToSend.ngayCapCCCD).toISOString();
      if (dataToSend.issueDate) dataToSend.issueDate = new Date(dataToSend.issueDate).toISOString();
      if (dataToSend.expiryDate) dataToSend.expiryDate = new Date(dataToSend.expiryDate).toISOString();

      // Xóa các trường không liên quan đến loại hình đăng ký được chọn
      if (dataToSend.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi') {
        delete dataToSend.loaiHinhKinhDoanhGo;
        delete dataToSend.nganhNgheKinhDoanhGo;
        delete dataToSend.khoiLuong;
      } else if (dataToSend.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ') {
        delete dataToSend.mucDichNuoi;
        delete dataToSend.hinhThucNuoi;
        delete dataToSend.maSoCoSoGayNuoi;
        delete dataToSend.tongDan;
      } else { // Nếu không chọn loại hình đăng ký cụ thể, xóa tất cả các trường đặc thù
        delete dataToSend.mucDichNuoi;
        delete dataToSend.hinhThucNuoi;
        delete dataToSend.maSoCoSoGayNuoi;
        delete dataToSend.tongDan;
        delete dataToSend.loaiHinhKinhDoanhGo;
        delete dataToSend.nganhNgheKinhDoanhGo;
        delete dataToSend.khoiLuong;
        delete dataToSend.tenLamSan; // Xóa nếu không thuộc loại hình nào
        delete dataToSend.tenKhoaHoc; // Xóa nếu không thuộc loại hình nào
      }

      const response = await axios.put(
        `http://localhost:10000/api/farms/${farmId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage('Cập nhật thông tin cơ sở thành công!');
      console.log('Update success:', response.data);
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.');
      console.error('Error updating farm:', error.response?.data || error.message);
      if (error.response && error.response.data && error.response.data.errors) {
        const validationErrors = Object.values(error.response.data.errors).map(err => err.message).join('; ');
        setErrorMessage(`Lỗi xác thực: ${validationErrors}`);
      } else if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(`Đã xảy ra lỗi: ${error.response.data.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="form-container">
        <p>Đang tải thông tin cơ sở nuôi...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1>Chỉnh sửa thông tin cơ sở</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <section className="khai-bao-section">
          <h2>Thông tin cơ sở</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="tenCoSo">Tên cơ sở:</label>
              <input type="text" id="tenCoSo" name="tenCoSo" value={farmData.tenCoSo} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="tinhThanhPho">Tỉnh (Thành phố):</label>
              <input type="text" id="tinhThanhPho" name="tinhThanhPho" value={farmData.tinhThanhPho} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="xaPhuong">Xã (Phường):</label>
              <input type="text" id="xaPhuong" name="xaPhuong" value={farmData.xaPhuong} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="diaChiCoSo">Địa chỉ:</label>
              <input type="text" id="diaChiCoSo" name="diaChiCoSo" value={farmData.diaChiCoSo} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="vido">Vĩ độ:</label>
              <input type="text" id="vido" name="vido" value={farmData.vido} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="kinhdo">Kinh độ:</label>
              <input type="text" id="kinhdo" name="kinhdo" value={farmData.kinhdo} onChange={handleChange} />
            </div>
            {/* Đã bỏ trường Loại hình cơ sở */}
            <div className="form-group">
              <label htmlFor="ngayThanhLap">Ngày thành lập:</label>
              <input type="date" id="ngayThanhLap" name="ngayThanhLap" value={farmData.ngayThanhLap} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="loaiCoSoDangKy">Loại cơ sở đăng ký:</label>
              <select id="loaiCoSoDangKy" name="loaiCoSoDangKy" value={farmData.loaiCoSoDangKy} onChange={handleChange} required>
                <option value="">- Chọn loại cơ sở -</option>
                <option value="Đăng ký cơ sở gây nuôi">=> Đăng ký cơ sở gây nuôi</option>
                <option value="Đăng ký cơ sở kinh doanh, chế biến gỗ">=> Đăng ký cơ sở kinh doanh,chế biến gỗ</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="trangThai">Trạng thái:</label>
              <select id="trangThai" name="trangThai" value={farmData.trangThai} onChange={handleChange}>
                <option value="">- Chọn trạng thái -</option>
                <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Đã đóng cửa">Đã đóng cửa</option>
              <option value="Tạm dừng">Tạm ngưng</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="ghiChu">Ghi chú:</label>
              <input type="text" id="ghiChu" name="ghiChu" value={farmData.ghiChu} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="khai-bao-section">
          <h2>Người đại diện</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="tenNguoiDaiDien">Họ và tên:</label>
              <input type="text" id="tenNguoiDaiDien" name="tenNguoiDaiDien" value={farmData.tenNguoiDaiDien} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="namSinh">Năm sinh:</label>
              <input type="number" id="namSinh" name="namSinh" value={farmData.namSinh} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="soCCCD">Số CCCD/Hộ chiếu:</label>
              <input type="text" id="soCCCD" name="soCCCD" value={farmData.soCCCD} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="ngayCapCCCD">Ngày cấp:</label>
              <input type="date" id="ngayCapCCCD" name="ngayCapCCCD" value={farmData.ngayCapCCCD} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="noiCapCCCD">Nơi cấp:</label>
              <input type="text" id="noiCapCCCD" name="noiCapCCCD" value={farmData.noiCapCCCD} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="soDienThoaiNguoiDaiDien">Số điện thoại:</label>
              <input type="tel" id="soDienThoaiNguoiDaiDien" name="soDienThoaiNguoiDaiDien" value={farmData.soDienThoaiNguoiDaiDien} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="diaChiNguoiDaiDien">Địa chỉ:</label>
              <input type="text" id="diaChiNguoiDaiDien" name="diaChiNguoiDaiDien" value={farmData.diaChiNguoiDaiDien} onChange={handleChange} />
            </div>
            {/* Đã bỏ trường emailNguoiDaiDien */}
          </div>
        </section>

        {farmData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi' && (
          <section className="khai-bao-section">
            <h3>Cơ sở gây nuôi</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="mucDichNuoi">Mục đích nuôi:</label>
                <select id="mucDichNuoi" name="mucDichNuoi" value={farmData.mucDichNuoi} onChange={handleChange}>
                  <option value="">Chọn mục đích nuôi</option>
                  <option value="Nuôi thương mại">Nuôi thương mại</option>
                  <option value="Nuôi phi thương mại">Nuôi phi thương mại</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="hinhThucNuoi">Hình thức nuôi:</label>
                <select id="hinhThucNuoi" name="hinhThucNuoi" value={farmData.hinhThucNuoi} onChange={handleChange}>
                  <option value="">Chọn hình thức nuôi</option>
                  <option value="Sinh trưởng">Sinh trưởng</option>
                  <option value="Sinh sản">Sinh sản</option>
                  <option value="Sinh trưởng và sinh sản">Sinh trưởng và sinh sản</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="maSoCoSoGayNuoi">Mã số cơ sở:</label>
                <input type="text" id="maSoCoSoGayNuoi" name="maSoCoSoGayNuoi" value={farmData.maSoCoSoGayNuoi} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="tongDan">Tổng đàn:</label>
                <input type="number" id="tongDan" name="tongDan" value={farmData.tongDan} onChange={handleChange} />
              </div>
            </div>
          </section>
        )}

        {farmData.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ' && (
          <section className="khai-bao-section">
            <h4>Cơ sở kinh doanh, chế biến gỗ</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="loaiHinhKinhDoanhGo">Loại hình kinh doanh gỗ:</label>
                <select id="loaiHinhKinhDoanhGo" name="loaiHinhKinhDoanhGo" value={farmData.loaiHinhKinhDoanhGo} onChange={handleChange}>
                  <option value="">Chọn loại hình kinh doanh</option>
                  <option value="Trại cưa">Trại cưa</option>
                  <option value="Trại mộc">Trại mộc</option>
                  <option value="Trang trí nội thất">Trang trí nội thất</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="nganhNgheKinhDoanhGo">Ngành nghề:</label>
                <select id="nganhNgheKinhDoanhGo" name="nganhNgheKinhDoanhGo" value={farmData.nganhNgheKinhDoanhGo} onChange={handleChange}>
                  <option value="">Chọn ngành nghề</option>
                  <option value="Thương mại">Thương mại</option>
                  <option value="Cưa gia công và mộc">Cưa gia công và mộc</option>
                  <option value="Chế biến mộc và thương mại">Chế biến mộc và thương mại</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="khoiLuong">Khối lượng:</label>
                <input type="text" id="khoiLuong" name="khoiLuong" value={farmData.khoiLuong} onChange={handleChange} />
              </div>
            </div>
          </section>
        )}

        {/* Tên lâm sản và Tên khoa học - Hiển thị cho cả hai loại hình khi được chọn */}
        {(farmData.loaiCoSoDangKy === 'Đăng ký cơ sở gây nuôi' || farmData.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ') && (
            <section className="khai-bao-section">
                <h3>Thông tin Loài</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="tenLamSan">Tên lâm sản:</label>
                        {showManualSpeciesInput ? (
                            <input 
                                type="text" 
                                id="tenLamSan" 
                                name="tenLamSan" 
                                value={farmData.tenLamSan} 
                                onChange={handleChange} 
                                placeholder="Nhập tên lâm sản" 
                            />
                        ) : (
                            <select id="tenLamSan" name="tenLamSan" value={farmData.tenLamSan} onChange={handleChange}>
                                <option value="">Chọn tên lâm sản</option>
                                {speciesOptions.map((option, index) => (
                                    <option key={index} value={option.tenLamSan}>
                                        {option.tenLamSan}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="tenKhoaHoc">Tên khoa học:</label>
                        {showManualSpeciesInput ? (
                            <input 
                                type="text" 
                                id="tenKhoaHoc" 
                                name="tenKhoaHoc" 
                                value={farmData.tenKhoaHoc} 
                                onChange={handleChange} 
                                placeholder="Nhập tên khoa học" 
                            />
                        ) : (
                            <input type="text" id="tenKhoaHoc" name="tenKhoaHoc" value={farmData.tenKhoaHoc} readOnly />
                        )}
                    </div>
                </div>
            </section>
        )}

        <section className="khai-bao-section">
          <h4>Thông tin Giấy phép</h4>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="giayPhepKinhDoanh">Số giấy phép kinh doanh:</label>
              <input type="text" id="giayPhepKinhDoanh" name="giayPhepKinhDoanh" value={farmData.giayPhepKinhDoanh} onChange={handleChange} />
            </div>
            {/* Đã bỏ trường licenseNumber */}
            <div className="form-group">
              <label htmlFor="issueDate">Ngày cấp:</label>
              <input type="date" id="issueDate" name="issueDate" value={farmData.issueDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="expiryDate">Ngày hết hạn:</label>
              <input type="date" id="expiryDate" name="expiryDate" value={farmData.expiryDate} onChange={handleChange} />
            </div>
          </div>
        </section>

        <button type="submit" className="submit-button">Lưu thay đổi</button>
        <button type="button" className="cancel-button" onClick={() => navigate('/admin/farms')}>
          Hủy
        </button>
      </form>
    </div>
  );
}

export default FarmEditPage;
