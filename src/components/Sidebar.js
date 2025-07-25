// src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Dashboard.css'; // Sử dụng CSS chung cho dashboard layout

function Sidebar({ userRole }) {
  const role = localStorage.getItem('role');
  const [openRegisterManage, setOpenRegisterManage] = useState(false);
  const [openStatsReport, setOpenStatsReport] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="https://placehold.co/50x50/000/FFF?text=User" alt="User Avatar" className="user-avatar" />
        <span className="user-role">{userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {/* Mục "Đăng ký và quản lý" (có thể mở rộng) */}
          <li className="sidebar-item">
            {/* Sử dụng thẻ <a> để tiêu đề menu con có định dạng giống các mục khác */}
            <a
              href="#" // Sử dụng href="#" và ngăn chặn hành vi mặc định để không điều hướng
              className={openRegisterManage ? 'open' : ''} // Thêm class 'open' khi menu mở
              onClick={(e) => {
                e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ a
                setOpenRegisterManage(!openRegisterManage); // Chuyển đổi trạng thái mở/đóng
              }}
            >
              <span className="menu-icon">
                {/* Icon cho Đăng ký và quản lý (Lucide clipboard-list SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 15h4"/><path d="M8 11h.01"/><path d="M8 15h.01"/></svg>
              </span>
              <span className="menu-text">Đăng ký và quản lý</span>
              <span className="arrow-icon">
                {/* Icon mũi tên để chỉ ra menu con, xoay khi mở */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down ${openRegisterManage ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </a>
            {/* Hiển thị menu con khi openRegisterManage là true */}
            {openRegisterManage && (
              <ul className="submenu">
                <li><Link to="/khai-bao">📄 Khai báo cơ sở</Link></li>
                {/* Cập nhật đường dẫn cho Quản lý cơ sở gỗ */}
				        <li><Link to="/admin/wood-farms">📝 Quản lý cơ sở gỗ</Link></li>
                {/* Cập nhật đường dẫn cho Quản lý cơ sở gây nuôi */}
				        <li><Link to="/admin/breeding-farms">📝 Quản lý cơ sở gây nuôi</Link></li>
             </ul>
            )}
          </li>

          {/* Mục "Thống kê và báo cáo" (có thể mở rộng) */}
          <li className="sidebar-item">
            {/* Sử dụng thẻ <a> cho tiêu đề menu con này */}
            <a
              href="#"
              className={openStatsReport ? 'open' : ''}
              onClick={(e) => {
                e.preventDefault();
                setOpenStatsReport(!openStatsReport);
              }}
            >
              <span className="menu-icon">
                {/* Icon cho Thống kê, báo cáo (Lucide bar-chart SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucude-bar-chart"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
              </span>
              <span className="menu-text">Thống kê, báo cáo</span>
              <span className="arrow-icon">
                {/* Icon mũi tên cho menu con, xoay khi mở */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down ${openStatsReport ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </a>
            {/* Hiển thị menu con khi openStatsReport là true */}
            {openStatsReport && (
              <ul className="submenu">
                <li><Link to="/stats-report/subA">📈 Các cơ sở gỗ</Link></li>
                <li><Link to="/stats-report/subB">📊 Các cơ sở gây nuôi</Link></li>
				<li><Link to="/bao-cao-tong-hop">Báo cáo Tổng hợp</Link></li>
              </ul>
            )}
          </li>

          {/* Các mục menu chính khác */}
          <li>
            <Link to="/dashboard">
              <span className="menu-icon">📊</span>
              <span className="menu-text">Dashboard</span>
            </Link>
		      <Link to="/google-maps">
              <span className="menu-icon">🗺️</span> {/* Icon bản đồ */}
			  <span className="menu-text">Điều hướng bản đồ</span>
            </Link>
          </li>
          {userRole === 'admin' && (
            <>
              <li>
                <Link to="/admin/users">
                  <span className="menu-icon">👥</span>
                  <span className="menu-text">Quản lý Người dùng</span>
                </Link>
              </li>
			  <Link to="/admin/users">
                  <span className="menu-icon">👥</span>
                  <span className="menu-text">Sao lưu dữ liệu</span>
                </Link>
              <li>
                <Link to="/admin/customers">
                  <span className="menu-icon">🧑‍🤝‍🧑</span>
                  <span className="menu-text">Quản lý Khách hàng</span>
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/logout">
              <span className="menu-icon">🚪</span>
              <span className="menu-text">Đăng xuất</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
