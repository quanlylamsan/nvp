// src/pages/Googlemaps.js
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Tối ưu: Dùng context

import './Googlemaps.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// Cấu hình cột ban đầu
const initialColumnsConfig = {
    tinhThanhPho: { id: 'tinhThanhPho', label: 'Tỉnh (TP)', visible: true, minWidth: '130px' },
    xaPhuong: { id: 'xaPhuong', label: 'Xã (Phường)', visible: true, minWidth: '150px' },
    diaChiCoSo: { id: 'diaChiCoSo', label: 'Địa chỉ cơ sở', visible: true, minWidth: '250px' },
    tenCoSo: { id: 'tenCoSo', label: 'Tên cơ sở', visible: true, minWidth: '250px' },
    tenNguoiDaiDien: { id: 'tenNguoiDaiDien', label: 'Người đại diện', visible: true, minWidth: '180px' },
    trangThai: { id: 'trangThai', label: 'Trạng thái', visible: true, minWidth: '100px' },
    mapLink: { id: 'mapLink', label: 'Bản đồ', visible: true, minWidth: '80px' },
};

function GoogleMapsPage() {
    // === PHẦN KHAI BÁO STATE ===
    const [allFarms, setAllFarms] = useState([]); // State lưu trữ TOÀN BỘ danh sách từ API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- BƯỚC 1 ĐỂ THÊM BỘ LỌC MỚI: Khai báo state cho bộ lọc ---
    // Ví dụ: const [selectedMyFilter, setSelectedMyFilter] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCommune, setSelectedCommune] = useState('');
    const [selectedLoaiCoSoDangKy, setSelectedLoaiCoSoDangKy] = useState('');
    const [selectedTrangThai, setSelectedTrangThai] = useState('');

    // --- Cũng trong BƯỚC 1: Khai báo state cho các giá trị duy nhất của bộ lọc ---
    // Ví dụ: const [uniqueMyFilterValues, setUniqueMyFilterValues] = useState([]);
    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueCommunes, setUniqueCommunes] = useState([]);
    const [uniqueLoaiCoSoDangKy, setUniqueLoaiCoSoDangKy] = useState([]);
    const [uniqueTrangThai, setUniqueTrangThai] = useState([]);

    const navigate = useNavigate();
    const { auth } = useAuth();
    const token = auth?.token;

    // States cho bảng và phân trang
    const [columns, setColumns] = useState(initialColumnsConfig);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // === PHẦN TẢI DỮ LIỆU (Tối ưu: Chỉ gọi API một lần) ===
    useEffect(() => {
        const fetchAllFarms = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/farms`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 2000 } // Lấy một lượng lớn dữ liệu để xử lý ở client
                });
                const fetchedData = response.data || [];
                if (Array.isArray(fetchedData)) {
                    setAllFarms(fetchedData);
                    
                    // --- BƯỚC 2 ĐỂ THÊM BỘ LỌC MỚI: Lấy và set các giá trị duy nhất từ dữ liệu ---
                    // Ví dụ: setUniqueMyFilterValues([...new Set(fetchedData.map(f => f.myFilterField).filter(Boolean))].sort());
                    setUniqueProvinces([...new Set(fetchedData.map(f => f.tinhThanhPho).filter(Boolean))].sort());
                    setUniqueCommunes([...new Set(fetchedData.map(f => f.xaPhuong).filter(Boolean))].sort());
                    setUniqueLoaiCoSoDangKy([...new Set(fetchedData.map(f => f.loaiCoSoDangKy).filter(Boolean))].sort());
                    setUniqueTrangThai([...new Set(fetchedData.map(f => f.trangThai).filter(Boolean))].sort());

                } else {
                    setError("Định dạng dữ liệu từ server không đúng.");
                    setAllFarms([]);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách cơ sở:", err);
                setError('Không thể tải danh sách cơ sở. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllFarms();
    }, [token, navigate]);

    // === PHẦN LỌC DỮ LIỆU (Tối ưu: Lọc ở client-side) ===
    const filteredFarms = useMemo(() => {
        return allFarms.filter(f => {
            // --- BƯỚC 3 ĐỂ THÊM BỘ LỌC MỚI: Thêm điều kiện lọc vào đây ---
            // Ví dụ: const myFilterMatch = !selectedMyFilter || f.myFilterField === selectedMyFilter;
            const searchLower = filter.toLowerCase();
            const generalMatch = !filter || Object.values(f).some(val => String(val).toLowerCase().includes(searchLower));
            const provinceMatch = !selectedProvince || f.tinhThanhPho === selectedProvince;
            const communeMatch = !selectedCommune || f.xaPhuong === selectedCommune;
            const loaiCoSoMatch = !selectedLoaiCoSoDangKy || f.loaiCoSoDangKy === selectedLoaiCoSoDangKy;
            const trangThaiMatch = !selectedTrangThai || selectedTrangThai === 'all' || f.trangThai === selectedTrangThai;

            // --- Và thêm biến điều kiện vào câu lệnh return ---
            // Ví dụ: return generalMatch && provinceMatch && ... && myFilterMatch;
            return generalMatch && provinceMatch && communeMatch && loaiCoSoMatch && trangThaiMatch;
        });
    }, [allFarms, filter, selectedProvince, selectedCommune, selectedLoaiCoSoDangKy, selectedTrangThai]); // Nhớ thêm state của bộ lọc mới vào đây

    // === PHẦN HÀNH ĐỘNG VÀ PHÂN TRANG ===
    const handleNavigateToMap = (lat, lon) => {
        if (lat && lon) {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
            window.open(mapUrl, '_blank');
        } else {
            alert('Không có thông tin vĩ độ hoặc kinh độ cho cơ sở này.');
        }
    };

    const currentItems = filteredFarms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredFarms.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    // === PHẦN HIỂN THỊ (RENDER) ===
    if (loading) return <div className="farm-list-container"><h2>Đang tải dữ liệu bản đồ...</h2></div>;
    if (error) return <div className="farm-list-container"><h2 style={{ color: 'red' }}>Lỗi: {error}</h2></div>;

    return (
        <div className="farm-list-container">
            <h2>🗺️ ĐIỀU HƯỚNG BẢN ĐỒ CƠ SỞ GOOGLE MAPS 🗺️</h2>
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm chung..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <select value={selectedLoaiCoSoDangKy} onChange={e => setSelectedLoaiCoSoDangKy(e.target.value)}>
                    <option value="">Tất cả loại cơ sở</option>
                    {uniqueLoaiCoSoDangKy.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
                <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
                    <option value="">Tất cả Tỉnh (TP)</option>
                    {uniqueProvinces.map(p => (<option key={p} value={p}>{p}</option>))}
                </select>
                <select value={selectedCommune} onChange={e => setSelectedCommune(e.target.value)}>
                    <option value="">Tất cả Xã (Phường)</option>
                    {uniqueCommunes.map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
                <select value={selectedTrangThai} onChange={e => setSelectedTrangThai(e.target.value)}>
                    <option value="">Tất cả Trạng thái</option>
                    {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
                
                {/* --- BƯỚC 4 ĐỂ THÊM BỘ LỌC MỚI: Thêm thẻ <select> vào đây ---
                    <select value={selectedMyFilter} onChange={e => setSelectedMyFilter(e.target.value)}>
                        <option value="">Tất cả...</option>
                        {uniqueMyFilterValues.map(val => (<option key={val} value={val}>{val}</option>))}
                    </select>
                */}
            </div>

            {filteredFarms.length === 0 ? (
                <p>Không có cơ sở nào phù hợp.</p>
            ) : (
                <>
                    <table className="farm-table">
                        <thead>
                            <tr>
                                {Object.values(columns).map(col => col.visible && (
                                    <th key={col.id} style={{ minWidth: col.minWidth }}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item) => (
                                <tr key={item._id}>
                                    {Object.values(columns).map(col => col.visible && (
                                        <td key={col.id}>
                                            {col.id === 'mapLink' ? (
                                                <button onClick={() => handleNavigateToMap(item.vido, item.kinhdo)} className="action-button view-button">
                                                    Mở
                                                </button>
                                            ) : (
                                                item[col.id]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-container">
                        <div className="pagination-info">
                            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredFarms.length)} / {filteredFarms.length} bản ghi
                        </div>
                        <div className="pagination-controls">
                            <button onClick={prevPage} disabled={currentPage === 1}>«</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={nextPage} disabled={currentPage === totalPages}>»</button>
                        </div>
                        <div className="items-per-page">
                            <select value={itemsPerPage} onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}>
                                <option value="5">5 bản ghi/trang</option>
                                <option value="10">10 bản ghi/trang</option>
                                <option value="15">15 bản ghi/trang</option>
                                <option value="20">20 bản ghi/trang</option>
                                <option value="50">50 bản ghi/trang</option>
                            </select>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default GoogleMapsPage;
