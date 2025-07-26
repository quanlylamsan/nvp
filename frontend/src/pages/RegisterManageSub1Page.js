import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import './RegisterManageSub1Page.css';

// ✅ BỎ COMMENT VÀ ĐẢM BẢO DÒNG NÀY CÓ Ở ĐẦU FILE
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

function RegisterManageSub1Page() {
  const [woods, setWoods] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [selectedLoaiCoSoDangKy] = useState('Đăng ký cơ sở kinh doanh, chế biến gỗ'); // Chỉ định đây là cơ sở gỗ
  const [selectedNganhNgheKinhDoanhGo, setSelectedNganhNgheKinhDoanhGo] = useState('');
  const [selectedTrangThai, setSelectedTrangThai] = useState('');
  // ✅ THÊM KHAI BÁO STATE NÀY
  const [selectedLoaiHinhCheBienGo, setSelectedLoaiHinhCheBienGo] = useState(''); 
  // ✅ THÊM KHAI BÁO STATE NÀY
  const [selectedNguonGocGo, setSelectedNguonGocGo] = useState(''); 

  const [uniqueProvinces, setUniqueProvinces] = useState([]);
  const [uniqueCommunes, setUniqueCommunes] = useState([]);
  const [uniqueSpecies, setUniqueSpecies] = useState([]);
  const [uniqueNganhNgheKinhDoanhGo, setUniqueNganhNgheKinhDoanhGo] = useState([]);
  const [uniqueTrangThai, setUniqueTrangThai] = useState([]);
  // ✅ THÊM KHAI BÁO UNIQUE STATE NÀY
  const [uniqueLoaiHinhCheBienGo, setUniqueLoaiHinhCheBienGo] = useState([]); 
  // ✅ THÊM KHAI BÁO UNIQUE STATE NÀY
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
    try {
      const savedColumns = localStorage.getItem('tableColumnsVisibility_RegisterManageSub1'); // Đảm bảo key này duy nhất
      if (savedColumns) {
        const parsedSavedColumns = JSON.parse(savedColumns);
        const mergedColumns = Object.keys(initialColumnsConfig).reduce((acc, key) => {
          const savedCol = parsedSavedColumns.find(sCol => sCol.id === key);
          acc[key] = savedCol ? { ...initialColumnsConfig[key], visible: savedCol.visible } : initialColumnsConfig[key];
          return acc;
        }, {});
        setColumns(mergedColumns);
      }
    } catch (error) {
      console.error("Lỗi khi tải trạng thái hiển thị cột từ localStorage:", error);
      setColumns(initialColumnsConfig);
    }
  }, []);

  useEffect(() => {
    try {
      const columnsToSave = Object.keys(columns).map(key => ({
        id: key,
        visible: columns[key].visible
      }));
      localStorage.setItem('tableColumnsVisibility_RegisterManageSub1', JSON.stringify(columnsToSave)); // Đảm bảo key này duy nhất
    } catch (error) {
      console.error("Lỗi khi lưu trạng thái hiển thị cột vào localStorage:", error);
    }
  }, [columns]);

  useEffect(() => {
    const fetchWoodBusinesses = async () => {
      try {
        const params = { 
          farmType: selectedLoaiCoSoDangKy, 
          limit: 1000 
        };
        if (filter) params.search = filter; // Thêm bộ lọc tìm kiếm chung vào params
        if (selectedProvince) params.tinhThanhPho = selectedProvince;
        if (selectedCommune) params.xaPhuong = selectedCommune;
        if (selectedSpecies) params.species = selectedSpecies;
        if (selectedNganhNgheKinhDoanhGo) params.nganhNgheKinhDoanhGo = selectedNganhNgheKinhDoanhGo;
        if (selectedTrangThai) params.trangThai = selectedTrangThai;
        if (selectedLoaiHinhCheBienGo) params.loaiHinhCheBienGo = selectedLoaiHinhCheBienGo; // Thêm
        if (selectedNguonGocGo) params.nguonGocGo = selectedNguonGocGo; // Thêm

        // ✅ SỬ DỤNG API_BASE_URL
        const response = await axios.get(`${API_BASE_URL}/api/farms`, {
          headers: { Authorization: `Bearer ${token}` },
          params: params
        });

        const fetchedData = response.data.docs || [];
        setWoods(fetchedData);

        // ✅ Cập nhật logic lấy unique values từ allFarmsResponse.data.docs
        const allFarmsResponse = await axios.get(`${API_BASE_URL}/api/farms?limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
        const allFarms = allFarmsResponse.data.docs || [];

        setUniqueProvinces([...new Set(allFarms.map(f => f.tinhThanhPho).filter(Boolean))].sort());
        setUniqueCommunes([...new Set(allFarms.map(f => f.xaPhuong).filter(Boolean))].sort());
        setUniqueSpecies([...new Set(allFarms.flatMap(f => f.species ? f.species.map(s => s.name) : []).filter(Boolean))].sort());
        setUniqueNganhNgheKinhDoanhGo([...new Set(allFarms.map(f => f.nganhNgheKinhDoanhGo).filter(Boolean))].sort());
        setUniqueTrangThai([...new Set(allFarms.map(f => f.trangThai).filter(Boolean))].sort());
        setUniqueLoaiHinhCheBienGo([...new Set(allFarms.map(f => f.loaiHinhCheBienGo).filter(Boolean))].sort()); // Thêm
        setUniqueNguonGocGo([...new Set(allFarms.map(f => f.nguonGocGo).filter(Boolean))].sort()); // Thêm


      } catch (error) {
        console.error("Lỗi khi lấy danh sách cơ sở:", error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/');
        }
        setWoods([]);
      }
    };

    if (token) {
      fetchWoodBusinesses();
    } else {
      navigate('/');
    }
    // ✅ CẬP NHẬT DEPENDENCY ARRAY ĐẦY ĐỦ
  }, [token, navigate, filter, selectedLoaiCoSoDangKy, selectedTrangThai, selectedProvince, selectedCommune, selectedSpecies, selectedNganhNgheKinhDoanhGo, selectedLoaiHinhCheBienGo, selectedNguonGocGo]); 

  const handleDelete = async (id) => { 
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở này?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/farms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWoods(woods.filter(f => f._id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
        alert('Xóa thất bại!');
      }
    }
  };
  const handleEdit = (id) => navigate(`/edit-wood-business/${id}`);
  const handleNavigateToWoodDetail = (id) => navigate(`/admin/woods/${id}`);
  const handleAddProduct = (farmId) => navigate(`/farm/${farmId}/add-product`);

  // ✅ Định nghĩa filteredWoods BẰNG useMemo để tối ưu và đảm bảo nó được định nghĩa rõ ràng
  const filteredWoods = React.useMemo(() => {
    return woods.filter(f => {
      const generalMatch = (
        (f.tenCoSo || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.tinhThanhPho || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.xaPhuong || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.diaChiCoSo || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.ghiChu || '').toLowerCase().includes(filter.toLowerCase()) || 
        (f.loaiCoSoDangKy || '').toLowerCase().includes(filter.toLowerCase()) || 
        (f.nganhNgheKinhDoanhGo || '').toLowerCase().includes(filter.toLowerCase()) || 
        (f.tongDan && String(f.tongDan).toLowerCase().includes(filter.toLowerCase())) || 
        (f.khoiLuong && String(f.khoiLuong).toLowerCase().includes(filter.toLowerCase())) || 
        (f.tenLamSan && String(f.tenLamSan).toLowerCase().includes(filter.toLowerCase())) || 
        (f.tenKhoaHoc && String(f.tenKhoaHoc).toLowerCase().includes(filter.toLowerCase())) || 
        (f.trangThai && String(f.trangThai).toLowerCase().includes(filter.toLowerCase())) ||
        (f.tenNguoiDaiDien || '').toLowerCase().includes(filter.toLowerCase()) ||
        (f.namSinh && String(f.namSinh).toLowerCase().includes(filter.toLowerCase())) || 
        (f.soCCCD && String(f.soCCCD).toLowerCase().includes(filter.toLowerCase())) || 
        (f.ngayCapCCCD && new Date(f.ngayCapCCCD).toLocaleDateString().toLowerCase().includes(filter.toLowerCase())) ||
        (f.noiCapCCCD && String(f.noiCapCCCD).toLowerCase().includes(filter.toLowerCase())) || 
        (f.soDienThoaiNguoiDaiDien && String(f.soDienThoaiNguoiDaiDien).toLowerCase().includes(filter.toLowerCase())) ||
        (f.diaChiNguoiDaiDien && String(f.diaChiNguoiDaiDien).toLowerCase().includes(filter.toLowerCase())) 
      );

      const provinceMatch = selectedProvince ? (f.tinhThanhPho === selectedProvince) : true;
      const communeMatch = selectedCommune ? (f.xaPhuong === selectedCommune) : true;
      const speciesMatch = selectedSpecies ? (f.species && f.species.some(s => s.name === selectedSpecies)) : true;
      const nganhNgheKinhDoanhGoMatch = selectedNganhNgheKinhDoanhGo ? (f.nganhNgheKinhDoanhGo === selectedNganhNgheKinhDoanhGo) : true;
      const trangThaiMatch = selectedTrangThai ? (f.trangThai === selectedTrangThai) : true;
      const loaiHinhCheBienGoMatch = selectedLoaiHinhCheBienGo ? (f.loaiHinhCheBienGo === selectedLoaiHinhCheBienGo) : true; // ✅ Đảm bảo biến này được sử dụng
      const nguonGocGoMatch = selectedNguonGocGo ? (f.nguonGocGo === selectedNguonGocGo) : true; // ✅ Đảm bảo biến này được sử dụng


      return generalMatch && provinceMatch && communeMatch && speciesMatch && nganhNgheKinhDoanhGoMatch && trangThaiMatch && loaiHinhCheBienGoMatch && nguonGocGoMatch;
    });
    // ✅ CẬP NHẬT DEPENDENCY ARRAY ĐẦY ĐỦ CHO useMemo
  }, [woods, filter, selectedProvince, selectedCommune, selectedSpecies, selectedNganhNgheKinhDoanhGo, selectedTrangThai, selectedLoaiHinhCheBienGo, selectedNguonGocGo]); 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredWoods.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWoods.length / itemsPerPage);

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
    const dataToExport = filteredWoods.map(item => { // ✅ SỬ DỤNG filteredWoods cho xuất Excel
      const rowData = {};
      columnsToExport.forEach(col => {
        let value = item[col.id];
        if (col.id === 'products' && Array.isArray(value)) {
          value = value.map(p => `${p.tenLamSan} (${p.khoiLuong} ${p.donViTinh || 'm³'})`).join('; ');
        } else if (['ngayThanhLap', 'ngayCapCCCD'].includes(col.id)) {
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
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachCoSoGo");
    XLSX.writeFile(wb, "DanhSachCoSoGo.xlsx");
  };

  return (
    <div className="farm-list-container">
      <h2>📋 Danh sách cơ sở kinh doanh, chế biến gỗ</h2>

      <div className="filter-container">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm chung..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        <select value={selectedLoaiCoSoDangKy} onChange={e => setSelectedLoaiCoSoDangKy(e.target.value)}>
          <option value="">Tất cả Loại Cơ sở</option>
          {/* Unique values for loaiCoSoDangKy are hardcoded here, consider generating them */}
          <option value="Đăng ký cơ sở gây nuôi">Đăng ký cơ sở gây nuôi</option>
          <option value="Đăng ký cơ sở kinh doanh, chế biến gỗ">Đăng ký cơ sở kinh doanh, chế biến gỗ</option>
        </select>

        <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)}>
          <option value="">Tất cả Tỉnh (TP)</option>
          {uniqueProvinces.map(p => (<option key={p} value={p}>{p}</option>))}
        </select>
        
        <select value={selectedTrangThai} onChange={e => setSelectedTrangThai(e.target.value)}>
          <option value="">Tất cả Trạng thái</option>
          {uniqueTrangThai.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        
        <select
          value={selectedLoaiHinhCheBienGo}
          onChange={e => setSelectedLoaiHinhCheBienGo(e.target.value)}
        >
          <option value="">Tất cả Loại hình chế biến</option>
          {uniqueLoaiHinhCheBienGo.map(l => (<option key={l} value={l}>{l}</option>))}
        </select>

        <select
          value={selectedNguonGocGo}
          onChange={e => setSelectedNguonGocGo(e.target.value)}
        >
          <option value="">Tất cả Nguồn gốc gỗ</option>
          {uniqueNguonGocGo.map(n => (<option key={n} value={n}>{n}</option>))}
        </select>
        {/* === NHỮNG THAY ĐỔI CỦA BẠN TRƯỚC ĐÂY === */}
		<select
          value={selectedNganhNgheKinhDoanhGo}
          onChange={e => setSelectedNganhNgheKinhDoanhGo(e.target.value)}>
          <option value="">Tất cả Ngành nghề KD gỗ</option>
          {uniqueNganhNgheKinhDoanhGo.map(n => (<option key={n} value={n}>{n}</option>))}
        </select>

        <select
          value={selectedSpecies}
          onChange={e => setSelectedSpecies(e.target.value)}>
          <option value="">Tất cả Loài nuôi</option>
          {uniqueSpecies.map(s => (<option key={s} value={s}>{s}</option>))}
        </select>
        {/* ======================================= */}
		
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
            <button onClick={handleSelectAllColumns} className="select-all-button">Chọn tất cả</button>
            <button onClick={handleDeselectAllColumns} className="deselect-all-button">Bỏ chọn tất cả</button>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo khi không có cơ sở nào được đăng ký */}
      {filteredWoods.length === 0 && <p>Không có cơ sở nào phù hợp.</p>}

      {/* Bảng hiển thị danh sách cơ sở nếu có dữ liệu */}
      {filteredWoods.length > 0 && (
        <table className="farm-table">
          <thead>
            <tr>
              {Object.values(columns).map(col => col.visible && (
                <th key={col.id} style={{ minWidth: col.minWidth, width: col.width, maxWidth: col.maxWidth, textAlign: col.textAlign || 'left' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item._id}>
                {Object.values(columns).map(col => col.visible && (
                  <td key={col.id} style={{ minWidth: col.minWidth, width: col.width, maxWidth: col.maxWidth, textAlign: col.textAlign || 'left' }}>
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
                      ['ngayThanhLap', 'ngayCapCCCD'].includes(col.id) ? (item[col.id] ? new Date(item[col.id]).toLocaleDateString() : '') : item[col.id]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Điều khiển phân trang */}
      {filteredWoods.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredWoods.length)} / {filteredWoods.length} bản ghi
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

export default RegisterManageSub1Page;