// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const role = localStorage.getItem('role');

  return (
    <div className="sidebar">
      <h3>📂 Menu</h3>
      <ul>
        <li><Link to="/dashboard">🏠 Trang chủ</Link></li>
        {/* THÊM DÒNG NÀY ĐỂ LIÊN KẾT ĐẾN TRANG KHAI BÁO */}
        <li><Link to="/khai-bao">📄 Khai báo cơ sở nuôi</Link></li>
        {role === 'admin' && (
          <>
            <li><Link to="/admin/users">👤 Quản lý người dùng</Link></li>
            <li><Link to="/admin/customers">🏢 Quản lý khách hàng</Link></li>
          </>
        )}
        <li><Link to="/logout">🚪 Đăng xuất</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;