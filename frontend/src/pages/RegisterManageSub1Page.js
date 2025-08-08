import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AddProductModal from '../components/AddProductModal'; 
import './RegisterManageSub1Page.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// Cấu hình cột ban đầu
const initialColumnsConfig = {
    tinhThanhPho: { id: 'tinhThanhPho', label: 'Tỉnh (TP)', visible: true, minWidth: '100px' },
    xaPhuong: { id: 'xaPhuong', label: 'Xã (Phường)', visible: true, minWidth: '100px' },
    diaChiCoSo: { id: 'diaChiCoSo', label: 'Địa chỉ cơ sở', visible: true, minWidth: '220px' },
    tenCoSo: { id: 'tenCoSo', label: 'Tên cơ sở', visible: true, minWidth: '180px' },
    products: { id: 'products', label: 'Lâm sản', visible: true, minWidth: '200px' },
    tenNguoiDaiDien: { id: 'tenNguoiDaiDien', label: 'Người đại diện', visible: true, minWidth: '150px' },
    trangThai: { id: 'trangThai', label: 'Trạng thái', visible: true, minWidth: '100px' },
    actions: { id: 'actions', label: 'Hành động', visible: true, width: '210px', minWidth: '210px' },
};


function RegisterManageSub1Page() {
    // === PHẦN KHAI BÁO STATE ===
    const [allWoods, setAllWoods] = useState([]); // State lưu trữ TOÀN BỘ danh sách từ API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States cho các bộ lọc
    const [filter, setFilter] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedTrangThai, setSelectedTrangThai] = useState('');
    const [selectedLoaiHinhCheBienGo, setSelectedLoaiHinhCheBienGo] = useState('');
    const [selectedNguonGocGo, setSelectedNguonGocGo] = useState('');
    const [selectedNganhNgheKinhDoanhGo, setSelectedNganhNgheKinhDoanhGo] = useState('');

    // States cho các giá trị duy nhất trong bộ lọc
    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueTrangThai, setUniqueTrangThai] = useState([]);
    const [uniqueLoaiHinhCheBienGo, setUniqueLoaiHinhCheBienGo] = useState([]);
    const [uniqueNguonGocGo, setUniqueNguonGocGo] = useState([]);
    const [uniqueNganhNgheKinhDoanhGo, setUniqueNganhNgheKinhDoanhGo] = useState([]);

    // Dạng Hộp thoại để nhập thêm lâm sản
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedFarmId, setSelectedFarmId] = useState(null);
	
    
	const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // States cho bảng và phân trang
    const [columns, setColumns] = useState(initialColumnsConfig);
    const [showColumnOptions, setShowColumnOptions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
	
	const nextPage = () => {
    if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
    }
};

const prevPage = () => {
    if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
};

    // === PHẦN QUẢN LÝ CỘT (Lưu và tải từ localStorage) ===
    useEffect(() => {
        try {
            const savedColumns = localStorage.getItem('tableColumnsVisibility_RegisterManageSub1');
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
            localStorage.setItem('tableColumnsVisibility_RegisterManageSub1', JSON.stringify(columnsToSave));
        } catch (err) {
            console.error("Lỗi khi lưu trạng thái cột vào localStorage:", err);
        }
    }, [columns]);


    // === PHẦN TẢI DỮ LIỆU (Tối ưu: Chỉ gọi API một lần) ===
    useEffect(() => {
        const fetchAllWoodBusinesses = async () => {
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
                        farmType: 'Đăng ký cơ sở kinh doanh, chế biến gỗ',
                        limit: 2000 // Lấy một lượng lớn dữ liệu để xử lý ở client
                    }
                });
                const fetchedData = response.data || [];
                if (Array.isArray(fetchedData)) {
                    setAllWoods(fetchedData);
                    // Tối ưu: Lấy giá trị duy nhất cho bộ lọc từ dữ liệu vừa tải về
                    setUniqueProvinces([...new Set(fetchedData.map(f => f.tinhThanhPho).filter(Boolean))].sort());
                    setUniqueTrangThai([...new Set(fetchedData.map(f => f.trangThai).filter(Boolean))].sort());
                    setUniqueLoaiHinhCheBienGo([...new Set(fetchedData.map(f => f.loaiHinhCheBienGo).filter(Boolean))].sort());
                    setUniqueNguonGocGo([...new Set(fetchedData.map(f => f.nguonGocGo).filter(Boolean))].sort());
                    setUniqueNganhNgheKinhDoanhGo([...new Set(fetchedData.map(f => f.nganhNgheKinhDoanhGo).filter(Boolean))].sort());
                } else {
                    setError("Định dạng dữ liệu từ server không đúng.");
                    setAllWoods([]);
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
        fetchAllWoodBusinesses();
    }, [token, navigate]);

