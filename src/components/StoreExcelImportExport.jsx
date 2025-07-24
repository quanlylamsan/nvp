import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

const StoreExcelImportExport = () => {
  const fileInputRef = useRef();
  const [importedStores, setImportedStores] = useState([]);
  const [importSuccess, setImportSuccess] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const converted = data.map((row) => ({
        name: row['Tên cơ sở'] || '',
        province: row['Tỉnh/Thành phố'] || '',
        ward: row['Phường/Xã'] || '',
        address: `${row['Phường/Xã'] || ''}, ${row['Tỉnh/Thành phố'] || ''}`,
        owner: row['Người đại diện'] || '',
        phone: row['Số điện thoại cơ sở'] || '',
        longitude: row['Kinh độ'] || null,
        latitude: row['Vĩ độ'] || null,
        code: row['Mã số CS'] || '',
        license_date: row['Ngày cấp mã'] || '',
        purpose: row['Mục đích nuôi'] || '',
        farm_type: row['Hình thức nuôi'] || '',
        registration_status: row['Tình trạng đăng ký'] || '',
        active: row['Trạng thái'] === 'Đang hoạt động',
        start_date: row['Ngày bắt đầu nuôi'] || '',
        birth_year: row['Năm sinh'] || '',
        id_number: row['Số CMND/Căn cước CD/ Hộ chiếu'] || '',
        id_issue_date: row['Ngày cấp số CMND/CCCD/Hộ chiếu'] || '',
        id_issue_place: row['Nơi cấp số CMND/CCCD/Hộ chiếu'] || '',
        area: row['Diện tích truồng trại'] || null,
      }));

      setImportedStores(converted);
    };

    reader.readAsBinaryString(file);
  };

  const handleImportSubmit = async () => {
    try {
      const res = await axios.post('/api/stores/import', importedStores);
      setImportSuccess(true);
      alert('✅ Import thành công!');
    } catch (err) {
      console.error(err);
      setImportSuccess(false);
      alert('❌ Import thất bại!');
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/stores');
      const ws = XLSX.utils.json_to_sheet(res.data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stores');
      XLSX.writeFile(wb, 'DanhSachCuaHang.xlsx');
    } catch (err) {
      console.error('❌ Xuất thất bại:', err);
      alert('❌ Không thể xuất danh sách!');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>📁 Nhập / Xuất danh sách cửa hàng</h3>

      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {importedStores.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p>📌 Đã đọc: {importedStores.length} cửa hàng</p>
          <button onClick={handleImportSubmit}>📤 Gửi vào hệ thống</button>
        </div>
      )}

      <hr />

      <button onClick={handleExport}>⬇️ Xuất danh sách ra Excel</button>
    </div>
  );
};

export default StoreExcelImportExport;
