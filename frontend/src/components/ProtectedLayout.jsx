import React from 'react';
import { Navigate, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext'; // 1. Dùng hook bạn đã tạo
import logoKiemLam from '../assets/images/logo_kiemlam.png';
import bannerImage from '../assets/images/banner.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faEdit, faInfoCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import '../Dashboard.css';

// 2. Loại bỏ các props không cần thiết (token, role, handleLogout)
const ProtectedLayout = ({
  children,
  isSidebarOpen,
  toggleSidebar,
  sidebarRef,
  showUserProfileMenu,
  setShowUserProfileMenu,
  userMenuRef,
  hamburgerButtonRef,
}) => {
  // 3. Lấy state và hàm cập nhật từ context
  const { auth, setAuthStatus } = useAuth();

  // 4. Tạo hàm logout ngay tại đây
  const handleLogout = () => {
    // Gọi hàm setAuthStatus từ context để xóa thông tin đăng nhập
    setAuthStatus({
      isLoggedIn: false,
      user: null,
      role: null,
      token: null,
    });
  };

  // 5. Kiểm tra trạng thái đăng nhập từ `auth` object
  if (!auth.isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // Trường hợp dữ liệu user chưa tải xong
  if (!auth.user) {
    return <div>Đang tải...</div>;
  }

  return (
    <>
      {/* 6. Sử dụng dữ liệu trực tiếp từ `auth` object */}
      <Sidebar userRole={auth.role} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />

      <div className="main-layout-content logged-in">
        <div className="main-header-banner" style={{ '--banner-image-url': `url(${bannerImage})` }}>
          <div className="header-content-wrapper">
            <button className="hamburger-menu-button" onClick={toggleSidebar} ref={hamburgerButtonRef}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            <img src={logoKiemLam} alt="Logo Chi cục Kiểm Lâm" className="header-logo" />
            <div className="header-text">
              <h1>CHI CỤC KIỂM LÂM TỈNH ĐỒNG THÁP</h1>
              <h2>QUẢN LÝ LÂM SẢN</h2>
              <h3 translate="no">Software copyright: Nguyen Văn Phúc &copy;Ver 2025 1.0.0&copy;</h3>
            </div>
          </div>

          <div className={`user-profile-banner ${showUserProfileMenu ? 'open' : ''}`} ref={userMenuRef}>
            <div className="user-info-display" onClick={() => setShowUserProfileMenu(!showUserProfileMenu)}>
              <div className="user-avatar-banner">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="user-info-text-banner">
                {/* HIỂN THỊ TÊN VÀ VAI TRÒ TỪ `auth` OBJECT */}
                <span className="user-name-banner">{auth.user.name}</span>
                <span className="user-role-banner">{auth.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
              </div>
            </div>

            <div className="user-dropdown-menu">
              <NavLink to="/user-profile" className="dropdown-item" onClick={() => setShowUserProfileMenu(false)}>
                <FontAwesomeIcon icon={faInfoCircle} /> Thông tin cá nhân
              </NavLink>
              <NavLink to="/edit-profile" className="dropdown-item" onClick={() => setShowUserProfileMenu(false)}>
                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa hồ sơ
              </NavLink>
              <div className="dropdown-divider"></div>
              {/* Nút Đăng xuất giờ sẽ gọi hàm `handleLogout` đã định nghĩa ở trên */}
              <NavLink to="/" onClick={handleLogout} className="dropdown-item logout-item">
                <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
              </NavLink>
            </div>
          </div>
        </div>
        <div className="route-content-wrapper">{children}</div>
      </div>
    </>
  );
};

export default ProtectedLayout;