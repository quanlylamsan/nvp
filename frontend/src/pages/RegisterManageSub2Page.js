// src/pages/RegisterManageSub2Page.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import './RegisterManageSub2Page.css';

// ✅ THÊM DÒNG NÀY: Lấy URL API từ biến môi trường
// Nếu biến môi trường không tồn tại (ví dụ: trong môi trường phát triển cục bộ),
// nó sẽ mặc định dùng localhost:10000.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

// ✅ Đổi tên hàm component để khớp với import BreedingFarmListPage
function RegisterManageSub2Page() { 
  const [farms, setFarms] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  // *** THAY ĐỔI: Đặt lại giá trị mặc định để hiển thị cả 2 loại cơ sở ban đầu ***
  const [selectedLoaiCoSoDangKy, setSelectedLoaiCoSoDangKy] = useState(''); 
  const [selectedNganhNgheKinhDoanhGo, setSelectedNganhNgheKinhDoanhGo] = useState('');
  const [selectedTrangThai, setSelectedTrangThai] = useState('');

  const [uniqueProvinces, setUniqueProvinces] = useState([]);
  const [uniqueCommunes, setUniqueCommunes] = useState([]);
  const [uniqueSpecies, setUniqueSpecies] = useState([]);
  const [uniqueNganhNgheKinhDoanhGo, setUniqueNganhNgheKinhDoanhGo] = useState([]);
  const [uniqueTrangThai, setUniqueTrangThai] = useState([]);
  const [uniqueLoaiCoSoDangKy, setUniqueLoaiCoSoDangKy] = useState([]); // Thêm state cho loại cơ sở

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const initialColumnsConfig = {
    tenCoSo: { id: 'tenCoSo', label: 'Tên cơ sở', visible: true, minWidth: '180px' },
    loaiCoSoDangKy: { id: 'loaiCoSoDangKy', label: 'Loại Cơ Sở', visible: true, minWidth: '180px' }, // Thêm cột loại cơ sở
    tinhThanhPho: { id: 'tinhThanhPho', label: 'Tỉnh (TP)', visible: true, minWidth: '100px' },
    xaPhuong: { id: 'xaPhuong', label: 'Xã (Phường)', visible: true, minWidth: '100px' },
    diaChiCoSo: { id: 'diaChiCoSo', label: 'Địa chỉ cơ sở', visible: true, minWidth: '220px' },
    tenNguoiDaiDien: { id: 'tenNguoiDaiDien', label: 'Người đại diện', visible: true, minWidth: '150px' },
    trangThai: { id: 'trangThai', label: 'Trạng thái', visible: true, minWidth: '100px' },
    actions: { id: 'actions', label: 'Hành động', visible: true, width: '220px', minWidth: '220px' },
    // Các cột khác có thể ẩn đi ban đầu
    vido: { id: 'vido', label: 'Vĩ độ', visible: false, minWidth: '80px' },
    kinhdo: { id: 'kinhdo', label: 'Kinh độ', visible: false, minWidth: '80px' },
    ngayThanhLap: { id: 'ngayThanhLap', label: 'Ngày thành lập', visible: false, minWidth: '100px' },
    giayPhepKinhDoanh: { id: 'giayPhepKinhDoanh', label: 'Số GPKD', visible: false, minWidth: '100px' },
  };

  const [columns, setColumns] = useState(initialColumnsConfig);
  const [showColumnOptions, setShowColumnOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    const savedColumns = localStorage.getItem('tableColumnsVisibility_AllFarms');
    if (savedColumns) {
      try {
        const parsedSavedColumns = JSON.parse(savedColumns);
        const mergedColumns = { ...initialColumnsConfig };
        Object.keys(parsedSavedColumns).forEach(key => {
          if (mergedColumns[key]) {
            mergedColumns[key].visible = parsedSavedColumns[key].visible;
          }
        });
        setColumns(mergedColumns);
      } catch (e) {
        setColumns(initialColumnsConfig);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tableColumnsVisibility_AllFarms', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const params = {
            page: currentPage,
            limit: itemsPerPage,
        };
        if (filter) params.search = filter;
        if (selectedLoaiCoSoDangKy) params.farmType = selectedLoaiCoSoDangKy;
        if (selectedTrangThai) params.trangThai = selectedTrangThai;
        if (selectedProvince) params.tinhThanhPho = selectedProvince;
        if (selectedCommune) params.xaPhuong = selectedCommune;

        // ✅ Sửa đổi: Sử dụng API_BASE_URL cho cuộc gọi API
        const response = await axios.get(`${API_BASE_URL}/api/farms`, {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });
        
        const fetchedFarms = response.data.docs || [];
        setFarms(fetchedFarms);

        // Lấy tất cả dữ liệu một lần để tạo dropdown, không phụ thuộc vào trang hiện tại
        // ✅ Sửa đổi: Sử dụng API_BASE_URL cho cuộc gọi API thứ hai
        const allFarmsResponse = await axios.get(`${API_BASE_URL}/api/farms?limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
        const allFarms = allFarmsResponse.data.docs || [];

        setUniqueProvinces([...new Set(allFarms.map(f => f.tinhThanhPho).filter(Boolean))].sort());
        setUniqueCommunes([...new Set(allFarms.map(f => f.xaPhuong).filter(Boolean))].sort());
        setUniqueLoaiCoSoDangKy([...new Set(allFarms.map(f => f.loaiCoSoDangKy).filter(Boolean))].sort());
        setUniqueTrangThai([...new Set(allFarms.map(f => f.trangThai).filter(Boolean))].sort());

      } catch (error) {
        console.error('Lỗi khi lấy danh sách cơ sở:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/');
        }
        setFarms([]);
      }
    };

    if (token) {
      fetchFarms();
    } else {
      navigate('/');
    }
  }, [token, navigate, currentPage, itemsPerPage, filter, selectedLoaiCoSoDangKy, selectedTrangThai, selectedProvince, selectedCommune]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
      try {
        // ✅ Sửa đổi: Sử dụng API_BASE_URL cho cuộc gọi API
        await axios.delete(`${API_BASE_URL}/api/farms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFarms(farms.filter(f => f._id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Xóa thất bại!');
      }
    }
  };

  const handleEdit = (id) => navigate(`/edit-farm/${id}`);
  const handleView = (id) => navigate(`/farm-details/${id}`);
  
  const handleAddProduct = (farmId) => {
    navigate(`/farm/${farmId}/add-product`);
  };

  const currentItems = farms; 
  const totalPages = Math.ceil(farms.length / itemsPerPage); 
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => prev - 1);
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
    const dataToExport = farms.map(farm => {
      const rowData = {};
      columnsToExport.forEach(col => {
        let value = farm[col.id];
        if (col.id === 'products' && Array.isArray(value)) {
          value = value.map(p => `${p.tenLamSan} (${p.khoiLuong} ${p.donViTinh || 'm³'})`).join('; ');
        } else if (['ngayThanhLap', 'ngayCapCCCD'].includes(col.id)) {
          value = value ? new Date(value).toLocaleDateString() : '';
        }
        rowData[col.label] = value;
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachCoSo");
    XLSX.writeFile(wb, "DanhSachCoSo.xlsx");
  };

  return (
    <div className="farm-list-container">
      <h2>📋 Danh sách Cơ sở</h2>

      <div className="filter-container">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm chung..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        <select value={selectedLoaiCoSoDangKy} onChange={e => setSelectedLoaiCoSoDangKy(e.target.value)}>
          <option value="">Tất cả Loại Cơ sở</option>
          {uniqueLoaiCoSoDangKy.map(type => (<option key={type} value={type}>{type}</option>))}
        </select>

        <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
          <option value="">Tất cả Tỉnh (TP)</option>
          {uniqueProvinces.map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        
        <select value={selectedTrangThai} onChange={e => setSelectedTrangThai(e.target.value)}>
          <option value="">Tất cả Trạng thái</option>
          {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        
        <button onClick={() => setShowColumnOptions(!showColumnOptions)}>Hiện/Ẩn Cột</button>
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

      {farms.length === 0 && <p>Không có cơ sở nào phù hợp.</p>}

      {farms.length > 0 && (
        <table className="farm-table">
          <thead>
            <tr>
              {Object.values(columns).map(col => col.visible && <th key={col.id} style={{minWidth: col.minWidth, width: col.width}}>{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((f) => (
              <tr key={f._id}>
                {Object.values(columns).map(col => col.visible && (
                  <td key={col.id}>
                    {col.id === 'actions' ? (
                      <div className="action-buttons-cell">
                        <button onClick={() => handleView(f._id)} className="action-button view-button" title="Xem chi tiết">👁️</button>
                        <button onClick={() => handleEdit(f._id)} className="action-button edit-button" title="Chỉnh sửa">✏️</button>
                        
                        {/* *** NÚT MỚI: Chỉ hiển thị khi là cơ sở kinh doanh gỗ *** */}
                        {f.loaiCoSoDangKy === 'Đăng ký cơ sở kinh doanh, chế biến gỗ' && (
                          <button 
                            onClick={() => handleAddProduct(f._id)} 
                            className="action-button add-product-button"
                            title="Thêm Lâm sản mới"
                          >
                            ➕🌲
                          </button>
                        )}
                        
                        
                      </div>
                    ) : (
                      // Hiển thị ngày tháng định dạng dd/mm/yyyy
                      ['ngayThanhLap', 'ngayCapCCCD'].includes(col.id) ? (f[col.id] ? new Date(f[col.id]).toLocaleDateString() : '') : f[col.id]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Điều khiển phân trang */}
      {filteredFarms.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredFarms.length)} / {filteredFarms.length} bản ghi
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
              setCurrentPage(1); // Đặt lại về trang đầu tiên khi số mục mỗi trang thay đổi
            }}>
              <option value="5">5 bản ghi/trang</option>
              <option value="10">10 bản ghi/trang</option>
              <option value="15">15 bản ghi/trang</option>
              <option value="20">20 bản ghi/trang</option>
              <option value="50">50 bản ghi/trang</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterManageSub2Page;