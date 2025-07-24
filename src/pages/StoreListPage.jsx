import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const StoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [importedStores, setImportedStores] = useState([]);
  const [filterProvince, setFilterProvince] = useState('Tất cả');
  const [filterWard, setFilterWard] = useState('Tất cả');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get('/api/stores');
        setStores(res.data);
      } catch (err) {
        console.error('❌ Lỗi tải danh sách:', err.message);
      }
    };
    fetchStores();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      const converted = data.map((row) => ({
        name: row['Tên cơ sở'] || '',
        code: row['Mã số CS'] || '',
        province: row['Tỉnh/Thành phố'] || '',
        ward: row['Phường/Xã'] || '',
        address: `${row['Phường/Xã'] || ''}, ${row['Tỉnh/Thành phố'] || ''}`,
        owner: row['Người đại diện'] || '',
        phone: row['Số điện thoại'] || '',
        longitude: row['Kinh độ'] || null,
        latitude: row['Vĩ độ'] || null,
        area: row['Diện tích truồng trại'] || null,
        active: row['Trạng thái'] === 'Đang hoạt động',
        purpose: row['Mục đích nuôi'] || '',
        farm_type: row['Hình thức nuôi'] || '',
        license_date: row['Ngày cấp mã'] || '',
        start_date: row['Ngày bắt đầu nuôi'] || '',
        birth_year: row['Năm sinh'] || '',
        id_number: row['Số CMND/Căn cước CD/ Hộ chiếu'] || '',
        id_issue_date: row['Ngày cấp số CMND/CCCD/Hộ chiếu'] || '',
        id_issue_place: row['Nơi cấp số CMND/CCCD/Hộ chiếu'] || '',
        registration_status: row['Tình trạng đăng ký'] || '',
      }));

      setImportedStores(converted);
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    try {
      await axios.post('/api/stores/import', importedStores);
      alert('✅ Import thành công!');
      setImportedStores([]);
      const res = await axios.get('/api/stores');
      setStores(res.data);
    } catch (err) {
      console.error('❌ Import lỗi:', err.message);
      alert('❌ Import thất bại!');
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(filteredStores);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DanhSach');
    XLSX.writeFile(wb, 'DanhSachCuaHang.xlsx');
  };

  const provinces = ['Tất cả', ...new Set(stores.map(s => s.province).filter(Boolean))];
  const wards = ['Tất cả', ...new Set(stores.map(s => s.ward).filter(Boolean))];

  const filteredStores = stores.filter(s => (
    (filterProvince === 'Tất cả' || s.province === filterProvince) &&
    (filterWard === 'Tất cả' || s.ward === filterWard) &&
    (filterStatus === 'Tất cả' || (filterStatus === 'Đang hoạt động' ? s.active : !s.active)) &&
    s.name.toLowerCase().includes(searchName.toLowerCase())
  ));

  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">📥 Nhập danh sách cửa hàng từ Excel</h2>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />

      {importedStores.length > 0 && (
        <div className="mb-4">
          <p>📦 Đã đọc {importedStores.length} dòng</p>
          <button onClick={handleImport} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            📤 Gửi vào hệ thống
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Tỉnh/TP</label>
          <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)} className="border rounded px-2 py-1">
            {provinces.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Phường/Xã</label>
          <select value={filterWard} onChange={e => setFilterWard(e.target.value)} className="border rounded px-2 py-1">
            {wards.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Trạng thái</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded px-2 py-1">
            <option value="Tất cả">Tất cả</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Ngưng">Ngưng</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Tìm tên</label>
          <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Nhập tên cơ sở" className="border rounded px-2 py-1" />
        </div>
        <div className="self-end">
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            📤 Xuất Excel
          </button>
        </div>
      </div>

      <div className="overflow-auto">
       <table className="min-w-full table-fixed border border-gray-300 text-sm">
  <thead className="bg-gray-100">
    <tr>
      {['Tên cơ sở','Mã số CS','Tỉnh/Thành phố','Phường/Xã','Địa chỉ','Người đại diện','SĐT','Kinh độ','Vĩ độ','Diện tích','Trạng thái','Mục đích nuôi','Hình thức nuôi','Ngày cấp mã','Ngày bắt đầu','Năm sinh','Số CMND','Ngày cấp CMND','Nơi cấp','Đăng ký'].map((col) => (
        <th
          key={col}
          className="border px-2 py-2 text-left font-semibold text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {paginatedStores.map((s, i) => (
      <tr
        key={s._id || i}
        className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
      >
        <td className="border px-2 py-2 truncate max-w-[160px]">{s.name}</td>
        <td className="border px-2 py-2 truncate">{s.code}</td>
        <td className="border px-2 py-2 truncate">{s.province}</td>
        <td className="border px-2 py-2 truncate">{s.ward}</td>
        <td className="border px-2 py-2 truncate max-w-[200px]">{s.address}</td>
        <td className="border px-2 py-2 truncate">{s.owner}</td>
        <td className="border px-2 py-2 truncate">{s.phone}</td>
        <td className="border px-2 py-2 truncate">{s.longitude}</td>
        <td className="border px-2 py-2 truncate">{s.latitude}</td>
        <td className="border px-2 py-2 truncate">{s.area}</td>
        <td className="border px-2 py-2 truncate">{s.active ? 'Đang hoạt động' : 'Ngưng'}</td>
        <td className="border px-2 py-2 truncate">{s.purpose}</td>
        <td className="border px-2 py-2 truncate">{s.farm_type}</td>
        <td className="border px-2 py-2 truncate">{s.license_date}</td>
        <td className="border px-2 py-2 truncate">{s.start_date}</td>
        <td className="border px-2 py-2 truncate">{s.birth_year}</td>
        <td className="border px-2 py-2 truncate">{s.id_number}</td>
        <td className="border px-2 py-2 truncate">{s.id_issue_date}</td>
        <td className="border px-2 py-2 truncate">{s.id_issue_place}</td>
        <td className="border px-2 py-2 truncate">{s.registration_status}</td>
      </tr>
    ))}
  </tbody>
</table>

      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        >
          ◀ Trước
        </button>
        <span className="px-2">Trang {currentPage} / {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 rounded border bg-white disabled:opacity-50"
        >
          Sau ▶
        </button>
      </div>
    </div>
  );
};

export default StoreListPage;
