// src/pages/Googlemaps.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


import './Googlemaps.css'; // Import file CSS riêng cho trang này

// ✅ THÊM DÒNG NÀY: Lấy URL API từ biến môi trường
// Nếu biến môi trường không tồn tại (ví dụ: trong môi trường phát triển cục bộ),
// nó sẽ mặc định dùng localhost:10000.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

/**
 * Component GoogleMapsPage hiển thị danh sách các cơ sở nuôi,
 * cho phép tìm kiếm, lọc, ẩn/hiện cột và phân trang.
 */
function GoogleMapsPage() { // Đã đổi tên hàm từ FarmListPage thành GoogleMapsPage để khớp với Route
  // State để lưu trữ danh sách các cơ sở được tải về từ API
  const [farms, setFarms] = useState([]);
  // State cho bộ lọc tìm kiếm chung (theo tên, địa chỉ, người đại diện, v.v.)
  const [filter, setFilter] = useState('');
  // State cho bộ lọc Tỉnh (Thành phố)
  const [selectedProvince, setSelectedProvince] = useState('');
  // State cho bộ lọc Xã (Phường)
  const [selectedCommune, setSelectedCommune] = useState('');
  // State cho bộ lọc Loài (giữ lại vì có thể có trường species lồng nhau)
  const [selectedSpecies, setSelectedSpecies] = useState('');
  // State cho bộ lọc Loại cơ sở đăng ký (Cơ sở gây nuôi / Cơ sở kinh doanh, chế biến gỗ)
  // Mặc định là "Đăng ký cơ sở kinh doanh, chế biến gỗ"
  const [selectedLoaiCoSoDangKy, setSelectedLoaiCoSoDangKy] = useState('Đăng ký cơ sở kinh doanh, chế biến gỗ');
  // State cho bộ lọc Ngành nghề kinh doanh gỗ
  const [selectedNganhNgheKinhDoanhGo, setSelectedNganhNgheKinhDoanhGo] = useState('');
  // State cho bộ lọc Trạng thái
  const [selectedTrangThai, setSelectedTrangThai] = useState(''); // Thêm state cho lọc Trạng thái

  // State để lưu trữ các giá trị Tỉnh (Thành phố) duy nhất cho dropdown
  const [uniqueProvinces, setUniqueProvinces] = useState([]);
  // State để lưu trữ các giá trị Xã (Phường) duy nhất cho dropdown
  const [uniqueCommunes, setUniqueCommunes] = useState([]);
  // State để lưu trữ các giá trị Loài duy nhất cho dropdown
  const [uniqueSpecies, setUniqueSpecies] = useState([]);
  // State để lưu trữ các giá trị Loại cơ sở đăng ký duy nhất cho dropdown
  const [uniqueLoaiCoSoDangKy, setUniqueLoaiCoSoDangKy] = useState([]);
  // State để lưu trữ các giá trị Ngành nghề kinh doanh gỗ duy nhất cho dropdown
  const [uniqueNganhNgheKinhDoanhGo, setUniqueNganhNgheKinhDoanhGo] = useState([]);
  // State để lưu trữ các giá trị Trạng thái duy nhất cho dropdown
  const [uniqueTrangThai, setUniqueTrangThai] = useState([]); // Thêm state cho unique Trạng thái

  // Hook để điều hướng trang
  const navigate = useNavigate();
  // Lấy token xác thực từ localStorage
  const token = localStorage.getItem('token');

  // Định nghĩa cấu hình các cột của bảng, bao gồm ID, nhãn hiển thị, trạng thái hiển thị ban đầu, và chiều rộng tối thiểu
  // Các trường không được liệt kê ở đây sẽ không hiển thị và không có tùy chọn ẩn/hiện
  const initialColumnsConfig = {
    // Thông tin cơ sở (chỉ hiển thị các trường yêu cầu)
	tinhThanhPho: { id: 'tinhThanhPho', label: 'Tỉnh (TP)', visible: true, minWidth: '130px' },
	xaPhuong: { id: 'xaPhuong', label: 'Xã (Phường)', visible: true, minWidth: '150px' },
    diaChiCoSo: { id: 'diaChiCoSo', label: 'Địa chỉ cơ sở', visible: true, minWidth: '250px' },
    tenCoSo: { id: 'tenCoSo', label: 'Tên cơ sở', visible: true, minWidth: '250px' },
    
    // Người đại diện (chỉ hiển thị các trường yêu cầu)
    tenNguoiDaiDien: { id: 'tenNguoiDaiDien', label: 'Người đại diện', visible: true, minWidth: '180px' },
    
    // Các trường chung khác (chỉ hiển thị các trường yêu cầu)
    trangThai: { id: 'trangThai', label: 'Trạng thái', visible: true, minWidth: '100px' },
        
    // Cột Bản đồ (luôn hiển thị)
    mapLink: { id: 'mapLink', label: 'Bản đồ', visible: true, minWidth: '10px' }, // Adjusted minWidth from '5px' to '80px'
  };

  // State để quản lý trạng thái hiển thị của các cột
  const [columns, setColumns] = useState(initialColumnsConfig);
  // State để quản lý trạng thái hiển thị của bảng tùy chọn cột
  const [showColumnOptions, setShowColumnOptions] = useState(false);

  // Các state liên quan đến phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Mặc định 15 mục mỗi trang

  /**
   * useEffect để tải trạng thái hiển thị cột từ localStorage khi component được mount.
   * Điều này giúp duy trì lựa chọn của người dùng giữa các lần truy cập.
   */
  useEffect(() => {
    try {
      // Sử dụng một key riêng cho localStorage để tránh xung đột với các trang khác
      const savedColumns = localStorage.getItem('tableColumnsVisibility_GoogleMaps'); 
      if (savedColumns) {
        const parsedSavedColumns = JSON.parse(savedColumns);
        // Hợp nhất cấu hình đã lưu với cấu hình ban đầu để xử lý các cột mới/bị xóa
        const mergedColumns = Object.keys(initialColumnsConfig).reduce((acc, key) => {
          const savedCol = parsedSavedColumns.find(sCol => sCol.id === key);
          // Hợp nhất trạng thái hiển thị đã lưu, nhưng vẫn giữ các thuộc tính ban đầu (như width, minWidth)
          acc[key] = savedCol ? { ...initialColumnsConfig[key], visible: savedCol.visible } : initialColumnsConfig[key];
          return acc;
        }, {});
        setColumns(mergedColumns);
      }
    } catch (error) {
      console.error("Lỗi khi tải trạng thái hiển thị cột từ localStorage:", error);
      // Nếu có lỗi khi tải, fallback về cấu hình cột ban đầu
      setColumns(initialColumnsConfig);
    }
  }, []); // Mảng dependency rỗng đảm bảo useEffect này chỉ chạy một lần khi mount

  /**
   * useEffect để lưu trạng thái hiển thị cột vào localStorage mỗi khi state 'columns' thay đổi.
   */
  useEffect(() => {
    try {
      // Chỉ lưu id và trạng thái hiển thị để tránh lưu trữ các thuộc tính CSS không cần thiết
      const columnsToSave = Object.keys(columns).map(key => ({
        id: key,
        visible: columns[key].visible
      }));
      localStorage.setItem('tableColumnsVisibility_GoogleMaps', JSON.stringify(columnsToSave)); // Sử dụng key riêng
    } catch (error) {
      console.error("Lỗi khi lưu trạng thái hiển thị cột vào localStorage:", error);
    }
  }, [columns]); // Chạy mỗi khi state 'columns' thay đổi


  /**
   * useEffect để tải danh sách cơ sở từ API khi component được mount
   * hoặc khi các bộ lọc `selectedLoaiCoSoDangKy` hoặc `selectedTrangThai` thay đổi.
   */
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const params = {};
        // Thêm bộ lọc farmType vào params nếu `selectedLoaiCoSoDangKy` được chọn
        if (selectedLoaiCoSoDangKy !== '') {
          params.farmType = selectedLoaiCoSoDangKy;
        }
        // Thêm bộ lọc trạng thái vào params nếu `selectedTrangThai` được chọn
        if (selectedTrangThai !== '') {
          params.trangThai = selectedTrangThai;
        }

        // Gửi yêu cầu GET đến API để lấy danh sách cơ sở
        // Sửa đổi: Sử dụng API_BASE_URL cho cuộc gọi API
        const response = await axios.get(`${API_BASE_URL}/api/farms`, {
          headers: {
            Authorization: `Bearer ${token}` // Gửi token xác thực trong header
          },
          params: params // Truyền các tham số bộ lọc vào backend
        });
        
        // CHỈNH SỬA TẠY ĐÂY: Truy cập vào thuộc tính .docs của response.data
        const fetchedFarms = response.data.docs || []; 
        setFarms(fetchedFarms); // Cập nhật state farms với dữ liệu nhận được

        // Trích xuất các giá trị duy nhất cho các bộ lọc từ dữ liệu đã tải
        const provinces = [...new Set(fetchedFarms.map(f => f.tinhThanhPho).filter(Boolean))].sort();
        const communes = [...new Set(fetchedFarms.map(f => f.xaPhuong).filter(Boolean))].sort();
        // Giả sử 'species' là một mảng lồng nhau của các đối tượng có thuộc tính 'name'
        const species = [...new Set(fetchedFarms.flatMap(f => f.species ? f.species.map(s => s.name) : []).filter(Boolean))].sort();
        const loaiCoSoDangKy = [...new Set(fetchedFarms.map(f => f.loaiCoSoDangKy).filter(Boolean))].sort();
        const nganhNgheKinhDoanhGo = [...new Set(fetchedFarms.map(f => f.nganhNgheKinhDoanhGo).filter(Boolean))].sort();
        const trangThai = [...new Set(fetchedFarms.map(f => f.trangThai).filter(Boolean))].sort(); // Lấy các giá trị trạng thái duy nhất

        // Cập nhật các state chứa các giá trị duy nhất
        setUniqueProvinces(provinces);
        setUniqueCommunes(communes);
        setUniqueSpecies(species);
        setUniqueLoaiCoSoDangKy(loaiCoSoDangKy);
        setUniqueNganhNgheKinhDoanhGo(nganhNgheKinhDoanhGo);
        setUniqueTrangThai(trangThai);

      } catch (error) {
        console.error('❌ Lỗi khi lấy danh sách cơ sở:', error);
        // Nếu lỗi do xác thực (401) hoặc không được ủy quyền (403), chuyển hướng đến trang đăng nhập
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          navigate('/');
        }
        setFarms([]); // Đảm bảo farms là mảng rỗng khi có lỗi
      }
    };

    // Chỉ tải dữ liệu nếu token tồn tại
    if (token) {
      fetchFarms();
    } else {
      navigate('/'); // Chuyển hướng nếu không có token
    }
  }, [token, navigate, selectedLoaiCoSoDangKy, selectedTrangThai]); // Re-fetch khi token, navigate, selectedLoaiCoSoDangKy hoặc selectedTrangThai thay đổi

  /**
   * Hàm điều hướng đến Google Maps với tọa độ của cơ sở.
   * @param {string} lat - Vĩ độ (latitude) của cơ sở (WGS84).
   * @param {string} lon - Kinh độ (longitude) của cơ sở (WGS84).
   */
  const handleNavigateToMap = (lat, lon) => {
    if (lat && lon) {
      // Sửa đổi: Sử dụng Google Maps URL chính xác
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`; // ✅ Đã sửa URL Google Maps
      window.open(mapUrl, '_blank'); // Mở bản đồ trong tab mới
    } else {
      alert('Không có thông tin vĩ độ hoặc kinh độ cho cơ sở này.'); // Thay bằng modal thông báo tùy chỉnh
    }
  };

  /**
   * Lọc danh sách cơ sở dựa trên tất cả các tiêu chí (lọc frontend cho các trường khác).
   */
  const filteredFarms = farms.filter(f => {
    // Kiểm tra khớp với bộ lọc tìm kiếm chung
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

    // Kiểm tra khớp với bộ lọc Tỉnh (Thành phố)
    const provinceMatch = selectedProvince ? (f.tinhThanhPho === selectedProvince) : true;
    // Kiểm tra khớp với bộ lọc Xã (Phường)
    const communeMatch = selectedCommune ? (f.xaPhuong === selectedCommune) : true;
    // Kiểm tra khớp với bộ lọc Loài (nếu có trường species)
    const speciesMatch = selectedSpecies ? (f.species && f.species.some(s => s.name === selectedSpecies)) : true;
    // `nganhNgheKinhDoanhGoMatch` hiện được xử lý bởi bộ lọc backend, nhưng vẫn giữ lại để nhất quán nếu cần cho các bộ lọc khác
    const nganhNgheKinhDoanhGoMatch = selectedNganhNgheKinhDoanhGo ? (f.nganhNgheKinhDoanhGo === selectedNganhNgheKinhDoanhGo) : true;
    // `trangThaiMatch` hiện được xử lý bởi bộ lọc backend, nhưng vẫn giữ lại để nhất quán nếu cần cho các bộ lọc khác
    const trangThaiMatch = selectedTrangThai ? (f.trangThai === selectedTrangThai) : true;


    // Trả về true nếu tất cả các điều kiện bộ lọc đều khớp
    return generalMatch && provinceMatch && communeMatch && speciesMatch && nganhNgheKinhDoanhGoMatch && trangThaiMatch;
  });

  // Logic phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFarms.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredFarms.length / itemsPerPage);

  // Hàm thay đổi trang hiện tại
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Hàm chuyển đến trang tiếp theo
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Hàm chuyển đến trang trước
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Hàm xử lý việc bật/tắt hiển thị cột.
   * @param {string} columnKey - Khóa của cột cần thay đổi trạng thái hiển thị.
   */
  const handleColumnToggle = (columnKey) => {
    setColumns(prevColumns => ({
      ...prevColumns,
      [columnKey]: {
        ...prevColumns[columnKey],
        visible: !prevColumns[columnKey].visible // Đảo ngược trạng thái hiển thị của cột
      }
    }));
  };

  /**
   * Hàm chọn tất cả các cột hiển thị.
   */
  const handleSelectAllColumns = () => {
    setColumns(prevColumns => {
      const newColumns = { ...prevColumns };
      for (const key in newColumns) {
        newColumns[key].visible = true;
      }
      return newColumns;
    });
  };

  

  return (
    <div className="farm-list-container"> {/* Container chính của trang danh sách */}
    

      <div className="filter-container"> {/* Container cho các bộ lọc */}
        <input
          type="text"
          placeholder="🔍 Tìm kiếm chung..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />

        {/* Bộ lọc mới cho Loại cơ sở đăng ký */}
        <select
          value={selectedLoaiCoSoDangKy}
          onChange={e => setSelectedLoaiCoSoDangKy(e.target.value)}
        >
          <option value="">Tất cả cơ sở</option>
          <option value="Đăng ký cơ sở gây nuôi">Đăng ký cơ sở gây nuôi</option>
          <option value="Đăng ký cơ sở kinh doanh, chế biến gỗ">Đăng ký cơ sở kinh doanh, chế biến gỗ</option>
        </select>

        <select
          value={selectedProvince}
          onChange={e => setSelectedProvince(e.target.value)}
        >
          <option value="">Tất cả Tỉnh (TP)</option>
          {uniqueProvinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>

        <select
          value={selectedCommune}
          onChange={e => setSelectedCommune(e.target.value)}
        >
          <option value="">Tất cả Xã (Phường)</option>
          {uniqueCommunes.map(commune => (
            <option key={commune} value={commune}>{commune}</option>
          ))}
        </select>

        <select
          value={selectedSpecies}
          onChange={e => setSelectedSpecies(e.target.value)}
        >
          <option value="">Tất cả Loài nuôi</option>
          {uniqueSpecies.map(species => (
            <option key={species} value={species}>{species}</option>
          ))}
        </select>

        {/* Bộ lọc mới cho Ngành nghề kinh doanh gỗ */}
        <select
          value={selectedNganhNgheKinhDoanhGo}
          onChange={e => setSelectedNganhNgheKinhDoanhGo(e.target.value)}
        >
          <option value="">Tất cả Ngành nghề KD gỗ</option>
          {uniqueNganhNgheKinhDoanhGo.map(nganhNghe => (
            <option key={nganhNghe} value={nganhNghe}>{nganhNghe}</option>
          ))}
        </select>

        {/* Bộ lọc mới cho Trạng thái */}
        <select
          value={selectedTrangThai}
          onChange={e => setSelectedTrangThai(e.target.value)}
        >
          <option value="">Tất cả Trạng thái</option>
          {uniqueTrangThai.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>


      </div>

      

      {/* Hiển thị thông báo khi không có cơ sở nào được đăng ký */}
      {farms.length === 0 && !filter && <p>Không có cơ sở nuôi nào được đăng ký.</p>}
      {farms.length === 0 && filter && <p>Không tìm thấy cơ sở nuôi nào phù hợp với bộ lọc.</p>}

      {/* Bảng hiển thị danh sách cơ sở nếu có dữ liệu */}
      {filteredFarms.length > 0 && (
        <table border="1" cellPadding="8" className="table-auto w-full border-collapse">
          <thead style={{ background: '#f0f0f0' }}>
            <tr>
              {Object.keys(columns).map(key => (
                <th
                  key={key}
                  className={!columns[key].visible ? 'column-hidden' : ''}
                  style={
                    key === 'actions'
                      ? { // Cột hành động: chiều rộng cố định
                          width: columns[key].width,
                          minWidth: columns[key].minWidth,
                          maxWidth: columns[key].maxWidth,
                        }
                      : (columns[key].visible
                          ? { // Các cột không phải hành động đang hiển thị: sử dụng minWidth làm chiều rộng
                              width: columns[key].minWidth, // Đặt chiều rộng bằng minWidth
                              minWidth: columns[key].minWidth, // Đảm bảo minWidth được tôn trọng
                              maxWidth: columns[key].maxWidth || 'auto', // Cho phép mở rộng nếu có không gian, nhưng giữ ellipsis
                            }
                          : {}
                        )
                  }
                >
                  {columns[key].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((f, i) => (
              <tr key={f._id || i}>
                {Object.keys(columns).map(key => (
                  <td
                    key={`${f._id || i}-${key}`}
                    className={!columns[key].visible ? 'column-hidden' : ''}
                    style={
                      key === 'actions'
                        ? { // Cột hành động: chiều rộng cố định
                            width: columns[key].width,
                            minWidth: columns[key].minWidth,
                            maxWidth: columns[key].maxWidth,
                          }
                        : (columns[key].visible
                            ? { // Các cột không phải hành động đang hiển thị: sử dụng minWidth làm chiều rộng
                                width: columns[key].minWidth, // Đặt chiều rộng bằng minWidth
                                minWidth: columns[key].minWidth, // Đảm bảo minWidth được tôn trọng
                                maxWidth: columns[key].maxWidth || 'auto', // Cho phép mở rộng nếu có không gian, nhưng giữ ellipsis
                              }
                            : {}
                          )
                    }
                  >
                    {/* Xử lý nội dung của ô */}
                    {key === 'mapLink' ? (
                      <button onClick={() => handleNavigateToMap(f.vido, f.kinhdo)} className="action-button view-button">
                        Mở
                      </button>
                    ) : (
                      // Các trường ngày tháng
                      ['ngayThanhLap', 'ngayCapCCCD'].includes(key) ?
                        (f[key] ? new Date(f[key]).toLocaleDateString() : '') :
                        f[key]
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

export default GoogleMapsPage;