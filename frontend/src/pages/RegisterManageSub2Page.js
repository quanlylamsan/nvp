import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import './RegisterManageSub2Page.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// Cấu hình cột ban đầu
const initialColumnsConfig = {
    tenCoSo: { id: 'tenCoSo', label: 'Tên cơ sở', visible: true, minWidth: '180px' },
    loaiCoSoDangKy: { id: 'loaiCoSoDangKy', label: 'Loại Cơ Sở', visible: true, minWidth: '180px' },
    tinhThanhPho: { id: 'tinhThanhPho', label: 'Tỉnh (TP)', visible: true, minWidth: '100px' },
    xaPhuong: { id: 'xaPhuong', label: 'Xã (Phường)', visible: true, minWidth: '100px' },
    diaChiCoSo: { id: 'diaChiCoSo', label: 'Địa chỉ cơ sở', visible: true, minWidth: '220px' },
    tenNguoiDaiDien: { id: 'tenNguoiDaiDien', label: 'Người đại diện', visible: true, minWidth: '150px' },
    trangThai: { id: 'trangThai', label: 'Trạng thái', visible: true, minWidth: '100px' },
    actions: { id: 'actions', label: 'Hành động', visible: true, width: '220px', minWidth: '220px' },
    vido: { id: 'vido', label: 'Vĩ độ', visible: false, minWidth: '80px' },
    kinhdo: { id: 'kinhdo', label: 'Kinh độ', visible: false, minWidth: '80px' },
    ngayThanhLap: { id: 'ngayThanhLap', label: 'Ngày thành lập', visible: false, minWidth: '100px' },
    giayPhepKinhDoanh: { id: 'giayPhepKinhDoanh', label: 'Số GPKD', visible: false, minWidth: '100px' },
};

