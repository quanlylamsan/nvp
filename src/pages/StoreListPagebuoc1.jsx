import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const StoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [importedStores, setImportedStores] = useState([]);

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
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '1rem',
};

const thTdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left',
};

const thStyle = {
  ...thTdStyle,
  backgroundColor: '#f0f0f0',
  fontWeight: 'bold',
};

const statusStyle = (active) => ({
  color: 'white',
  fontWeight: 'bold',
  padding: '4px 8px',
  borderRadius: '6px',
  backgroundColor: active ? '#28a745' : '#dc3545',
  display: 'inline-block',
});

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

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📥 Nhập danh sách cửa hàng từ Excel</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      {importedStores.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p>📦 Đã đọc {importedStores.length} dòng</p>
          <button onClick={handleImport}>📤 Gửi vào hệ thống</button>
        </div>
      )}

      <hr />
      <h3>📋 Danh sách cửa hàng</h3>
      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <th>Tên cơ sở</th>
            <th>Mã số CS</th>
            <th>Tỉnh/Thành phố</th>
            <th>Phường/Xã</th>
            <th>Địa chỉ</th>
            <th>Người đại diện</th>
            <th>SĐT</th>
            <th>Kinh độ</th>
            <th>Vĩ độ</th>
            <th>Diện tích</th>
            <th>Trạng thái</th>
            <th>Mục đích nuôi</th>
            <th>Hình thức nuôi</th>
            <th>Ngày cấp mã</th>
            <th>Ngày bắt đầu</th>
            <th>Năm sinh</th>
            <th>Số CMND</th>
            <th>Ngày cấp CMND</th>
            <th>Nơi cấp</th>
            <th>Đăng ký</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s, i) => (
            <tr key={s._id || i}>
              <td>{s.name}</td>
              <td>{s.code}</td>
              <td>{s.province}</td>
              <td>{s.ward}</td>
              <td>{s.address}</td>
              <td>{s.owner}</td>
              <td>{s.phone}</td>
              <td>{s.longitude}</td>
              <td>{s.latitude}</td>
              <td>{s.area}</td>
              <td>{s.active ? '✅ Đang hoạt động' : '❌ Ngưng'}</td>
              <td>{s.purpose}</td>
              <td>{s.farm_type}</td>
              <td>{s.license_date}</td>
              <td>{s.start_date}</td>
              <td>{s.birth_year}</td>
              <td>{s.id_number}</td>
              <td>{s.id_issue_date}</td>
              <td>{s.id_issue_place}</td>
              <td>{s.registration_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoreListPage;
