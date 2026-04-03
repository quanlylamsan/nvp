import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MasterProductListPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function MasterProductListPage() {
    // === KHAI BÁO STATE ===
    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho các bộ lọc
    const [filters, setFilters] = useState({
        tenCoSo: '',
        tinhThanhPho: '',
        tenLamSan: '',
        trangThai: ''
    });

    // State cho các giá trị duy nhất trong bộ lọc
    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueStatuses, setUniqueStatuses] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // === TẢI DỮ LIỆU ===
    const fetchMasterData = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/master-product-list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = response.data || [];
            setMasterData(data);
            
            // Tối ưu: Lấy giá trị duy nhất cho các bộ lọc ngay sau khi tải dữ liệu
            setUniqueProvinces([...new Set(data.map(item => item.tinhThanhPho).filter(Boolean))].sort());
            setUniqueStatuses([...new Set(data.map(item => item.trangThai).filter(Boolean))].sort());

        } catch (err) {
            console.error("Lỗi khi gọi API:", err.response || err.message);
            setError("Không thể tải dữ liệu tổng hợp. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchMasterData();
    }, [fetchMasterData]);


    // === XỬ LÝ SỰ KIỆN ===
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // === LỌC DỮ LIỆU ===
    const filteredData = useMemo(() => {
        return masterData.filter(item => {
            const tenCoSoMatch = filters.tenCoSo ? item.tenCoSo?.toLowerCase().includes(filters.tenCoSo.toLowerCase()) : true;
            const tinhThanhPhoMatch = filters.tinhThanhPho ? item.tinhThanhPho === filters.tinhThanhPho : true;
            const tenLamSanMatch = filters.tenLamSan ? item.tenLamSan?.toLowerCase().includes(filters.tenLamSan.toLowerCase()) : true;
            const trangThaiMatch = filters.trangThai ? item.trangThai === filters.trangThai : true;
            return tenCoSoMatch && tinhThanhPhoMatch && tenLamSanMatch && trangThaiMatch;
        });
    }, [filters, masterData]);


    // === HIỂN THỊ (RENDER) ===
    if (loading) {
        return <div className="master-list-container"><h2>Đang tải dữ liệu, vui lòng chờ...</h2></div>;
    }
    
    if (error) {
        return <div className="master-list-container"><h2 style={{ color: 'red' }}>Lỗi: {error}</h2></div>;
    }

    return (
        <div className="master-list-container">
            <h1>Tổng hợp lâm sản tại các cơ sở kinh doanh, chế biến gỗ 📋</h1>
            
            <div className="filters-panel">
                <input type="text" name="tenCoSo" placeholder="Lọc theo tên cơ sở..." onChange={handleFilterChange} value={filters.tenCoSo} />
                <input type="text" name="tenLamSan" placeholder="Lọc theo tên lâm sản..." onChange={handleFilterChange} value={filters.tenLamSan} />
                
                {/* Cải tiến: Dùng select cho Tỉnh và Trạng thái */}
                <select name="tinhThanhPho" onChange={handleFilterChange} value={filters.tinhThanhPho}>
                    <option value="">Tất cả Tỉnh (TP)</option>
                    {uniqueProvinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                    ))}
                </select>

                <select name="trangThai" onChange={handleFilterChange} value={filters.trangThai}>
                    <option value="">Tất cả trạng thái</option>
                    {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
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
                            <tr key={item._id || (item.farmId + item.tenLamSan)}>
                                <td className="highlight-col">{item.tenLamSan}</td>
                                <td>{item.khoiLuong}</td>
                                <td>{item.donViTinh}</td>
                                <td>{item.nguonGocGo}</td>
                                <td>{item.ngayDangKyLamSan ? new Date(item.ngayDangKyLamSan).toLocaleDateString('vi-VN') : ''}</td>
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