// === SỬA LỖI: TÁCH HÀM FETCH DATA ĐỂ CÓ THỂ GỌI LẠI ===
    const fetchAllWoodBusinesses = useCallback(async () => {
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
                    farmType: 'Đăng ký cơ sở kinh doanh, chế biến gỗ',
                    limit: 2000
                }
            });
            const fetchedData = response.data || [];
            if (Array.isArray(fetchedData)) {
                setAllWoods(fetchedData);
                // Lấy giá trị duy nhất cho bộ lọc
                setUniqueProvinces([...new Set(fetchedData.map(f => f.tinhThanhPho).filter(Boolean))].sort());
                // ... set các unique filter khác ...
            } else {
                setError("Định dạng dữ liệu từ server không đúng.");
                setAllWoods([]);
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
    }, [token, navigate]); // Thêm dependencies cho useCallback

    // Tải dữ liệu lần đầu khi component được mount
    useEffect(() => {
        fetchAllWoodBusinesses();
    }, [fetchAllWoodBusinesses]);

    // === PHẦN LỌC DỮ LIỆU (Tối ưu: Lọc ở client-side) ===
    const filteredWoods = useMemo(() => {
        return allWoods.filter(f => {
            const searchLower = filter.toLowerCase();
            const generalMatch = !filter || Object.values(f).some(val => 
                String(val).toLowerCase().includes(searchLower)
            );
            const provinceMatch = !selectedProvince || f.tinhThanhPho === selectedProvince;
            const trangThaiMatch = !selectedTrangThai || selectedTrangThai === 'all' || f.trangThai === selectedTrangThai;
            const loaiHinhCheBienGoMatch = !selectedLoaiHinhCheBienGo || f.loaiHinhCheBienGo === selectedLoaiHinhCheBienGo;
            const nguonGocGoMatch = !selectedNguonGocGo || f.nguonGocGo === selectedNguonGocGo;
            const nganhNgheKinhDoanhGoMatch = !selectedNganhNgheKinhDoanhGo || f.nganhNgheKinhDoanhGo === selectedNganhNgheKinhDoanhGo;

            return generalMatch && provinceMatch && trangThaiMatch && loaiHinhCheBienGoMatch && nguonGocGoMatch && nganhNgheKinhDoanhGoMatch;
        });
    }, [allWoods, filter, selectedProvince, selectedTrangThai, selectedLoaiHinhCheBienGo, selectedNguonGocGo, selectedNganhNgheKinhDoanhGo]);


    // === PHẦN HÀNH ĐỘNG VÀ PHÂN TRANG ===
    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/farms/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllWoods(prev => prev.filter(f => f._id !== id));
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                alert('Xóa thất bại!');
            }
        }
    }, [token]);

    const handleEdit = (id) => navigate(`/edit-wood/${id}`);
    const handleNavigateToWoodDetail = (id) => navigate(`/admin/woods/${id}`);
    const handleNavigateToAddWoodProduct = (farmId) => navigate(`/wood/${farmId}/add-product`);

    const currentItems = filteredWoods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredWoods.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleColumnToggle = (columnKey) => {
        setColumns(prev => ({ ...prev, [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible } }));
    };
     const openAddProductModal = (farmId) => {
        setSelectedFarmId(farmId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFarmId(null);
    };

    // Hàm này sẽ được gọi sau khi thêm sản phẩm thành công để làm mới danh sách
    const handleProductAdded = () => {
        // Bây giờ có thể gọi lại hàm fetch data một cách an toàn
        fetchAllWoodBusinesses();
    };
    
    const handleExportExcel = () => {
        // ... (Giữ nguyên logic xuất Excel của bạn, đảm bảo nó dùng `filteredWoods`)
    };


    // === PHẦN HIỂN THỊ (RENDER) ===
    if (loading) return <div className="farm-list-container"><h2>Đang tải danh sách cơ sở...</h2></div>;
    if (error) return <div className="farm-list-container"><h2 style={{ color: 'red' }}>Lỗi: {error}</h2></div>;

    return (
        <div className="farm-list-container">
            <h2>📋 DANH SÁCH CƠ SỞ KINH DOANH, CHẾ BIẾN GỖ 📋</h2>

            {/* Phần bộ lọc */}
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
                {/* ... Các select filter khác của bạn ... */}
                <button onClick={() => setShowColumnOptions(!showColumnOptions)} className="toggle-columns-button">
                    {showColumnOptions ? 'Ẩn tùy chọn' : 'Hiện/Ẩn Cột'}
                </button>
                <button onClick={handleExportExcel} className="export-excel-button">Xuất Excel</button>
            </div>

            {/* Phần tùy chọn cột */}
            {showColumnOptions && (
                <div className="column-options-container">
                    {/* ... Code hiển thị tùy chọn cột của bạn ... */}
                </div>
            )}

            {/* Bảng hiển thị dữ liệu */}
            {filteredWoods.length === 0 ? (
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
                                                    <button onClick={() => handleNavigateToWoodDetail(item._id)} className="action-button view-button">👁️</button>
                                                    <button onClick={() => handleEdit(item._id)} className="action-button edit-button">✏️</button>
                                                {false && (<button onClick={() => handleDelete(item._id)} className="action-button delete-button">🗑️</button> //Tạm ẩn
)}
                                                 <button onClick={() => openAddProductModal(item._id)} className="action-button add-product-button" title="Thêm Lâm sản mới">➕🪵</button>
                                                </div>
                                            ) : col.id === 'products' ? (
                                                item.products?.map(p => p.tenLamSan).join(', ') || 'Chưa có'
                                            ) : (
                                                ['ngayThanhLap', 'ngayCapCCCD'].includes(col.id) ? (item[col.id] ? new Date(item[col.id]).toLocaleDateString() : '') : item[col.id]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination-container">
                        <div className="pagination-info">
                            {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredWoods.length)} / {filteredWoods.length} bản ghi
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

            {/* Modal được đặt ở đây là hợp lý nhất */}
            <AddProductModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                farmId={selectedFarmId}
                onProductAdded={handleProductAdded}
            />
        </div>
    );
}

export default RegisterManageSub1Page;