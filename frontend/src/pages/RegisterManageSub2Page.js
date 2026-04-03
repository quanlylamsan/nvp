import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AddBreedingProductModal from '../components/AddBreedingProductModal';
import './RegisterManageSub1Page.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// Initial column configuration
const initialColumnsConfig = {
    tinhThanhPho: { id: 'tinhThanhPho', label: 'Tỉnh (TP)', visible: true, minWidth: '100px' },
    xaPhuong: { id: 'xaPhuong', label: 'Xã (Phường)', visible: true, minWidth: '100px' },
    diaChiCoSo: { id: 'diaChiCoSo', label: 'Địa chỉ cơ sở', visible: true, minWidth: '180px' },
    tenCoSo: { id: 'tenCoSo', label: 'Tên cơ sở', visible: true, minWidth: '180px' },
    animalProducts: { id: 'animalProducts', label: 'Lâm sản', visible: true, minWidth: '200px' },
    tenNguoiDaiDien: { id: 'tenNguoiDaiDien', label: 'Người đại diện', visible: true, minWidth: '150px' },
    trangThai: { id: 'trangThai', label: 'Trạng thái', visible: true, minWidth: '100px' },
    actions: { id: 'actions', label: 'Hành động', visible: true, width: '210px', minWidth: '210px' },
};

