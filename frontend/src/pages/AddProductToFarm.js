import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './KhaiBaoCoSo.css'; // Tái sử dụng CSS từ form khai báo để giao diện nhất quán

function AddProductToFarm() {
  // Lấy ID của cơ sở từ thanh địa chỉ URL (ví dụ: /farm/abc-123/add-product)
  const { farmId } = useParams(); 
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // State để lưu thông tin cơ sở cha (chỉ để hiển thị)
  const [farmInfo, setFarmInfo] = useState(null); 
  // State cho dữ liệu của form lâm sản mới
  const [productData, setProductData] = useState({ 
    tenLamSan: '',
    tenKhoaHoc: '',
    khoiLuong: 0,
    donViTinh: 'm³',
    loaiHinhCheBienGo: '',
    nguonGocGo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // useEffect này sẽ chạy một lần khi trang được tải
  // để lấy thông tin của cơ sở và hiển thị cho người dùng
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchFarmInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:10000/api/farms/${farmId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFarmInfo(response.data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin cơ sở:", error);
        setMessage({ type: 'error', text: 'Không thể tải thông tin cơ sở. Vui lòng quay lại và thử lại.' });
      } finally {
        setLoading(false);
      }
    };

    fetchFarmInfo();
  }, [farmId, token, navigate]);

  // Xử lý khi người dùng thay đổi giá trị trong các ô input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý khi người dùng nhấn nút "Lưu Lâm sản"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Gọi đến API endpoint mới đã tạo ở backend
      const response = await axios.post(`http://localhost:10000/api/farms/${farmId}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Thêm lâm sản thành công!' });
      
      // Reset form để người dùng có thể thêm sản phẩm khác nếu muốn
      setProductData({
        tenLamSan: '', tenKhoaHoc: '', khoiLuong: '', donViTinh: 'm³', loaiHinhCheBienGo: '', nguonGocGo: ''
      });
      
      // Tùy chọn: sau 2 giây, tự động chuyển về trang danh sách
      setTimeout(() => {
        navigate(-1); // Quay lại trang trước đó (trang danh sách)
      }, 2000);

    } catch (error) {
      console.error("Lỗi khi thêm lâm sản:", error.response?.data || error.message);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Thêm lâm sản thất bại. Vui lòng kiểm tra lại dữ liệu.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !farmInfo) {
    return <div className="khai-bao-container">Đang tải thông tin cơ sở...</div>;
  }

  return (
    <div className="khai-bao-container">
      <h2>Thêm Lâm sản mới cho Cơ sở</h2>

      {message.type && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} className="close-message-button">x</button>
        </div>
      )}

      {/* Phần hiển thị thông tin cơ sở - chỉ đọc, không cho sửa */}
      {farmInfo && (
        <section className="khai-bao-section read-only-section">
          <h3>Thông tin cơ sở</h3>
          <p><strong>Tên cơ sở:</strong> {farmInfo.tenCoSo}</p>
          <p><strong>Địa chỉ:</strong> {`${farmInfo.diaChiCoSo}, ${farmInfo.xaPhuong}, ${farmInfo.tinhThanhPho}`}</p>
          <p><strong>Người đại diện:</strong> {farmInfo.tenNguoiDaiDien}</p>
        </section>
      )}

      <hr />

      {/* Form để thêm lâm sản mới */}
      <form onSubmit={handleSubmit} className="khai-bao-form">
        <section className="khai-bao-section">
          <h3>Nhập thông tin lâm sản</h3>
          
          <div className="form-group">
            <label htmlFor="tenLamSan">Tên lâm sản:</label>
            <input type="text" id="tenLamSan" name="tenLamSan" value={productData.tenLamSan} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="tenKhoaHoc">Tên khoa học:</label>
            <input type="text" id="tenKhoaHoc" name="tenKhoaHoc" value={productData.tenKhoaHoc} onChange={handleChange} />
          </div>

           <div className="form-group">
            <label htmlFor="khoiLuong">Khối lượng:</label>
            <input type="number" id="khoiLuong" name="khoiLuong" value={productData.khoiLuong} onChange={handleChange} step="any" required />
          </div>

          <div className="form-group">
            <label htmlFor="donViTinh">Đơn vị tính:</label>
            <input type="text" id="donViTinh" name="donViTinh" value={productData.donViTinh} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="loaiHinhCheBienGo">Loại hình chế biến gỗ:</label>
            <select id="loaiHinhCheBienGo" name="loaiHinhCheBienGo" value={productData.loaiHinhCheBienGo} onChange={handleChange} required>
              <option value="">-- Chọn loại hình --</option>
              <option value="Tròn">Tròn</option>
              <option value="Xẻ">Xẻ</option>
              <option value="Thành phẩm">Thành phẩm</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nguonGocGo">Nguồn gốc gỗ:</label>
            <select id="nguonGocGo" name="nguonGocGo" value={productData.nguonGocGo} onChange={handleChange} required>
              <option value="">-- Chọn nguồn gốc --</option>
              <option value="Nhập khẩu">Nhập khẩu</option>
              <option value="Vườn">Vườn</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

        </section>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu Lâm sản'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="reset-button" disabled={loading}>
            Quay lại
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProductToFarm;