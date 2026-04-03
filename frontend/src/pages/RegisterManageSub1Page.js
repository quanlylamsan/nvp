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
    const [rawFarms, setRawFarms] = useState([]); // State lưu trữ danh sách GỐC từ API
    // NEW: States để lưu danh sách tra cứu Tỉnh và Xã
    const [provinces, setProvinces] = useState([]);
    const [communes, setCommunes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States cho các bộ lọc
    const [filter, setFilter] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedTrangThai, setSelectedTrangThai] = useState('');
    const [selectedLoaiHinhCheBienGo, setSelectedLoaiHinhCheBienGo] = useState('');
    const [selectedNguonGocGo, setSelectedNguonGocGo] = useState('');
    const [selectedNganhNgheKinhDoanhGo, setSelectedNganhNgheKinhDoanhGo] = useState('');
    const [selectedLoaiCoSoDangKy, setSelectedLoaiCoSoDangKy] = useState('Đăng ký cơ sở kinh doanh, chế biến gỗ');

    // States cho các giá trị duy nhất trong bộ lọc
    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueTrangThai, setUniqueTrangThai] = useState([]);
    const [uniqueLoaiHinhCheBienGo, setUniqueLoaiHinhCheBienGo] = useState([]);
    const [uniqueNguonGocGo, setUniqueNguonGocGo] = useState([]);
    const [uniqueNganhNgheKinhDoanhGo, setUniqueNganhNgheKinhDoanhGo] = useState([]);
    const [uniqueLoaiCoSoDangKy, setUniqueLoaiCoSoDangKy] = useState([]);

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

    // === PHẦN TẢI DỮ LIỆU ===
    // MODIFIED: Hàm này giờ sẽ tải cả danh sách cơ sở, tỉnh và xã