function RegisterManageSub2Page() {
    // === STATE DECLARATIONS ===
    const [rawFarms, setRawFarms] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedTrangThai, setSelectedTrangThai] = useState('');
    const [uniqueProvinces, setUniqueProvinces] = useState([]);
    const [uniqueTrangThai, setUniqueTrangThai] = useState([]);
    const [isBreedingModalOpen, setIsBreedingModalOpen] = useState(false);
    const [selectedFarmId, setSelectedFarmId] = useState(null);
    const [columns, setColumns] = useState(initialColumnsConfig);
    const [showColumnOptions, setShowColumnOptions] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
	const [selectedLoaiCoSoDangKy, setSelectedLoaiCoSoDangKy] = useState('Đăng ký cơ sở gây nuôi');

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // === COLUMN MANAGEMENT ===
    useEffect(() => {
        const savedColumns = localStorage.getItem('tableColumnsVisibility_BreedingFarms');
        if (savedColumns) {
            const parsedSavedColumns = JSON.parse(savedColumns);
            const mergedColumns = Object.keys(initialColumnsConfig).reduce((acc, key) => {
                const savedCol = parsedSavedColumns.find(sCol => sCol.id === key);
                acc[key] = savedCol ? { ...initialColumnsConfig[key], visible: savedCol.visible } : initialColumnsConfig[key];
                return acc;
            }, {});
            setColumns(mergedColumns);
        }
    }, []);

    useEffect(() => {
        const columnsToSave = Object.values(columns).map(({ id, visible }) => ({ id, visible }));
        localStorage.setItem('tableColumnsVisibility_BreedingFarms', JSON.stringify(columnsToSave));
    }, [columns]);

    // === DATA FETCHING ===
    const fetchData = useCallback(async () => {
        if (!token) {
            navigate('/');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [farmsResponse, provincesResponse, communesResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/farms`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { farmType: 'Đăng ký cơ sở gây nuôi động vật', limit: 2000 }
                }),
                axios.get(`${API_BASE_URL}/api/master-product-list/provinces`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_BASE_URL}/api/master-product-list/communes`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            setRawFarms(farmsResponse.data || []);
            setProvinces(provincesResponse.data || []);
            setCommunes(communesResponse.data || []);
        } catch (err) {
            console.error("Data loading error:", err);
            setError('Could not load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // === DATA ENRICHMENT ===
    const enrichedFarms = useMemo(() => {
        if (!provinces.length || !communes.length) return rawFarms;
        const provinceMap = new Map(provinces.map(p => [p.code, p.name]));
        const communeMap = new Map(communes.map(c => [c.code, c.name]));

        return rawFarms.map(farm => ({
            ...farm,
            tinhThanhPho: provinceMap.get(farm.province) || farm.province,
            xaPhuong: communeMap.get(farm.commune) || farm.commune,
        }));
    }, [rawFarms, provinces, communes]);

    useEffect(() => {
        if (enrichedFarms.length > 0) {
            setUniqueProvinces([...new Set(enrichedFarms.map(f => f.tinhThanhPho).filter(Boolean))].sort());
            setUniqueTrangThai([...new Set(enrichedFarms.map(f => f.trangThai).filter(Boolean))].sort());
        }
    }, [enrichedFarms]);

    // === DATA FILTERING ===
    const filteredFarms = useMemo(() => {
        return enrichedFarms.filter(f =>
            (!selectedProvince || f.tinhThanhPho === selectedProvince) &&
            (!selectedTrangThai || selectedTrangThai === 'all' || f.trangThai === selectedTrangThai) &&
			(!selectedLoaiCoSoDangKy || f.loaiCoSoDangKy === selectedLoaiCoSoDangKy) &&
            (!filter || Object.values(f).some(val => String(val).toLowerCase().includes(filter.toLowerCase())))
        );
    }, [enrichedFarms, filter, selectedProvince, selectedTrangThai]);

    // === ACTIONS & PAGINATION ===
    const handleEdit = (id) => navigate(`/edit-farm/${id}`);
    const handleView = (id) => navigate(`/farm-details/${id}`);

    const handleProductAdded = () => {
        closeBreedingModal();
        fetchData();
    };
    
    const openBreedingModal = (farmId) => {
        setSelectedFarmId(farmId);
        setIsBreedingModalOpen(true);
    };

    const closeBreedingModal = () => {
        setIsBreedingModalOpen(false);
        setSelectedFarmId(null);
    };

    const handleExportExcel = () => {
        const dataToExport = filteredFarms.map(item => ({
            'Tỉnh (TP)': item.tinhThanhPho,
            'Xã (Phường)': item.xaPhuong,
            'Địa chỉ cơ sở': item.diaChiCoSo,
            'Tên cơ sở': item.tenCoSo,
            'Lâm sản': item.animalProducts?.map(p => p.tenLamSan).join(', ') || 'Chưa có',
            'Người đại diện': item.tenNguoiDaiDien,
            'Trạng thái': item.trangThai
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachCoSoGayNuoi");
        XLSX.writeFile(workbook, "DanhSachCoSoGayNuoi.xlsx");
    };
    
    const handleColumnToggle = (columnKey) => {
        setColumns(prev => ({ ...prev, [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible } }));
    };

    const currentItems = useMemo(() => {
        return filteredFarms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    }, [filteredFarms, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredFarms.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // === RENDER ===
    if (loading) return <div className="farm-list-container"><h2>Loading data...</h2></div>;
    if (error) return <div className="farm-list-container"><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;

    return (
        <div className="farm-list-container">
            <h2>Cơ sở gây nuôi động vật rừng 🐾</h2>
            
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
                <button onClick={() => setShowColumnOptions(!showColumnOptions)}>Tùy chỉnh Cột</button>
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
                </div>
            )}

            {filteredFarms.length === 0 ? (
                <p>No suitable farms found.</p>
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
                                                    <button onClick={() => handleView(item._id)} className="action-button view-button" title="Xem chi tiết">👁️</button>
                                                    <button onClick={() => handleEdit(item._id)} className="action-button edit-button" title="Chỉnh sửa">✏️</button>
                                                    <button onClick={() => openBreedingModal(item._id)} className="action-button add-product-button" title="Thêm Động vật nuôi">➕🦌</button>
                                                </div>
                                            ) : col.id === 'animalProducts' ? (
                                                item.animalProducts?.map(p => p.tenLamSan).join(', ') || 'Chưa có'
                                            ) : (
                                                ['ngayThanhLap', 'ngayCapCCCD'].includes(col.id)
                                                    ? (item[col.id] ? new Date(item[col.id]).toLocaleDateString('vi-VN') : '')
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
                            Showing {filteredFarms.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredFarms.length)} of {filteredFarms.length} records
                        </div>
                        <div className="pagination-controls">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>«</button>
                            <span> Page {currentPage} of {totalPages || 1} </span>
                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>»</button>
                        </div>
                        <div className="items-per-page">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="5">5 / page</option>
                                <option value="10">10 / page</option>
                                <option value="15">15 / page</option>
                                <option value="20">20 / page</option>
                                <option value="50">50 / page</option>
                            </select>
                        </div>
                    </div>
                </>
            )}

            <AddBreedingProductModal
                isOpen={isBreedingModalOpen}
                onRequestClose={closeBreedingModal}
                farmId={selectedFarmId}
                onProductAdded={handleProductAdded}
            />
        </div>
    );
}

export default RegisterManageSub2Page;