// src/pages/FarmListPage.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './FarmListPage.css';
import { useNavigate } from 'react-router-dom';

function FarmListPage() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmType, setSelectedFarmType] = useState('all');

  // --- NEW: State để quản lý phân trang ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  // Dùng useCallback để tránh tạo lại hàm fetchFarms mỗi lần render
  const fetchFarms = useCallback(async (currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Bạn chưa đăng nhập.');
        setLoading(false);
        navigate('/login');
        return;
      }

      // Tạo tham số query cho API
      const params = {
        page: currentPage,
        limit: 10 // Hoặc số lượng bạn muốn trên mỗi trang
      };
      if (selectedFarmType !== 'all') {
        params.farmType = selectedFarmType;
      }

      const response = await axios.get('http://localhost:10000/api/farms', {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });

      // --- FIX: Đọc dữ liệu từ response.data.docs theo đúng cấu trúc của backend ---
      if (response.data && Array.isArray(response.data.docs)) {
        setFarms(response.data.docs);
        setTotalPages(response.data.totalPages); // Cập nhật tổng số trang
        setPage(response.data.page); // Cập nhật trang hiện tại
      } else {
        setError('Dữ liệu nhận được từ server không đúng định dạng.');
        setFarms([]);
      }

    } catch (err) {
      console.error('Lỗi khi lấy danh sách farms:', err.response?.data || err.message);
      if (err.response && err.response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Không thể tải danh sách cơ sở.');
      }
      setFarms([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFarmType, navigate]);

  // useEffect để fetch dữ liệu khi trang hoặc bộ lọc thay đổi
  useEffect(() => {
    fetchFarms(page);
  }, [page, fetchFarms]);

  // --- FIX: Sửa lại tên trường cho đúng với dữ liệu ---
  const filteredFarms = farms.filter(farm =>
    searchTerm === '' ||
    (farm.tenCoSo && farm.tenCoSo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (farm.diaChiCoSo && farm.diaChiCoSo.toLowerCase().includes(searchTerm.toLowerCase())) || // diaChi -> diaChiCoSo
    (farm.tenNguoiDaiDien && farm.tenNguoiDaiDien.toLowerCase().includes(searchTerm.toLowerCase())) // tenChuCoSo -> tenNguoiDaiDien
  );

  // --- NEW: Hàm xử lý chuyển trang ---
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };


  if (loading) {
    return <div className="farm-list-container">Đang tải danh sách cơ sở...</div>;
  }

  if (error) {
    return <div className="farm-list-container error-message">Lỗi: {error}</div>;
  }

  return (
    <div className="farm-list-container">
      <h2>📋 Danh sách cơ sở</h2>

      <div className="filter-controls">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên cơ sở, địa chỉ, người đại diện..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedFarmType}
          onChange={(e) => {
            setSelectedFarmType(e.target.value);
            setPage(1); // Reset về trang 1 khi thay đổi bộ lọc
          }}
          className="type-filter-select"
        >
          <option value="all">Tất cả loại hình</option>
          <option value="Đăng ký cơ sở gây nuôi">Cơ sở gây nuôi</option>
          <option value="Đăng ký cơ sở kinh doanh, chế biến gỗ">Cơ sở kinh doanh, chế biến gỗ</option>
        </select>
      </div>

      {filteredFarms.length === 0 ? (
        <p className="no-data-message">Không tìm thấy cơ sở nào.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="farm-table">
              <thead>
                <tr>
                  <th>Tên cơ sở</th>
                  <th>Địa chỉ</th>
                  <th>Tỉnh/Thành phố</th>
                  <th>Người đại diện</th>
                  <th>Loại hình đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarms.map((f) => (
                  <tr key={f._id} onClick={() => navigate(`/admin/woods/${f._id}`)} style={{cursor: 'pointer'}}>
                    {/* --- FIX: Sửa lại tên trường cho đúng --- */}
                    <td>{f.tenCoSo}</td>
                    <td>{f.diaChiCoSo}</td>
                    <td>{f.tinhThanhPho}</td>
                    <td>{f.tenNguoiDaiDien}</td>
                    <td>{f.loaiCoSoDangKy || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- NEW: Khối điều khiển phân trang --- */}
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              &laquo; Trang trước
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Trang sau &raquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FarmListPage;