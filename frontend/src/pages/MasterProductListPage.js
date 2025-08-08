import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MasterProductListPage.css';

// Lấy URL API từ biến môi trường.
// Nếu biến môi trường không tồn tại (ví dụ: trong môi trường phát triển cục bộ),
// nó sẽ mặc định dùng localhost:10000.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000'; // Thêm dòng này

function MasterProductListPage() {
    const navigate = useNavigate();
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        tenCoSo: '',
        tinhThanhPho: '',
        tenLamSan: '',
        trangThai: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        } else {
            fetchMasterData(token);
        }
    }, [navigate]);

    const fetchMasterData = async (token) => {
        setLoading(true);
        try {
            // Sửa đổi: Sử dụng API_BASE_URL cho cuộc gọi API
            const response = await axios.get(`${API_BASE_URL}/api/master-product-list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMasterData(response.data);
        } catch (err) {
            console.error("Lỗi khi gọi API:", err.response || err.message);
            // Có thể muốn hiển thị một thông báo lỗi cho người dùng ở đây
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredData = useMemo(() => {
        return masterData.filter(item => {
            return (
                (filters.tenCoSo ? item.tenCoSo?.toLowerCase().includes(filters.tenCoSo.toLowerCase()) : true) &&
                (filters.tinhThanhPho ? item.tinhThanhPho?.toLowerCase().includes(filters.tinhThanhPho.toLowerCase()) : true) &&
                (filters.tenLamSan ? item.tenLamSan?.toLowerCase().includes(filters.tenLamSan.toLowerCase()) : true) &&
                (filters.trangThai ? item.trangThai === filters.trangThai : true)
            );
        });
    }, [filters, masterData]);

    if (loading) {
        return <div className="master-list-container"><p>Đang tải dữ liệu, vui lòng chờ...</p></div>;
    }

    return (
        <div className="master-list-container">
            <h1>📋 BẢNG TỔNG HỢP CƠ SỞ VÀ LÂM SẢN 📋</h1>
			<div className="filters-panel">
                <input type="text" name="tenCoSo" placeholder="Lọc theo tên cơ sở..." onChange={handleFilterChange} value={filters.tenCoSo} />
                <input type="text" name="tinhThanhPho" placeholder="Lọc theo tỉnh (TP)..." onChange={handleFilterChange} value={filters.tinhThanhPho} />
                <input type="text" name="tenLamSan" placeholder="Lọc theo tên lâm sản..." onChange={handleFilterChange} value={filters.tenLamSan} />
                <select name="trangThai" onChange={handleFilterChange} value={filters.trangThai}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Đã đóng cửa">Đã đóng cửa</option>
                    <option value="Tạm dừng">Tạm ngưng</option>
                </select>
            </div>

            <div className="table-wrapper">
                <table className="master-table">
                    <thead>
                        <tr>
                            <th>Tên Lâm sản</th>
                            <th>Khối lượng</th>
                            <th>Đơn vị</th>
                            <th>Nguồn gốc Gỗ</th>
                            <th>Ngày Đăng ký</th>
                            <th>Tên Cơ sở</th>
                            <th>Tỉnh (TP)</th>
                            <th>Địa chỉ</th>
                            <th>Trạng thái</th>
                            <th>Người đại diện</th>
                            <th>Số CCCD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? filteredData.map(item => (
                            <tr key={item._id || item.farmId + item.tenLamSan}>
                                <td className="highlight-col">{item.tenLamSan}</td>
                                <td>{item.khoiLuong}</td>
                                <td>{item.donViTinh}</td>
                                <td>{item.nguonGocGo}</td>
                                <td>{item.ngayDangKyLamSan ? new Date(item.ngayDangKyLamSan).toLocaleDateString() : ''}</td>
                                <td className="highlight-col">{item.tenCoSo}</td>
                                <td>{item.tinhThanhPho}</td>
                                <td>{item.diaChiCoSo}</td>
                                <td>{item.trangThai}</td>
                                <td>{item.tenNguoiDaiDien}</td>
                                <td>{item.soCCCD}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="11" style={{ textAlign: 'center' }}>Không tìm thấy dữ liệu phù hợp.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default MasterProductListPage;