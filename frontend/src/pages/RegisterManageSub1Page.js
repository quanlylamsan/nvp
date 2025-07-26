import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import './RegisterManageSub1Page.css';

function RegisterManageSub1Page() {
  const [woods, setWoods] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedLoaiCoSoDangKy] = useState('Đăng ký cơ sở kinh doanh, chế biến gỗ');
  const [selectedNganhNgheKinhDoanhGo, setSelectedNganhNgheKinhDoanhGo] = useState('');
  const [selectedTrangThai, setSelectedTrangThai] = useState('');
  const [selectedLoaiHinhCheBienGo, setSelectedLoaiHinhCheBienGo] = useState('');
  const [selectedNguonGocGo, setSelectedNguonGocGo] = useState('');

  const [uniqueProvinces, setUniqueProvinces] = useState([]);
  const [uniqueCommunes, setUniqueCommunes] = useState([]);
  const [uniqueSpecies, setUniqueSpecies] = useState([]);
  const [uniqueNganhNgheKinhDoanhGo, setUniqueNganhNgheKinhDoanhGo] = useState([]);
  const [uniqueTrangThai, setUniqueTrangThai] = useState([]);
  const [uniqueLoaiHinhCheBienGo, setUniqueLoaiHinhCheBienGo] = useState([]);
  const [uniqueNguonGocGo, setUniqueNguonGocGo] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  const [columns, setColumns] = useState(initialColumnsConfig);
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    // ...
  }, []);

  useEffect(() => {
    // ...
  }, [columns]);

  useEffect(() => {
    const fetchWoodBusinesses = async () => {
      try {
        const params = { 
          farmType: selectedLoaiCoSoDangKy, 
          limit: 1000 
        };
        const response = await axios.get('http://localhost:10000/api/farms', {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        const fetchedData = response.data.docs || [];
        setWoods(fetchedData);

        setUniqueProvinces([...new Set(fetchedData.map(f => f.tinhThanhPho).filter(Boolean))].sort());
        // ...
      } catch (error) {
        // ...
      }
    };

    if (token) {
      fetchWoodBusinesses();
    } else {
      navigate('/');
    }
  }, [token, navigate, selectedLoaiCoSoDangKy]);

  const handleDelete = async (id) => { /* ... */ };
  const handleEdit = (id) => navigate(`/edit-wood-business/${id}`);
  const handleNavigateToWoodDetail = (id) => navigate(`/admin/woods/${id}`);
  const handleAddProduct = (farmId) => navigate(`/farm/${farmId}/add-product`);

  const filteredWoods = woods.filter(f => {
    // ... logic lọc của bạn ...
    return true; // Tạm thời để true để hiển thị tất cả
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWoods.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWoods.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleColumnToggle = (columnKey) => {
    setColumns(prev => ({ ...prev, [columnKey]: { ...prev[columnKey], visible: !prev[columnKey].visible } }));
  };
  const handleSelectAllColumns = () => { /* ... */ };
  const handleDeselectAllColumns = () => { /* ... */ };
  const handleExportExcel = () => { /* ... */ };

  return (
    <div className="farm-list-container">
      <h2>📋 Danh sách cơ sở kinh doanh, chế biến gỗ</h2>

      {/* === PHẦN CODE BỊ THIẾU ĐÃ ĐƯỢC THÊM LẠI TẠI ĐÂY === */}
      <div className="filter-container">
        <input type="text" placeholder="🔍 Tìm kiếm chung..." value={filter} onChange={e => setFilter(e.target.value)} />
		
		 <select value={selectedLoaiCoSoDangKy} onChange={e => setSelectedLoaiCoSoDangKy(e.target.value)}>
          <option value="">Tất cả Loại Cơ sở</option>
          {uniqueLoaiCoSoDangKy.map(type => (<option key={type} value={type}>{type}</option>))}
        </select>
		
		 <select value={selectedTrangThai} onChange={e => setSelectedTrangThai(e.target.value)}>
          <option value="">Tất cả Trạng thái</option>
          {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>

        <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
          <option value="">Tất cả Tỉnh (TP)</option>
          {uniqueProvinces.map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
		
		<select
          value={selectedLoaiHinhCheBienGo} // ✅ SỬ DỤNG state này
          onChange={e => setSelectedLoaiHinhCheBienGo(e.target.value)}
        >
          <option value="">Tất cả Loại hình chế biến</option>
          {uniqueLoaiHinhCheBienGo.map(l => (<option key={l} value={l}>{l}</option>))}
        </select>

        <select
          value={selectedNguonGocGo} // ✅ SỬ DỤNG state này
          onChange={e => setSelectedNguonGocGo(e.target.value)}
        >
          <option value="">Tất cả Nguồn gốc gỗ</option>
          {uniqueNguonGocGo.map(n => (<option key={n} value={n}>{n}</option>))}
        </select>
		
        <select value={selectedTrangThai} onChange={e => setSelectedTrangThai(e.target.value)}>
          <option value="">Tất cả Trạng thái</option>
          {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        <button onClick={() => setShowColumnOptions(!showColumnOptions)}>{showColumnOptions ? 'Ẩn tùy chọn' : 'Hiện/Ẩn Cột'}</button>
        <button onClick={handleExportExcel} className="export-excel-button">Xuất Excel</button>
      </div>

      {showColumnOptions && (
        <div className="column-options-container">
          <h3>Chọn cột hiển thị:</h3>
          <div className="column-options-grid">
            {Object.keys(columns).map(key => (
              <label key={key}>
                <input type="checkbox" checked={columns[key].visible} onChange={() => handleColumnToggle(key)} /> {columns[key].label}
              </label>
            ))}
          </div>
        </div>
      )}
      {/* ======================================================= */}

      {currentItems.length > 0 ? (
        <table className="farm-table">
          <thead>
            <tr>
              {Object.values(columns).map(col => col.visible && <th key={col.id}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item._id}>
                {Object.values(columns).map(col => col.visible && (
                  <td key={col.id}>
                    {col.id === 'actions' ? (
                      <div className="action-buttons-cell">
                        <button onClick={() => handleNavigateToWoodDetail(item._id)} className="action-button view-button">Nhập, xuất</button>
                        <button onClick={() => handleEdit(item._id)} className="action-button edit-button">✏️</button>
                        <button onClick={() => handleAddProduct(item._id)} className="action-button add-product-button" title="Thêm Lâm sản mới">➕🌲</button>
                       
                      </div>
                    ) : col.id === 'products' ? (
                      item.products && item.products.length > 0
                        ? `${item.products[0].tenLamSan}${item.products.length > 1 ? ` (+${item.products.length - 1})` : ''}`
                        : 'Chưa có'
                    ) : (
                      item[col.id]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Không có cơ sở nào phù hợp.</p>
      )}

      {filteredWoods.length > 0 && (
        <div className="pagination-container">
            {/* ... JSX cho phần phân trang ... */}
        </div>
      )}
    </div>
  );
}

export default RegisterManageSub1Page;