function BreedingFarmListPage() {
    // === PHẦN KHAI BÁO STATE ===
    const [allFarms, setAllFarms] = useState([]); // State lưu trữ TOÀN BỘ danh sách từ API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States cho các bộ lọc
    const [filter, setFilter] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedTrangThai, setSelectedTrangThai] = useState('');
    const [selectedLoaiCoSoDangKy, setSelectedLoaiCoSoDangKy] = useState('Đăng ký cơ sở gây nuôi động vật');

    // States cho các giá trị duy nhất trong bộ lọc
    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueTrangThai, setUniqueTrangThai] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // States cho bảng và phân trang
    const [columns, setColumns] = useState(initialColumnsConfig);
    const [showColumnOptions, setShowColumnOptions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // === PHẦN QUẢN LÝ CỘT (Lưu và tải từ localStorage) ===
    useEffect(() => {
        try {
            const savedColumns = localStorage.getItem('tableColumnsVisibility_BreedingFarms'); // Key duy nhất cho trang này
            if (savedColumns) {
                const parsedSavedColumns = JSON.parse(savedColumns);
                const mergedColumns = Object.keys(initialColumnsConfig).reduce((acc, key) => {
                    const savedCol = parsedSavedColumns.find(sCol => sCol.id === key);
                    acc[key] = savedCol ? { ...initialColumnsConfig[key], visible: savedCol.visible } : initialColumnsConfig[key];
                    return acc;
                }, {});
                setColumns(mergedColumns);
            }
        } catch (err) {
            console.error("Lỗi khi tải trạng thái cột từ localStorage:", err);
            setColumns(initialColumnsConfig);
        }
    }, []);

    useEffect(() => {
        try {
            const columnsToSave = Object.values(columns).map(({ id, visible }) => ({ id, visible }));
            localStorage.setItem('tableColumnsVisibility_BreedingFarms', JSON.stringify(columnsToSave));
        } catch (err) {
            console.error("Lỗi khi lưu trạng thái cột vào localStorage:", err);
        }
    }, [columns]);

    // === PHẦN TẢI DỮ LIỆU (Tối ưu: Chỉ gọi API một lần) ===
    useEffect(() => {
        const fetchAllFarms = async () => {
            if (!token) {
                navigate('/');
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/farms`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        farmType: 'Đăng ký cơ sở gây nuôi động vật',
                        limit: 2000 // Lấy một lượng lớn dữ liệu để xử lý ở client
                    }
                });
                const fetchedData = response.data || [];
                if (Array.isArray(fetchedData)) {
                    setAllFarms(fetchedData);
                    // Tối ưu: Lấy giá trị duy nhất cho bộ lọc từ dữ liệu vừa tải về
                    setUniqueProvinces([...new Set(fetchedData.map(f => f.tinhThanhPho).filter(Boolean))].sort());
                    setUniqueTrangThai([...new Set(fetchedData.map(f => f.trangThai).filter(Boolean))].sort());
                } else {
                    setError("Định dạng dữ liệu từ server không đúng.");
                    setAllFarms([]);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh sách cơ sở:", err);
                setError('Không thể tải danh sách cơ sở. Vui lòng thử lại.');
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAllFarms();
    }, [token, navigate]);

    // === PHẦN LỌC DỮ LIỆU (Tối ưu: Lọc ở client-side) ===
    const filteredFarms = useMemo(() => {
        return allFarms.filter(f => {
            const searchLower = filter.toLowerCase();
            // Logic tìm kiếm chung đơn giản hơn
            const generalMatch = !filter || Object.values(f).some(val =>
                String(val).toLowerCase().includes(searchLower)
            );
            const provinceMatch = !selectedProvince || f.tinhThanhPho === selectedProvince;
            const trangThaiMatch = !selectedTrangThai || selectedTrangThai === 'all' || f.trangThai === selectedTrangThai;

            return generalMatch && provinceMatch && trangThaiMatch;
        });
    }, [allFarms, filter, selectedProvince, selectedTrangThai]);


    // === PHẦN HÀNH ĐỘNG VÀ PHÂN TRANG ===
    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/farms/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllFarms(prev => prev.filter(f => f._id !== id));
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                alert('Xóa thất bại!');
            }
        }
    }, [token]);

    const handleEdit = (id) => navigate(`/edit-farm/${id}`);
    const handleView = (id) => navigate(`/farm-details/${id}`);
	const handleAddProduct = (farmId) => navigate(`/farm/${farmId}/add-product`);
    const currentItems = filteredFarms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredFarms.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => { if (currentPage < totalPages) { setCurrentPage(currentPage + 1); } };
    const prevPage = () => { if (currentPage > 1) { setCurrentPage(currentPage - 1); } };
    const handleColumnToggle = (columnKey) => {
        setColumns(prev => ({ ...prev, [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible } }));
    };
    const handleSelectAllColumns = () => {
        setColumns(prev => {
            const newCols = { ...prev };
            Object.keys(newCols).forEach(key => newCols[key].visible = true);
            return newCols;
        });
    };
    const handleDeselectAllColumns = () => {
        setColumns(prev => {
            const newCols = { ...prev };
            Object.keys(newCols).forEach(key => newCols[key].id !== 'actions' ? newCols[key].visible = false : newCols[key].visible = true);
            return newCols;
        });
    };

    const handleExportExcel = () => {
        const columnsToExport = Object.values(columns).filter(col => col.visible && col.id !== 'actions');
        const dataToExport = filteredFarms.map(farm => {
            const rowData = {};
            columnsToExport.forEach(col => {
                let value = farm[col.id];
                if (['ngayThanhLap', 'ngayCapCCCD'].includes(col.id)) {
                    value = value ? new Date(value).toLocaleDateString() : '';
                }
                rowData[col.label] = value;
            });
            return rowData;
        });
        if (dataToExport.length === 0) {
            alert("Không có dữ liệu để xuất Excel.");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "DanhSachCoSoGayNuoi");
        XLSX.writeFile(wb, "DanhSachCoSoGayNuoi.xlsx");
    };

    // === PHẦN HIỂN THỊ (RENDER) ===
    if (loading) return <div className="farm-list-container"><h2>Đang tải danh sách cơ sở...</h2></div>;
    if (error) return <div className="farm-list-container"><h2 style={{ color: 'red' }}>Lỗi: {error}</h2></div>;

    return (
        <div className="farm-list-container">
            <h2>📋 Danh sách Cơ sở gây nuôi động vật</h2>
            <div className="filter-container">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm chung..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
                    <option value="">Tất cả Tỉnh (TP)</option>
                    {uniqueProvinces.map(p => (<option key={p} value={p}>{p}</option>))}
                </select>
                <select value={selectedTrangThai} onChange={e => setSelectedTrangThai(e.target.value)}>
                    <option value="" disabled>Chọn trạng thái</option>
                    <option value="all">Tất cả Trạng thái</option>
                    {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
                <button onClick={() => setShowColumnOptions(!showColumnOptions)} className="toggle-columns-button">
                    {showColumnOptions ? 'Ẩn tùy chọn' : 'Hiện/Ẩn Cột'}
                </button>
                <button onClick={handleExportExcel} className="export-excel-button">Xuất Excel</button>
            </div>

            {showColumnOptions && (
                <div className="column-options-container">
                    <h3>Chọn cột hiển thị:</h3>
                    <div className="column-options-grid">
                        {Object.keys(columns).map(key => (
                            <label key={key}>
                                <input type="checkbox" checked={columns[key].visible} onChange={() => handleColumnToggle(key)} />
                                {columns[key].label}
                            </label>
                        ))}
                    </div>
                    <div className="column-control-buttons">
                        <button onClick={handleSelectAllColumns}>Chọn tất cả</button>
                        <button onClick={handleDeselectAllColumns}>Bỏ chọn tất cả</button>
                    </div>
                </div>
            )}

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
 						   {col.id === 'actions' ? (
 						     <div className="action-buttons-cell">
 						       <button
  						        onClick={() => handleView(item._id)}
 						         className="action-button view-button"
 						         title="Xem chi tiết"
						        >👁️</button>

 						       <button
 						         onClick={() => handleEdit(item._id)}
 						         className="action-button edit-button"
						          title="Chỉnh sửa"
 						       >✏️</button>

 						       {false && (
						          <button
 						           onClick={() => handleDelete(item._id)}
						            className="action-button delete-button"
  						          title="Xoá"
  						        >🗑️</button> // Tạm ẩn
 						       )}

 						       <button
 						         onClick={() => handleAddProduct(item._id)}
 						         className="action-button add-product-button"
 						         title="Thêm Lâm sản mới"
						        >
						          ➕🌲
 						       </button>
 						     </div>
						    ) : col.id === 'products' ? (
 						     item.products?.map(p => p.tenLamSan).join(', ') || 'Chưa có'
						    ) : (
 						     ['ngayThanhLap', 'ngayCapCCCD'].includes(col.id)
						        ? (item[col.id] ? new Date(item[col.id]).toLocaleDateString() : '')
 						       : item[col.id]
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
                            <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">«</button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">»</button>
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

export default BreedingFarmListPage;
