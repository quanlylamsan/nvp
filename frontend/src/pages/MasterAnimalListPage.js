import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MasterProductListPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';
console.log("API_BASE_URL:", API_BASE_URL);

function MasterAnimalListPage() {

    const [masterData, setMasterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        tenCoSo: '',
        tinhThanhPho: '',
        tenLoai: '',
        trangThai: ''
    });

    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueStatuses, setUniqueStatuses] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // ===== LOAD DATA =====
    const fetchMasterData = useCallback(async () => {

        if (!token) {
            navigate('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {

            const response = await axios.get(
                `${API_BASE_URL}/api/master-animal-list`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const data = response.data || [];

            setMasterData(data);

            setUniqueProvinces(
                [...new Set(data.map(item => item.tinhThanhPho).filter(Boolean))].sort()
            );

            setUniqueStatuses(
                [...new Set(data.map(item => item.trangThai).filter(Boolean))].sort()
            );

        } catch (err) {

            console.error(err);

            setError("Không thể tải dữ liệu động vật.");

        } finally {

            setLoading(false);

        }

    }, [token, navigate]);

    useEffect(() => {
        fetchMasterData();
    }, [fetchMasterData]);



    // ===== FILTER =====

    const handleFilterChange = (e) => {

        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

    };



    const filteredData = useMemo(() => {

        return masterData.filter(item => {

            const tenCoSoMatch = filters.tenCoSo
                ? item.tenCoSo?.toLowerCase().includes(filters.tenCoSo.toLowerCase())
                : true;

            const tinhThanhPhoMatch = filters.tinhThanhPho
                ? item.tinhThanhPho === filters.tinhThanhPho
                : true;

            const tenLoaiMatch = filters.tenLoai
                ? item.tenLoai?.toLowerCase().includes(filters.tenLoai.toLowerCase())
                : true;

            const trangThaiMatch = filters.trangThai
                ? item.trangThai === filters.trangThai
                : true;

            return (
                tenCoSoMatch &&
                tinhThanhPhoMatch &&
                tenLoaiMatch &&
                trangThaiMatch
            );

        });

    }, [filters, masterData]);



    if (loading) {
        return (
            <div className="master-list-container">
                <h2>Đang tải dữ liệu...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="master-list-container">
                <h2 style={{ color: 'red' }}>{error}</h2>
            </div>
        );
    }



    return (

        <div className="master-list-container">

            <h1>Tổng hợp lâm sản tại các cơ sở gây nuôi động vật 🐘 </h1>


            {/* FILTER */}

            <div className="filters-panel">

                <input
                    type="text"
                    name="tenCoSo"
                    placeholder="Lọc theo tên cơ sở..."
                    onChange={handleFilterChange}
                    value={filters.tenCoSo}
                />

                <input
                    type="text"
                    name="tenLoai"
                    placeholder="Lọc theo tên loài..."
                    onChange={handleFilterChange}
                    value={filters.tenLoai}
                />

                <select
                    name="tinhThanhPho"
                    onChange={handleFilterChange}
                    value={filters.tinhThanhPho}
                >

                    <option value="">Tất cả tỉnh</option>

                    {uniqueProvinces.map(p => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}

                </select>


                <select
                    name="trangThai"
                    onChange={handleFilterChange}
                    value={filters.trangThai}
                >

                    <option value="">Tất cả trạng thái</option>

                    {uniqueStatuses.map(s => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}

                </select>

            </div>



            {/* TABLE */}

            <div className="table-wrapper">

                <table className="master-table">

                    <thead>

                        <tr>

                            <th>Tên Loài</th>
                            <th>Tên khoa học</th>

                            <th>Đực bố mẹ</th>
                            <th>Cái bố mẹ</th>

                            <th>Hậu bị đực</th>
                            <th>Hậu bị cái</th>

                            <th>Dưới 1 tuổi</th>
                            <th>Trên 1 tuổi</th>

                            <th>Tên Cơ sở</th>
                            <th>Tỉnh</th>

                            <th>Địa chỉ</th>
                            <th>Trạng thái</th>

                            <th>Người đại diện</th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredData.length > 0 ? (

                            filteredData.map(item => (

                                <tr key={item._id || (item.farmId + item.tenLoai)}>

                                    <td className="highlight-col">
                                        {item.tenLoai}
                                    </td>

                                    <td>{item.tenKhoaHoc}</td>

                                    <td>{item.danBoMeDuc}</td>
                                    <td>{item.danBoMeCai}</td>

                                    <td>{item.danHauBiDuc}</td>
                                    <td>{item.danHauBiCai}</td>

                                    <td>{item.duoiMotTuoi}</td>
                                    <td>{item.trenMotTuoi}</td>

                                    <td className="highlight-col">
                                        {item.tenCoSo}
                                    </td>

                                    <td>{item.tinhThanhPho}</td>

                                    <td>{item.diaChiCoSo}</td>

                                    <td>{item.trangThai}</td>

                                    <td>{item.tenNguoiDaiDien}</td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td colSpan="13" style={{ textAlign: 'center' }}>
                                    Không có dữ liệu
                                </td>

                            </tr>

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );
}

export default MasterAnimalListPage;