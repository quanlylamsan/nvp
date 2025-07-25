// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Đảm bảo đúng tên file CSS nếu không phải Sidebar.css

function Sidebar() {
  const role = localStorage.getItem('role');

  // State để quản lý trạng thái mở/đóng của từng menu con
  const [openRegisterManage, setOpenRegisterManage] = useState(false);
  const [openStatsReport, setOpenStatsReport] = useState(false);

  return (
    <div className="sidebar">
      <h3>📂 Menu</h3> {/* Đã thêm lại tiêu đề menu */}
      <ul> {/* THÊM LẠI THẺ <ul> NÀY */}
        
        {/* LIÊN KẾT ĐẾN TRANG KHAI BÁO */}
        

        {/* Mục Đăng ký và quản lý (có thể mở rộng) */}
        <li className="sidebar-item">
          {/* header của menu con */}
          <div
            className={`summary ${openRegisterManage ? 'open' : ''}`}
            onClick={() => setOpenRegisterManage(!openRegisterManage)}
          >
            {/* Icon cho Đăng ký và quản lý (lucide-clipboard-list) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 15h4"/><path d="M8 11h.01"/><path d="M8 15h.01"/></svg>
            Đăng ký và quản lý
          </div>
          {openRegisterManage && (
            <ul className="submenu">
              {/* Mục con Đăng ký 2 bây giờ là trang danh sách farm */}
			  <li><Link to="/khai-bao">📄 Khai báo cơ sở nuôi</Link></li>
              <li><Link to="/admin/farms">📝 Quản lý Cơ sở nuôi</Link></li>
			  <li><Link to="/khai-bao">📄 Đang chờ</Link></li>
              {/* Nếu có Mục con Đăng ký 1, bạn có thể thêm lại ở đây */}
              {/* <li><Link to="/register-manage/sub1">📄 Mục con Đăng ký 1</Link></li> */}
            </ul>
          )}
        </li>

        {/* Mục Thống kê và báo cáo (có thể mở rộng) */}
        <li className="sidebar-item">
          <div
            className={`summary ${openStatsReport ? 'open' : ''}`}
            onClick={() => setOpenStatsReport(!openStatsReport)}
          >
            {/* Icon cho Thống kê, báo cáo (lucide-bar-chart) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucude-bar-chart"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
            Thống kê, báo cáo
          </div>
          {openStatsReport && (
            <ul className="submenu">
              <li><Link to="/stats-report/subA">📈 Mục con Thống kê A</Link></li>
              <li><Link to="/stats-report/subB">📊 Mục con Thống kê B</Link></li>
            </ul>
          )}
        </li>

        {/* Các mục chỉ dành cho Admin */}
        {role === 'admin' && (
          <>
            <li><Link to="/admin/users">👤 Quản lý người dùng</Link></li>
            <li><Link to="/admin/customers">🏢 Quản lý khách hàng</Link></li>
          </>
        )}
        <li><Link to="/logout">🚪 Đăng xuất</Link></li>
      </ul> {/* ĐÓNG THẺ <ul> NÀY */}
    </div>
  );
}

export default Sidebar;