const fetchData = useCallback(async () => {
    if (!token) {
        navigate('/');
        return;
    }
    setLoading(true);
    setError(null);
    try {
        // Sử dụng Promise.all để tải đồng thời 3 nguồn dữ liệu
        const [farmsResponse, provincesResponse, communesResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/farms`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { farmType: 'Đăng ký cơ sở kinh doanh, chế biến gỗ', limit: 2000 }
            }),

            // ĐÃ SỬA: Cập nhật đường dẫn để khớp với server.js
            axios.get(`${API_BASE_URL}/api/master-product-list/provinces`, { headers: { Authorization: `Bearer ${token}` } }),
            
            // ĐÃ SỬA: Cập nhật đường dẫn để khớp với server.js
            axios.get(`${API_BASE_URL}/api/master-product-list/communes`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        // Phần còn lại của hàm không thay đổi
        const fetchedFarms = farmsResponse.data || [];
        const fetchedProvinces = provincesResponse.data || [];
        const fetchedCommunes = communesResponse.data || [];

        if (Array.isArray(fetchedFarms) && Array.isArray(fetchedProvinces) && Array.isArray(fetchedCommunes)) {
            setRawFarms(fetchedFarms);
            setProvinces(fetchedProvinces);
            setCommunes(fetchedCommunes);
        } else {
            setError("Định dạng dữ liệu từ server không đúng.");
        }
    } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            navigate('/');
        }
    } finally {
        setLoading(false);
    }
}, [token, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // === NEW: PHẦN LÀM GIÀU DỮ LIỆU (DATA ENRICHMENT) ===
    // Kết hợp dữ liệu gốc với tên Tỉnh/Xã để hiển thị
    const enrichedWoods = useMemo(() => {
        // Tạo map để tra cứu nhanh (hiệu năng tốt hơn)
        const provinceMap = new Map(provinces.map(p => [p.code, p.name]));
        const communeMap = new Map(communes.map(c => [c.code, c.name]));

        return rawFarms.map(farm => ({
            ...farm,
            // Ghi đè trường tinhThanhPho và xaPhuong bằng tên đầy đủ
            // Nếu không tìm thấy, sẽ giữ lại mã code cũ để tránh lỗi
            tinhThanhPho: provinceMap.get(farm.province) || farm.province,
            xaPhuong: communeMap.get(farm.commune) || farm.commune,
        }));
    }, [rawFarms, provinces, communes]);

    // MODIFIED: Cập nhật các bộ lọc để lấy giá trị từ dữ liệu đã được làm giàu
    useEffect(() => {
        if(enrichedWoods.length > 0) {
            setUniqueProvinces([...new Set(enrichedWoods.map(f => f.tinhThanhPho).filter(Boolean))].sort());
            setUniqueTrangThai([...new Set(enrichedWoods.map(f => f.trangThai).filter(Boolean))].sort());
            setUniqueLoaiHinhCheBienGo([...new Set(enrichedWoods.map(f => f.loaiHinhCheBienGo).filter(Boolean))].sort());
            setUniqueNguonGocGo([...new Set(enrichedWoods.map(f => f.nguonGocGo).filter(Boolean))].sort());
            setUniqueNganhNgheKinhDoanhGo([...new Set(enrichedWoods.map(f => f.nganhNgheKinhDoanhGo).filter(Boolean))].sort());
            setUniqueLoaiCoSoDangKy([...new Set(enrichedWoods.map(f => f.loaiCoSoDangKy).filter(Boolean))].sort());
        }
    }, [enrichedWoods]);


    // === PHẦN LỌC DỮ LIỆU ===
    // MODIFIED: Lọc trên dữ liệu đã được làm giàu `enrichedWoods`
    const filteredWoods = useMemo(() => {
        return enrichedWoods.filter(f => {
            const searchLower = filter.toLowerCase();
            // Tìm kiếm chung trên cả dữ liệu đã làm giàu
            const generalMatch = !filter || Object.values(f).some(val =>
                String(val).toLowerCase().includes(searchLower)
            );
            const provinceMatch = !selectedProvince || f.tinhThanhPho === selectedProvince;
            const trangThaiMatch = !selectedTrangThai || selectedTrangThai === 'all' || f.trangThai === selectedTrangThai;
            const loaiHinhCheBienGoMatch = !selectedLoaiHinhCheBienGo || f.loaiHinhCheBienGo === selectedLoaiHinhCheBienGo;
            const nguonGocGoMatch = !selectedNguonGocGo || f.nguonGocGo === selectedNguonGocGo;
            const nganhNgheKinhDoanhGoMatch = !selectedNganhNgheKinhDoanhGo || f.nganhNgheKinhDoanhGo === selectedNganhNgheKinhDoanhGo;
            const loaiCoSoMatch = !selectedLoaiCoSoDangKy || f.loaiCoSoDangKy === selectedLoaiCoSoDangKy;

            return generalMatch && provinceMatch && trangThaiMatch && loaiHinhCheBienGoMatch && nguonGocGoMatch && nganhNgheKinhDoanhGoMatch && loaiCoSoMatch;
        });
    }, [enrichedWoods, filter, selectedProvince, selectedTrangThai, selectedLoaiHinhCheBienGo, selectedNguonGocGo, selectedNganhNgheKinhDoanhGo, selectedLoaiCoSoDangKy]);


    // === PHẦN HÀNH ĐỘNG VÀ PHÂN TRANG ===
    const handleDelete = useCallback(async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/farms/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // MODIFIED: Cập nhật lại state gốc `rawFarms`
                setRawFarms(prev => prev.filter(f => f._id !== id));
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                alert('Xóa thất bại!');
            }
        }
    }, [token]);

    const handleEdit = (id) => navigate(`/edit-wood/${id}`);
    const handleNavigateToWoodDetail = (id) => navigate(`/admin/woods/${id}`);
    
    const totalPages = Math.ceil(filteredWoods.length / itemsPerPage);
    const currentItems = useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
        return filteredWoods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredWoods, currentPage, itemsPerPage, totalPages]);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    
    const handleColumnToggle = (columnKey) => {
        setColumns(prev => ({ ...prev, [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible } }));
    };

    const handleSelectAllColumns = () => {
        const allVisible = Object.keys(columns).reduce((acc, key) => {
            acc[key] = { ...columns[key], visible: true };
            return acc;
        }, {});
        setColumns(allVisible);
    };

    const handleDeselectAllColumns = () => {
        const allHidden = Object.keys(columns).reduce((acc, key) => {
            const isVisible = key === 'actions';
            acc[key] = { ...columns[key], visible: isVisible };
            return acc;
        }, {});
        setColumns(allHidden);
    };

    const openAddProductModal = (farmId) => {
        setSelectedFarmId(farmId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFarmId(null);
    };

    const handleProductAdded = () => {
        fetchData(); // Gọi lại hàm fetch data chính
    };

    const handleExportExcel = () => {
        const dataToExport = filteredWoods.map(item => ({
            'Tỉnh (TP)': item.tinhThanhPho, // Đã có tên đầy đủ
            'Xã (Phường)': item.xaPhuong, // Đã có tên đầy đủ
            'Địa chỉ cơ sở': item.diaChiCoSo,
            'Tên cơ sở': item.tenCoSo,
            'Lâm sản': item.products?.map(p => p.tenLamSan).join(', ') || 'Chưa có',
            'Người đại diện': item.tenNguoiDaiDien,
            'Trạng thái': item.trangThai
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachCoSo");
        XLSX.writeFile(workbook, "DanhSachCoSoGo.xlsx");
    };

    // === PHẦN HIỂN THỊ (RENDER) ===
    // Không có thay đổi lớn ở phần render, nó sẽ tự động hiển thị dữ liệu đã được làm giàu
    if (loading) return <div className="farm-list-container"><h2>Đang tải dữ liệu...</h2></div>;
    if (error) return <div className="farm-list-container"><h2 style={{ color: 'red' }}>Lỗi: {error}</h2></div>;

    return (
        <div className="farm-list-container">
            <h2>Cơ sở kinh doanh, chế biến gỗ🪵</h2>
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
                    <option value="all">Tất cả Trạng thái</option>
                    {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
                <select value={selectedLoaiCoSoDangKy} onChange={e => setSelectedLoaiCoSoDangKy(e.target.value)}>
                    <option value="">Đăng ký cơ sở kinh doanh, chế biến gỗ</option>
                    {uniqueLoaiCoSoDangKy.map(type => (<option key={type} value={type}>{type}</option>))}
                </select>
                <button onClick={() => setShowColumnOptions(!showColumnOptions)}>Tùy chỉnh Cột</button>
                <button onClick={handleExportExcel} className="export-excel-button">Xuất Excel</button>
            </div>

            {/* Phần tùy chọn cột */}
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

            {/* Bảng hiển thị dữ liệu */}
            {filteredWoods.length === 0 ? (
                <p>Không có cơ sở nào phù hợp.</p>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="farm-table">
                            <thead>
                                <tr>
                                    {Object.values(columns).map(col => col.visible && (
                                        <th key={col.id} style={{ minWidth: col.minWidth, width: col.width }}>{col.label}</th>
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
                                                        <button onClick={() => handleNavigateToWoodDetail(item._id)} className="action-button view-button" title="Xem chi tiết">👁️</button>
                                                        <button onClick={() => handleEdit(item._id)} className="action-button edit-button" title="Sửa">✏️</button>
                                                        {false && (<button onClick={() => handleDelete(item._id)} className="action-button delete-button" title="Xóa">🗑️</button>)}
                                                        <button onClick={() => openAddProductModal(item._id)} className="action-button add-product-button" title="Thêm Lâm sản mới">➕🪵</button>
                                                    </div>
													) : col.id === 'products' ? (
													    (() => {
													        // Gộp cả sản phẩm gỗ và sản phẩm động vật vào một danh sách
 													       const allProducts = [
													            ...(item.woodProducts || []),
													            ...(item.animalProducts || [])
													        ];

													        // Nếu không có sản phẩm nào, hiển thị 'Chưa có'
 													       if (allProducts.length === 0) {
 													           return 'Chưa có';
													        }

 													       // Nếu có, lấy tên của tất cả sản phẩm và nối chúng lại
													        return allProducts.map(p => p.tenLamSan).join(', ');
													    })()
													) : (
                                                    // Dữ liệu ở đây `item[col.id]` đã là tên đầy đủ
                                                    ['ngayThanhLap', 'ngayCapCCCD'].includes(col.id) ? (item[col.id] ? new Date(item[col.id]).toLocaleDateString('vi-VN') : '') : item[col.id]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="pagination-container">
                         <div className="pagination-info">
                             Hiển thị {filteredWoods.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredWoods.length)} trên tổng số {filteredWoods.length} bản ghi
                         </div>
                         <div className="pagination-controls">
                             <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">«</button>
                             <span> Trang {currentPage} / {totalPages || 1} </span>
                             <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="pagination-button">»</button>
                         </div>
                         <div className="items-per-page">
                             <select value={itemsPerPage} onChange={(e) => {
                                 setItemsPerPage(Number(e.target.value));
                                 setCurrentPage(1);
                             }}>
                                 <option value="5">5 / trang</option>
                                 <option value="10">10 / trang</option>
                                 <option value="15">15 / trang</option>
                                 <option value="20">20 / trang</option>
                                 <option value="50">50 / trang</option>
                             </select>
                         </div>
                     </div>
                </>
            )}

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